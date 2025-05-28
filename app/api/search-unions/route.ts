import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { country, state, unionType, industry } = await req.json()

    const searchQuery = `labor unions in ${state}, ${country}${unionType ? ` ${unionType}` : ""}${industry ? ` ${industry} industry` : ""} contact information phone email address`

    const { text, sources } = await generateText({
      model: openai.responses("gpt-4o-mini"),
      prompt: `Search for labor unions in ${state}, ${country}. Focus on finding:
      - Union names and official websites
      - Contact information (phone numbers, email addresses)
      - Physical addresses
      - Union type/industry they represent
      - Membership information if available
      
      Please provide a structured list of unions with their contact details.`,
      tools: {
        web_search_preview: openai.tools.webSearchPreview({
          searchContextSize: "high",
          userLocation: {
            type: "approximate",
            region: state,
          },
        }),
      },
    })

    return NextResponse.json({
      success: true,
      results: text,
      sources: sources || [],
      searchQuery,
    })
  } catch (error) {
    console.error("Union search error:", error)
    return NextResponse.json({ success: false, error: "Failed to search for unions" }, { status: 500 })
  }
}
