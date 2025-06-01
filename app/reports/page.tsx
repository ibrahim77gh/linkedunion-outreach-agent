// app/reports/page.tsx
'use client';

import { useState, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, FileText, Download } from "lucide-react";
import ReactMarkdown from 'react-markdown'; // For rendering markdown

const ReportPage = () => {
  const [unionName, setUnionName] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [unionType, setUnionType] = useState('');
  const [industry, setIndustry] = useState('');

  const [generatedReport, setGeneratedReport] = useState<string | null>(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [formErrors, setFormErrors] = useState<{ unionName?: string; state?: string; country?: string }>({});

  const { toast } = useToast();

  // Ref for the specific div containing the markdown content to be printed
  const reportContentRef = useRef<HTMLDivElement>(null);

  const validateForm = useCallback(() => {
    const errors: { unionName?: string; state?: string; country?: string } = {};
    if (!unionName.trim()) {
      errors.unionName = "Union Name is required.";
    }
    if (!state.trim()) {
      errors.state = "State is required.";
    }
    if (!country.trim()) {
      errors.country = "Country is required.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [unionName, state, country]);

  const handleGenerateReport = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setGeneratingReport(true);
    setGeneratedReport(null); // Clear previous report
    toast({
      title: "Generating Report",
      description: "AI is compiling the report. This may take a moment...",
    });

    try {
      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unionName,
          state,
          country,
          city: city || undefined,
          zipCode: zipCode || undefined,
          unionType: unionType || undefined,
          industry: industry || undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to generate report from API.");
      }

      setGeneratedReport(result.reportContent);
      toast({
        title: "Report Generated!",
        description: "The union report is ready. Review it below.",
        variant: "default",
      });

    } catch (error: unknown) {
      console.error("Error generating report:", error);
      toast({
        title: "Error",
        description: `Failed to generate report: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      });
      setGeneratedReport(null);
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleDownloadPdf = async () => {
    console.log("Downloading PDF...");
  };

  return (
    <div className="space-y-6 pb-28">
      <Card>
        <CardHeader>
          <CardTitle>Generate Union Report</CardTitle>
          <CardDescription>
            Enter details to generate a comprehensive report on a union using AI.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unionName">Union Name <span className="text-red-500">*</span></Label>
              <Input
                id="unionName"
                value={unionName}
                onChange={(e) => { setUnionName(e.target.value); setFormErrors(prev => ({ ...prev, unionName: undefined })); }}
                placeholder="e.g., Teamsters Local 237"
              />
              {formErrors.unionName && <p className="text-red-500 text-sm">{formErrors.unionName}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State <span className="text-red-500">*</span></Label>
              <Input
                id="state"
                value={state}
                onChange={(e) => { setState(e.target.value); setFormErrors(prev => ({ ...prev, state: undefined })); }}
                placeholder="e.g., New York"
              />
              {formErrors.state && <p className="text-red-500 text-sm">{formErrors.state}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country <span className="text-red-500">*</span></Label>
              <Input
                id="country"
                value={country}
                onChange={(e) => { setCountry(e.target.value); setFormErrors(prev => ({ ...prev, country: undefined })); }}
                placeholder="e.g., USA"
              />
              {formErrors.country && <p className="text-red-500 text-sm">{formErrors.country}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City (Optional)</Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g., New York City"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zipCode">Zip Code (Optional)</Label>
              <Input
                id="zipCode"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                placeholder="e.g., 10001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unionType">Union Type (Optional)</Label>
              <Input
                id="unionType"
                value={unionType}
                onChange={(e) => setUnionType(e.target.value)}
                placeholder="e.g., Public Sector Union"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry (Optional)</Label>
              <Input
                id="industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g., Transportation"
              />
            </div>
          </div>
          <Button onClick={handleGenerateReport} disabled={generatingReport} className="w-full">
            {generatingReport ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileText className="mr-2 h-4 w-4" />
            )}
            Generate Report
          </Button>
        </CardContent>
      </Card>

      {generatedReport && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Report</CardTitle>
            <CardDescription>
              Review the AI-generated report below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* The ref is now on this div, and prose classes provide good spacing */}
            <div ref={reportContentRef} className="prose dark:prose-invert max-w-none p-4 border rounded-md">
              <ReactMarkdown>{generatedReport}</ReactMarkdown>
            </div>
            <div className="flex justify-end mt-4">
              <Button onClick={handleDownloadPdf} className="ml-auto">
                <Download className="mr-2 h-4 w-4" /> Download as PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReportPage;
