"use client";
import ReactMarkdown from "react-markdown";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "./ui/button";
import { SearchResult } from "./WebScraper";
import { Label } from "./ui/label";
import { ExternalLink } from "lucide-react";

interface MarkdownRendererProps {
  content: string;
  className?: string;
  handleParseAndSave: (searchResults: SearchResult) => Promise<void>;
  unionSearchResults?: SearchResult;
  isParsing?: boolean;
}

export function MarkdownRenderer({
  content,
  className = "",
  handleParseAndSave,
  unionSearchResults,
  isParsing,
}: MarkdownRendererProps) {
  return (
    <Card className={className}>
      <CardContent className="prose prose-sm max-w-none p-6">
        <CardTitle className="flex items-center justify-between mb-4">
          Search Actions
          <Button
            onClick={() =>
              handleParseAndSave(unionSearchResults as SearchResult)
            }
            disabled={isParsing}
            className="w-full flex items-center max-w-48 space-x-2"
          >
            <span>
              {isParsing ? "Parsing & Saving..." : "Save to Database"}
            </span>
          </Button>
        </CardTitle>
        <ReactMarkdown
          components={{
            h1: ({ children }) => (
              <h1 className="text-2xl font-bold mb-4">{children}</h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-xl font-semibold mb-3">{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-lg font-medium mb-2">{children}</h3>
            ),
            p: ({ children }) => (
              <p className="mb-3 leading-relaxed">{children}</p>
            ),
            ul: ({ children }) => (
              <ul className="list-disc pl-6 mb-4 space-y-1">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal pl-6 mb-4 space-y-1">{children}</ol>
            ),
            li: ({ children }) => <li className="mb-1">{children}</li>,
            strong: ({ children }) => (
              <strong className="font-semibold text-slate-900">
                {children}
              </strong>
            ),
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
              <code className="bg-slate-100 px-1 py-0.5 rounded text-sm font-mono">
                {children}
              </code>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
        <hr />
        {unionSearchResults && unionSearchResults.sources.length > 0 && (
          <div className="space-y-2">
            <Label>Sources:</Label>
            <div className="space-y-1">
              {unionSearchResults.sources.map((source, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 text-sm"
                >
                  <ExternalLink className="w-3 h-3" />
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {source.title || source.url}
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
