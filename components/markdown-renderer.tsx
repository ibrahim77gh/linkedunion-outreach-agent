"use client"
import ReactMarkdown from "react-markdown"
import { Card, CardContent } from "@/components/ui/card"

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  return (
    <Card className={className}>
      <CardContent className="prose prose-sm max-w-none p-6">
        <ReactMarkdown
          components={{
            h1: ({ children }) => <h1 className="text-2xl font-bold mb-4">{children}</h1>,
            h2: ({ children }) => <h2 className="text-xl font-semibold mb-3">{children}</h2>,
            h3: ({ children }) => <h3 className="text-lg font-medium mb-2">{children}</h3>,
            p: ({ children }) => <p className="mb-3 leading-relaxed">{children}</p>,
            ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-1">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-1">{children}</ol>,
            li: ({ children }) => <li className="mb-1">{children}</li>,
            strong: ({ children }) => <strong className="font-semibold text-slate-900">{children}</strong>,
            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                {children}
              </a>
            ),
            code: ({ children }) => (
              <code className="bg-slate-100 px-1 py-0.5 rounded text-sm font-mono">{children}</code>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </CardContent>
    </Card>
  )
}
