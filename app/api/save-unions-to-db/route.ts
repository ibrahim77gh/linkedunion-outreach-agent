import { type NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";
import { z } from "zod";

// Define the schema for a single union object
// Ensure these match your Supabase 'unions' table column names
const UnionSchema = z.object({
  name: z.string(),
  website: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  type: z.string().optional(), // This 'type' from frontend input will map to 'union_type' in DB
  industry: z.string().optional(), // Now this column exists in your DB
});

const SavePayloadSchema = z.object({
  unions: z.array(UnionSchema),
  searchParams: z.object({
    country: z.string(),
    state: z.string(),
    city: z.string().optional(), // Added city
    zipCode: z.string().optional(), // Added zipCode
    unionType: z.string().optional(), // This 'unionType' from search params will be saved in search_results
    industry: z.string().optional(), // This 'industry' from search params will be saved in search_results
    sources: z.array(z.object({ url: z.string(), title: z.string().optional() })).optional(),
  }),
});

export async function POST(req: NextRequest) {
  try {
    const { unions, searchParams } = await req.json();

    const validationResult = SavePayloadSchema.safeParse({ unions, searchParams });

    if (!validationResult.success) {
      console.error("Invalid input data for saving unions:", validationResult.error);
      return NextResponse.json(
        {
          success: false,
          error: "Invalid input data provided for saving.",
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const validatedUnions = validationResult.data.unions;
    const validatedSearchParams = validationResult.data.searchParams;

    const supabase = createServerSupabaseClient();

    let successfullySavedCount = 0;
    let successfullyUpdatedCount = 0;
    let failedCount = 0;

    for (const union of validatedUnions) {
      // Check if a union with the same name already exists
      const { data: existingUnions, error: fetchError } = await supabase
        .from("unions")
        .select("id")
        .eq("name", union.name)
        .limit(1);

      if (fetchError) {
        console.error(`Error checking for existing union "${union.name}":`, fetchError);
        failedCount++;
        continue;
      }

      // Construct the data object to save/update, mapping 'type' to 'union_type'
      const unionDataToSave = {
        name: union.name,
        website: union.website,
        email: union.email,
        phone: union.phone,
        address: union.address,
        union_type: union.type, // Map 'type' from frontend to 'union_type' in DB
        industry: union.industry, // Now directly map 'industry'
        state: validatedSearchParams.state,
        country: validatedSearchParams.country,
        // local_number and membership_info are not coming from the search result,
        // so we omit them here or ensure they are present in the 'Union' type if needed.
      };

      if (existingUnions && existingUnions.length > 0) {
        // Union exists, update it
        const { error: updateError } = await supabase
          .from("unions")
          .update(unionDataToSave)
          .eq("id", existingUnions[0].id);

        if (updateError) {
          console.error(`Error updating union "${union.name}":`, updateError);
          failedCount++;
        } else {
          successfullyUpdatedCount++;
        }
      } else {
        // Union does not exist, insert it
        const { error: insertError } = await supabase
          .from("unions")
          .insert(unionDataToSave);

        if (insertError) {
          console.error(`Error inserting union "${union.name}":`, insertError);
          failedCount++;
        } else {
          successfullySavedCount++;
        }
      }
    }

    // You might also want to update your 'search_results' table schema
    // if you want to store city and zipCode in the search_params column.
    // Ensure the 'search_params' column is jsonb.
    const { data: searchResultData, error: searchError } = await supabase
      .from("search_results")
      .insert({
        search_type: "location",
        search_params: validatedSearchParams, // This now includes city, zipCode, unionType, industry
        raw_results: validatedUnions,
        sources: validatedSearchParams.sources || [],
        unions_found: validatedUnions.length,
      })
      .select()
      .single();

    if (searchError) {
      console.error("Error saving search result:", searchError);
    }

    return NextResponse.json({
      success: true,
      message: `Save complete: ${successfullySavedCount} new unions added, ${successfullyUpdatedCount} unions updated, ${failedCount} failed.`,
      newlyInsertedCount: successfullySavedCount,
      updatedCount: successfullyUpdatedCount,
      failedCount: failedCount,
      searchResultId: searchResultData?.id,
    });

  } catch (error) {
    console.error("Error in save-unions-to-db API:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "An unknown error occurred.",
      },
      { status: 500 }
    );
  }
}