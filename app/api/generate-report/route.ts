// app/api/generate-report/route.ts
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { unionName, state, country, city, zipCode, unionType, industry } = await req.json();

    // Server-side validation
    if (!unionName || !state || !country) {
      return NextResponse.json(
        { success: false, error: "Union Name, State, and Country are required." },
        { status: 400 }
      );
    }

    // Construct a detailed prompt for the AI
    let prompt = `Generate a comprehensive report in Markdown format about the labor union "${unionName}"`;

    if (city) {
      prompt += ` located in ${city}, ${state}, ${country}.`;
    } else {
      prompt += ` located in ${state}, ${country}.`;
    }

    if (zipCode) {
      prompt += ` Its zip code is ${zipCode}.`;
    }
    if (unionType) {
      prompt += ` It is a ${unionType} type of union.`;
    }
    if (industry) {
      prompt += ` It operates in the ${industry} industry.`;
    }

    prompt += `

The report should cover the following sections:

## 1. Overview and Mission
- What is the union's primary purpose and mission?
- What industries or types of workers does it represent?
- What are its core values or guiding principles?

## 2. Key Activities and Services
- What are its main activities (e.g., collective bargaining, advocacy, training, member services)?
- What specific services does it provide to its members?
- Any notable campaigns, strikes, or achievements?

## 3. Contact Information
- Official Website (if available)
- Primary Phone Number (if available)
- Email Address (if available)
- Main Physical Address (street, city, state, zip, country)

## 4. Membership and Structure (if publicly available)
- Approximate number of members or membership demographics.
- Information about its leadership or organizational structure.
- Any affiliations with larger national or international labor organizations.

## 5. Recent News and Initiatives
- Highlight any significant recent news, projects, or initiatives.
- Mention current challenges or focuses.

## 6. LEADERSHIP & REPRESENTATIVES:
- Union president/leader names
- Executive board members
- Local representatives
- Contact information for key personnel

Ensure the report is well-structured, easy to read, and uses Markdown headings, bullet points, and bold text where appropriate. Provide "N/A" if information is not found.
`;

    // Set userLocation for the web search tool
    const userLocation = {
      type: "approximate" as const,
      region: state, // Use state for more relevant local search results
      country: country,
    };

    const { text, sources } = await generateText({
      model: openai.chat("o4-mini"),
      prompt: prompt,
      tools: {
        web_search_preview: openai.tools.webSearchPreview({
          searchContextSize: "high",
          userLocation: userLocation,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      reportContent: text, // The AI's response in Markdown
      sources: sources || [], // Include sources for transparency/debugging
    });
  } catch (error) {
    console.error("Generate Report API error:", error);
    return NextResponse.json({ success: false, error: "Failed to generate report" }, { status: 500 });
  }
}
