"use client"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Phone, Mail, MapPin, Users } from "lucide-react"
import type { Union } from "@/lib/supabase"

interface UnionDataTableProps {
  unions: Union[]
  isLoading?: boolean
}

export function UnionDataTable({ unions, isLoading = false }: UnionDataTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const toggleRow = (unionId: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(unionId)) {
      newExpanded.delete(unionId)
    } else {
      newExpanded.add(unionId)
    }
    setExpandedRows(newExpanded)
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Parsed Union Data</CardTitle>
          <CardDescription>Loading structured union information...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (unions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Parsed Union Data</CardTitle>
          <CardDescription>No unions parsed yet</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500">Parse search results to see structured union data here.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="w-5 h-5" />
          <span>Parsed Union Data ({unions.length} unions)</span>
        </CardTitle>
        <CardDescription>Structured union information extracted from search results</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {unions.map((union, index) => (
            <div key={union.id || index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg">{union.name}</h3>
                  {union.union_type && <Badge variant="secondary">{union.union_type}</Badge>}
                  {union.local_number && <Badge variant="outline">{union.local_number}</Badge>}
                </div>
                <Button variant="ghost" size="sm" onClick={() => toggleRow(union.id || index.toString())}>
                  {expandedRows.has(union.id || index.toString()) ? "Less" : "More"}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {union.phone && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="w-4 h-4 text-slate-500" />
                    <span>{union.phone}</span>
                  </div>
                )}
                {union.email && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="w-4 h-4 text-slate-500" />
                    <a href={`mailto:${union.email}`} className="text-blue-600 hover:underline">
                      {union.email}
                    </a>
                  </div>
                )}
                {union.website && (
                  <div className="flex items-center space-x-2 text-sm">
                    <ExternalLink className="w-4 h-4 text-slate-500" />
                    <a
                      href={union.website.startsWith("http") ? union.website : `https://${union.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {union.website}
                    </a>
                  </div>
                )}
              </div>

              {expandedRows.has(union.id || index.toString()) && (
                <div className="space-y-3 pt-3 border-t">
                  {union.address && (
                    <div className="flex items-start space-x-2 text-sm">
                      <MapPin className="w-4 h-4 text-slate-500 mt-0.5" />
                      <span>{union.address}</span>
                    </div>
                  )}
                  {union.membership_info && (
                    <div className="text-sm">
                      <span className="font-medium">Membership Info: </span>
                      <span className="text-slate-600">{union.membership_info}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
