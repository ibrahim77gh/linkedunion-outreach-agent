"use client";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Globe, Search, Users } from "lucide-react"; // Removed Building and ExternalLink
import type { Union } from "@/lib/supabase"; // Assuming Union type is correctly defined here
import { canadianProvinces, usStates } from "./states";
import { UnionDataTable } from "./union-data-table/union-data-table";

export interface SearchResult {
  success: boolean; // Add success property to SearchResult interface
  results: Union[] | string; // 'results' can be Union[] if parsing is successful, or string if not
  sources: Array<{ url: string; title?: string }>;
  searchQuery: string;
  error?: string; // Add error property
}

export const WebScraper = () => {
  const { toast } = useToast();

  // Union Search State
  const [country, setCountry] = useState("US");
  const [state, setState] = useState("");
  const [unionType, setUnionType] = useState("");
  const [industry, setIndustry] = useState("");
  const [isSearchingUnions, setIsSearchingUnions] = useState(false);
  const [unionSearchResults, setUnionSearchResults] =
    useState<SearchResult | null>(null);
  const [searchProgress, setSearchProgress] = useState(0);
  const [isSaving, setIsSaving] = useState(false); // State for saving unions to Supabase
  const [city, setCity] = useState(""); // New: City state
  const [zipCode, setZipCode] = useState(""); // New: Zip Code state

  const handleUnionSearch = async () => {
    if (!state) {
      toast({
        title: "Error",
        description: "Please select a state to search for unions",
        variant: "destructive",
      });
      return;
    }

    setIsSearchingUnions(true);
    setUnionSearchResults(null);
    setSearchProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setSearchProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      const response = await fetch("/api/search-unions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          country,
          state,
          city, // Include city in search parameters
          zipCode, // Include zipCode in search parameters
          unionType,
          industry,
        }),
      });

      const data: SearchResult = await response.json();

      clearInterval(progressInterval);
      setSearchProgress(100);

      if (data.success) {
        setUnionSearchResults(data);
        toast({
          title: "Search Complete",
          description: `Found union information for ${state}`,
        });
      } else {
        throw new Error(data.error || "An unknown error occurred during search.");
      }
    } catch (error: unknown) {
      toast({
        title: "Search Failed",
        description: `Unable to search for unions. ${error instanceof Error ? error.message : ""}`,
        variant: "destructive",
      });
      console.error("Union search error:", error);
    } finally {
      setIsSearchingUnions(false);
    }
  };

  const handleSaveUnionsToSupabase = async () => {
    if (!unionSearchResults || !Array.isArray(unionSearchResults.results) || unionSearchResults.results.length === 0) {
      toast({
        title: "Error",
        description: "No union data to save. Please perform a search first.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const structuredUnions = unionSearchResults.results as Union[];
      const searchParams = { country, state, unionType, industry, sources: unionSearchResults.sources };

      const response = await fetch("/api/save-unions-to-db", { // New API endpoint
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unions: structuredUnions, searchParams }),
      });

      const data = await response.json();

      if (data.success) {
        toast({ title: "Save Successful", description: data.message });
        setUnionSearchResults(null); // Clear table after saving
      } else {
        throw new Error(data.error || "Failed to save unions to Supabase.");
      }
    } catch (error: unknown) {
      toast({
        title: "Save Failed",
        description: `Error saving unions: ${error instanceof Error ? error.message : "An unknown error occurred."}`,
        variant: "destructive",
      });
      console.error("Save unions error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Union Search Interface - Now full width */}
      <div className="grid grid-cols-1 gap-6"> {/* Removed lg:grid-cols-2 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Search Unions by Location</span>
            </CardTitle>
            <CardDescription>
              Find unions in a specific location with contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"> {/* Adjusted grid for more fields */}
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="US">United States</SelectItem>
                    <SelectItem value="Canada">Canada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State/Province</Label>
                <Select value={state} onValueChange={setState}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select state/province" />
                  </SelectTrigger>
                  <SelectContent>
                    {(country === "US" ? usStates : canadianProvinces).map(
                      (location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
              {/* New: City Input */}
              <div className="space-y-2">
                <Label htmlFor="city">City (Optional)</Label>
                <Input
                  id="city"
                  placeholder="e.g., New York"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={isSearchingUnions}
                />
              </div>
              {/* New: Zip Code Input */}
              <div className="space-y-2">
                <Label htmlFor="zip-code">Zip Code (Optional)</Label>
                <Input
                  id="zip-code"
                  placeholder="e.g., 10001"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  disabled={isSearchingUnions}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="union-type">Union Type (Optional)</Label>
                <Input
                  id="union-type"
                  placeholder="e.g., Trade, Public Sector, Healthcare"
                  value={unionType}
                  onChange={(e) => setUnionType(e.target.value)}
                  disabled={isSearchingUnions}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry (Optional)</Label>
                <Input
                  id="industry"
                  placeholder="e.g., Construction, Education, Transportation"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  disabled={isSearchingUnions}
                />
              </div>
            </div>

            {isSearchingUnions && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Searching for unions...</span>
                  <span>{searchProgress}%</span>
                </div>
                <Progress value={searchProgress} className="h-2" />
              </div>
            )}

            <Button
              onClick={handleUnionSearch}
              disabled={isSearchingUnions}
              className="w-full flex items-center space-x-2"
            >
              <Search className="w-4 h-4" />
              <span>
                {isSearchingUnions ? "Searching..." : "Search Unions"}
              </span>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Save Button and Search Results Table */}
      {unionSearchResults && Array.isArray(unionSearchResults.results) && unionSearchResults.results.length > 0 && (
        <div className="space-y-6">
          <Button
            onClick={handleSaveUnionsToSupabase}
            disabled={isSaving}
            className="w-fit flex items-center space-x-2"
          >
            <span>
              {isSaving ? "Saving..." : "Save Unions to Database"}
            </span>
          </Button>

          <UnionDataTable
            unions={unionSearchResults.results}
            isLoading={isSearchingUnions || isSaving}
          />
        </div>
      )}

      {/* Search Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="w-5 h-5" />
            <span>Web Search Capabilities</span>
          </CardTitle>
          <CardDescription>
            Powered by OpenAI&apos;s web search with real-time data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium">Union Search Features:</h4>
              <ul className="text-sm space-y-1 text-slate-600">
                <li>• Location-based union discovery</li>
                <li>• Contact information extraction</li>
                <li>• Industry-specific filtering</li>
                <li>• Real-time web search results</li>
                <li>• Optional city and zip code filtering</li> {/* Added this */}
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium">Deep Search Features:</h4>
              <ul className="text-sm space-y-1 text-slate-600">
                <li>• Comprehensive union profiles</li>
                <li>• Leadership and representative details</li>
                <li>• Social media and digital presence</li>
                <li>• Organizational structure information</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};