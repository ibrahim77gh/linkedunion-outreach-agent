// app/api/generate-leads/route.ts
import { Lead } from "@/lib/supabase";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { unionName, unionType, industry, state, country, unionId } = await req.json();

    if (!unionName || !state || !country || !unionId) {
      return NextResponse.json(
        { success: false, error: "Missing required union details for lead generation." },
        { status: 400 }
      );
    }

    let prompt = `Generate a list of potential leads (individuals or businesses) associated with "${unionName}"`;

    if (unionType) {
      prompt += `, which is a ${unionType} type of union`;
    }
    if (industry) {
      prompt += ` operating in the ${industry} industry`;
    }
    prompt += ` based in ${state}, ${country}.`;

    prompt += `
Each lead should be an object with the following properties, focusing on current employees, key personnel, or affiliated companies:
- first_name: string (optional, but try to find)
- last_name: string (required if individual, or best guess if company person)
- company_name: string (required, should be related to the union or be the union itself)
- email_address: string (optional, high priority to find)
- phone_number: string (optional, high priority to find)
- job_title: string (optional, e.g., "President", "Organizer", "HR Manager")
- website_url: string (optional, company or union website)
- industry: string (optional, derived from union's industry if not specific to lead)
- notes: string (optional, any relevant details)
- street: string (optional, related to the company/union address)
- city: string (optional)
- state: string (optional)
- zip_code: string (optional)
- country: string (required, should be ${country})
- annual_revenue: numeric (optional, estimate if possible)
- no_of_employees: integer (optional, estimate if possible)

Generate at least 10 high-quality leads, up to a maximum of 20, as a JSON array. Ensure the 'union_id' field is set to "${unionId}" for all generated leads. The 'last_name' and 'company_name' fields are required. If a specific individual's first_name and last_name aren't available, focus on high-level contacts for the company.
Return ONLY the JSON array with no additional text or formatting. Example structure:
[
  {
    "first_name": "John",
    "last_name": "Doe",
    "company_name": "ABC Union Local",
    "email_address": "john.doe@abcunion.org",
    "phone_number": "555-123-4567",
    "job_title": "Secretary",
    "website_url": "www.abcunion.org",
    "industry": "Construction",
    "notes": "Key contact for local negotiations.",
    "street": "123 Main St",
    "city": "Anytown",
    "state": "CA",
    "zip_code": "90210",
    "country": "USA",
    "annual_revenue": null,
    "no_of_employees": null,
    "union_id": "${unionId}"
  }
]`;

    const { text, sources } = await generateText({
      model: openai.chat("o4-mini"),
      prompt: prompt,
      tools: {
        web_search_preview: openai.tools.webSearchPreview({
          searchContextSize: "high",
          userLocation: {
            type: "approximate",
            region: state,
          },
        }),
      },
    });

    let generatedLeads: Lead[] = [];
    try {
      const parsedResults = JSON.parse(text);
      if (Array.isArray(parsedResults)) {
        generatedLeads = parsedResults.map(lead => ({
          ...lead,
          union_id: unionId, // Ensure union_id is consistently set from the request
          source_platform: lead.source_platform || 'AI Generated', // Default source
          status: lead.status || 'New', // Default status
          email_opt_out: lead.email_opt_out || false, // Default opt-out
        }));
      } else {
        console.error("AI response was not an array:", parsedResults);
        return NextResponse.json({
          success: false,
          error: "AI did not return a valid array of leads. Raw data received.",
          results: text,
          sources: sources || [],
        }, { status: 500 });
      }
    } catch (e) {
      console.error("Failed to parse AI response as JSON for leads:", e);
      return NextResponse.json({
        success: false,
        error: "AI response was not a valid JSON. Raw data received.",
        results: text,
        sources: sources || [],
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      results: generatedLeads,
      sources: sources || [],
    });
  } catch (error) {
    console.error("Generate Leads API error:", error);
    return NextResponse.json({ success: false, error: "Failed to generate leads" }, { status: 500 });
  }
}