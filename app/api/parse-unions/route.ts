import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { z } from "zod"
import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

const UnionSchema = z.object({
  name: z.string(),
  website: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  union_type: z.string().optional(),
  local_number: z.string().optional(),
  membership_info: z.string().optional(),
})

const ParsedUnionsSchema = z.object({
  unions: z.array(UnionSchema),
})

export async function POST(req: NextRequest) {
  try {
    const { markdownText, searchParams } = await req.json()

    // Parse the markdown text using AI SDK to extract structured data
    const { object: parsedData } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: ParsedUnionsSchema,
      prompt: `Parse the following markdown text containing union information and extract structured data for each union. 
      
      Extract the following fields for each union:
      - name: The full name of the union
      - website: The website URL (without markdown formatting)
      - email: Email address (without markdown formatting)
      - phone: Phone number
      - address: Physical address
      - union_type: Type of union (e.g., "Electrical Workers", "Steelworkers", etc.)
      - local_number: Local union number if mentioned (e.g., "Local 119", "Local 52")
      - membership_info: Any membership statistics or information
      
      Here's the markdown text to parse:
      
      ${markdownText}`,
    })

    const supabase = createServerSupabaseClient()

    // Save search result
    const { data: searchResultData, error: searchError } = await supabase
      .from("search_results")
      .insert({
        search_type: "location",
        search_params: searchParams,
        raw_results: markdownText,
        sources: searchParams.sources || [],
        unions_found: parsedData.unions.length,
      })
      .select()
      .single()

    if (searchError) {
      console.error("Error saving search result:", searchError)
    }

    // Save unions to database
    const unionsToInsert = parsedData.unions.map((union) => ({
      ...union,
      state: searchParams.state,
      country: searchParams.country,
    }))

    const { data: unionsData, error: unionsError } = await supabase.from("unions").insert(unionsToInsert).select()

    if (unionsError) {
      console.error("Error saving unions:", unionsError)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to save unions to database",
          parsedData,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      parsedUnions: parsedData.unions,
      savedUnions: unionsData,
      searchResultId: searchResultData?.id,
      message: `Successfully parsed and saved ${parsedData.unions.length} unions`,
    })
  } catch (error) {
    console.error("Parse unions error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to parse union data",
      },
      { status: 500 },
    )
  }
}
