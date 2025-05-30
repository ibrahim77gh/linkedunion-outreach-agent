import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { unionName } = await req.json()

    const searchQuery = `${unionName} union contact information leadership representatives social media`

    const { text, sources } = await generateText({
      model: openai.responses("gpt-4o-mini"),
      prompt: `Perform a comprehensive search for detailed information about "${unionName}" union. Find:
      
      CONTACT INFORMATION:
      - Main office phone numbers
      - Email addresses (general, leadership, membership)
      - Physical addresses of offices/headquarters
      - Fax numbers if available
      
      LEADERSHIP & REPRESENTATIVES:
      - Union president/leader names
      - Executive board members
      - Local representatives
      - Contact information for key personnel
      - Email of the representatives
      
      DIGITAL PRESENCE:
      - Official website
      - Social media accounts (Facebook, Twitter, LinkedIn, Instagram)
      - YouTube channels
      - Newsletter/blog links
      
      ORGANIZATIONAL DETAILS:
      - Union local numbers
      - Affiliated national/international unions
      - Industries/sectors represented
      - Membership size if available
      
      Please provide detailed, accurate, and up-to-date information with sources.`,
      tools: {
        web_search_preview: openai.tools.webSearchPreview({
          searchContextSize: "high",
        }),
      },
    })

    return NextResponse.json({
      success: true,
      results: text,
      sources: sources || [],
      searchQuery,
      unionName,
    })
  } catch (error) {
    console.error("Deep union search error:", error)
    return NextResponse.json({ success: false, error: "Failed to perform deep search on union" }, { status: 500 })
  }
}
