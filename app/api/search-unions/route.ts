import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { country, state, city, zipCode, unionType, industry } = await req.json();

    // Construct the search query with new optional fields
    let searchQuery = `labor unions in ${state}, ${country}`;
    if (city) {
      searchQuery += ` ${city}`;
    }
    if (zipCode) {
      searchQuery += ` ${zipCode}`;
    }
    if (unionType) {
      searchQuery += ` ${unionType}`;
    }
    if (industry) {
      searchQuery += ` ${industry} industry`;
    }
    searchQuery += ` contact information phone email address`;

    // Construct the prompt with new optional fields
    let prompt = `Search for labor unions in ${state}, ${country}`;
    if (city) {
      prompt += `, ${city}`;
    }
    if (zipCode) {
      prompt += `, zip code ${zipCode}`;
    }
    prompt += `. Focus on finding:\n- Union names and official websites\n- Contact information (phone numbers, email addresses)\n- Physical addresses\n- Membership information if available\n\nPlease provide at least 40 results as a valid JSON array where each union is an object with the following properties:\n- name: string (required)\n- website: string (optional)\n- phone: string (optional)\n- email: string (optional)\n- address: string (optional)\n- type: string (optional)\n- industry: string (optional)\n\nReturn ONLY the JSON array with no additional text or formatting. It's important to collect at least 50 unions that match the criteria if available.`;


    const { text, sources } = await generateText({
      model: openai.chat("o4-mini"),
      prompt: prompt, // Use the dynamically constructed prompt
      tools: {
        web_search_preview: openai.tools.webSearchPreview({
          searchContextSize: "high",
          userLocation: {
            type: "approximate",
            region: state, // Keeping state for broader regional context for the search tool
          },
        }),
      },
    });

    let results;
    try {
      results = JSON.parse(text);
      console.log("Parsed union data:", results);
    } catch (e) {
      console.error("Failed to parse AI response as JSON:", e);
      // If parsing fails, return the text as is and indicate failure
      return NextResponse.json({
        success: false,
        error: "AI response was not a valid JSON. Raw data received.",
        results: text, // Still return the raw text for debugging
        sources: sources || [],
        searchQuery,
      }, { status: 500 }); // Consider a different status if it's a parsing error
    }

    return NextResponse.json({
      success: true,
      results,
      sources: sources || [],
      searchQuery,
    });
  } catch (error) {
    console.error("Union search error:", error);
    return NextResponse.json({ success: false, error: "Failed to search for unions" }, { status: 500 });
  }
}