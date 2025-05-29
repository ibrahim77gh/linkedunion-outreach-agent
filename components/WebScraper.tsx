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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Globe, Search, Users, Building, ExternalLink } from "lucide-react";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { UnionDataTable } from "@/components/union-data-table";
import type { Union } from "@/lib/supabase";

export interface SearchResult {
  results: string;
  sources: Array<{ url: string; title?: string }>;
  searchQuery: string;
  unionName?: string;
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

  // Deep Search State
  const [unionName, setUnionName] = useState("");
  const [unionWebsite, setUnionWebsite] = useState("");
  const [isDeepSearching, setIsDeepSearching] = useState(false);
  const [deepSearchResults, setDeepSearchResults] =
    useState<SearchResult | null>(null);

  const [searchProgress, setSearchProgress] = useState(0);

  const [parsedUnions, setParsedUnions] = useState<Union[]>([]);
  const [isParsing, setIsParsing] = useState(false);

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
      // Progress simulation
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
          unionType,
          industry,
        }),
      });

      const data = await response.json();

      clearInterval(progressInterval);
      setSearchProgress(100);

      if (data.success) {
        setUnionSearchResults(data);
        toast({
          title: "Search Complete",
          description: `Found union information for ${state}`,
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: "Search Failed",
        description: "Unable to search for unions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearchingUnions(false);
    }
  };

  const handleDeepSearch = async () => {
    if (!unionName) {
      toast({
        title: "Error",
        description: "Please enter a union name for deep search",
        variant: "destructive",
      });
      return;
    }

    setIsDeepSearching(true);
    setDeepSearchResults(null);
    setSearchProgress(0);

    try {
      // Progress simulation
      const progressInterval = setInterval(() => {
        setSearchProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 8;
        });
      }, 600);

      const response = await fetch("/api/deep-search-union", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          unionName,
          website: unionWebsite,
        }),
      });

      const data = await response.json();

      clearInterval(progressInterval);
      setSearchProgress(100);

      if (data.success) {
        setDeepSearchResults(data);
        toast({
          title: "Deep Search Complete",
          description: `Found detailed information for ${unionName}`,
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: "Deep Search Failed",
        description: "Unable to perform deep search. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeepSearching(false);
    }
  };

  const handleParseAndSave = async (searchResults: SearchResult) => {
    setIsParsing(true);
    try {
      const response = await fetch("/api/parse-unions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          markdownText: searchResults.results,
          searchParams: {
            country,
            state,
            unionType,
            industry,
            sources: searchResults.sources,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        setParsedUnions(data.parsedUnions);
        toast({
          title: "Data Parsed & Saved",
          description: `Successfully parsed and saved ${data.parsedUnions.length} unions to database`,
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: "Parse Failed",
        description: "Unable to parse and save union data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsParsing(false);
    }
  };

  const usStates = [
    "Alabama",
    "Alaska",
    "Arizona",
    "Arkansas",
    "California",
    "Colorado",
    "Connecticut",
    "Delaware",
    "Florida",
    "Georgia",
    "Hawaii",
    "Idaho",
    "Illinois",
    "Indiana",
    "Iowa",
    "Kansas",
    "Kentucky",
    "Louisiana",
    "Maine",
    "Maryland",
    "Massachusetts",
    "Michigan",
    "Minnesota",
    "Mississippi",
    "Missouri",
    "Montana",
    "Nebraska",
    "Nevada",
    "New Hampshire",
    "New Jersey",
    "New Mexico",
    "New York",
    "North Carolina",
    "North Dakota",
    "Ohio",
    "Oklahoma",
    "Oregon",
    "Pennsylvania",
    "Rhode Island",
    "South Carolina",
    "South Dakota",
    "Tennessee",
    "Texas",
    "Utah",
    "Vermont",
    "Virginia",
    "Washington",
    "West Virginia",
    "Wisconsin",
    "Wyoming",
  ];

  const canadianProvinces = [
    "Alberta",
    "British Columbia",
    "Manitoba",
    "New Brunswick",
    "Newfoundland and Labrador",
    "Northwest Territories",
    "Nova Scotia",
    "Nunavut",
    "Ontario",
    "Prince Edward Island",
    "Quebec",
    "Saskatchewan",
    "Yukon",
  ];

  return (
    <div className="space-y-6">
      {/* Union Search Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
            <div className="grid grid-cols-2 gap-4">
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building className="w-5 h-5" />
              <span>Deep Search on Union</span>
            </CardTitle>
            <CardDescription>
              Get detailed information about a specific union
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="union-name">Union Name</Label>
              <Input
                id="union-name"
                placeholder="e.g., International Brotherhood of Teamsters"
                value={unionName}
                onChange={(e) => setUnionName(e.target.value)}
                disabled={isDeepSearching}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="union-website">Union Website (Optional)</Label>
              <Input
                id="union-website"
                placeholder="https://teamsters.org"
                value={unionWebsite}
                onChange={(e) => setUnionWebsite(e.target.value)}
                disabled={isDeepSearching}
              />
            </div>

            {isDeepSearching && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Deep searching union...</span>
                  <span>{searchProgress}%</span>
                </div>
                <Progress value={searchProgress} className="h-2" />
              </div>
            )}

            <Button
              onClick={handleDeepSearch}
              disabled={isDeepSearching}
              className="w-full flex items-center space-x-2"
            >
              <Search className="w-4 h-4" />
              <span>
                {isDeepSearching ? "Deep Searching..." : "Deep Search Union"}
              </span>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Search Results */}
      {unionSearchResults && (
        <div className="space-y-6">
          <div className="grid grid-cols-1">
            <MarkdownRenderer
              handleParseAndSave={handleParseAndSave}
              unionSearchResults={unionSearchResults}
              content={unionSearchResults.results}
              isParsing={isParsing}
              className="h-fit"
            />
          </div>

          <UnionDataTable unions={parsedUnions} isLoading={isParsing} />
        </div>
      )}

      {deepSearchResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building className="w-5 h-5" />
              <span>Deep Search Results</span>
            </CardTitle>
            <CardDescription>
              Detailed information for {deepSearchResults.unionName}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <MarkdownRenderer
              handleParseAndSave={handleParseAndSave}
              unionSearchResults={deepSearchResults}
              content={deepSearchResults.results}
              isParsing={isParsing}
              className="h-fit"
            />
          </CardContent>
        </Card>
      )}

      {/* Search Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="w-5 h-5" />
            <span>Web Search Capabilities</span>
          </CardTitle>
          <CardDescription>
            Powered by OpenAI's web search with real-time data
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
