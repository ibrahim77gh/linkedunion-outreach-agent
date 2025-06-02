// app/unions/[id]/leads/page.tsx
'use client';

import { useState, useEffect, useCallback, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { Lead } from "@/lib/supabase"; // Assuming Lead interface is defined here or imported
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, RefreshCw, Download } from "lucide-react";

import { LeadsTable } from "@/components/leads-table/leads-table";
import { leadsColumns } from "@/components/leads-table/columns";

interface UnionLeadsPageProps {
    params: Promise<{
        id: string;
    }>;
}

const UnionLeadsPage = ({ params }: UnionLeadsPageProps) => {
    const { id: unionId } = use(params);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState("");
    const [inputSearchValue, setInputSearchValue] = useState("");
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const { toast } = useToast();
    const router = useRouter();

    const [syncingToZoho, setSyncingToZoho] = useState(false); // State for sync button loading
    const [downloadingCSV, setDownloadingCSV] = useState(false); // State for download CSV button loading

    const fetchLeads = useCallback(async () => {
        if (!unionId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const params = new URLSearchParams({
                unionId: unionId,
                page: page.toString(),
                pageSize: pageSize.toString(),
                search: search,
            });

            const response = await fetch(`/api/leads?${params.toString()}`);
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.error || "Failed to fetch leads from API.");
            }

            setLeads(result.data);
            setTotalItems(result.pagination.totalItems);
            setTotalPages(result.pagination.totalPages);
        } catch (error: unknown) {
            console.error("Error fetching leads:", error);
            const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
            toast({
                title: "Error",
                description: `Failed to load leads: ${errorMessage}`,
                variant: "destructive",
            });
            setLeads([]);
            setTotalItems(0);
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    }, [unionId, page, pageSize, search, toast]);

    const handleSyncLeadsToZoho = async () => {
        setSyncingToZoho(true);
        const unsyncedLeads = leads.filter(lead => !lead.zoho_crm_lead_id);

        if (unsyncedLeads.length === 0) {
            toast({
                title: "No unsynced leads",
                description: "All leads are already synced to Zoho CRM.",
                variant: "default",
            });
            setSyncingToZoho(false);
            return;
        }

        try {
            const response = await fetch('/api/zoho/sync-leads', { // Call the new API route
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ leads: unsyncedLeads }),
            });

            const result = await response.json();

            if (response.ok) {
                toast({
                    title: "Sync successful!",
                    description: `Successfully synced ${result.successfulLeadsCount} leads to Zoho CRM. ${result.failedLeadsCount > 0 ? `(${result.failedLeadsCount} failed)` : ''}`,
                    variant: "default",
                });
                // Re-fetch leads to update the zoho_crm_lead_id in the UI
                fetchLeads();
            } else {
                throw new Error(result.message || "Failed to sync leads to Zoho.");
            }
        } catch (error: any) {
            console.error("Error syncing leads to Zoho:", error);
            toast({
                title: "Sync failed!",
                description: error.message || "An unexpected error occurred during sync.",
                variant: "destructive",
            });
        } finally {
            setSyncingToZoho(false);
        }
    };

    const handleDownloadCSV = async () => {
        if (leads.length === 0) {
            toast({
                title: "No leads to download",
                description: "There are no leads to export as CSV.",
                variant: "default",
            });
            return;
        }

        setDownloadingCSV(true);
        try {
            // Get all leads for CSV export (not just the current page)
            const params = new URLSearchParams({
                unionId: unionId,
                page: '1',
                pageSize: totalItems.toString(),
                search: search,
            });

            const response = await fetch(`/api/leads?${params.toString()}`);
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.error || "Failed to fetch leads for CSV export.");
            }

            const allLeads = result.data;

            // Prepare CSV content
            const headers = Object.keys(allLeads[0]).join(',');
            const rows = allLeads.map((lead: any) => 
                Object.values(lead).map(value => 
                    typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
                ).join(',')
            ).join('\n');

            const csvContent = `${headers}\n${rows}`;

            // Create download link
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `leads_union_${unionId}_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast({
                title: "Download successful",
                description: "Leads have been exported as CSV.",
                variant: "default",
            });
        } catch (error: any) {
            console.error("Error downloading CSV:", error);
            toast({
                title: "Download failed",
                description: error.message || "Failed to export leads as CSV.",
                variant: "destructive",
            });
        } finally {
            setDownloadingCSV(false);
        }
    };

    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);

    useEffect(() => {
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }
        debounceTimeoutRef.current = setTimeout(() => {
            if (inputSearchValue !== search) {
                setSearch(inputSearchValue);
                setPage(1);
            }
        }, 500);

        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, [inputSearchValue, search]);

    const handleLeadsTablePaginationChange = ({ pageIndex: newPageIndex, pageSize: newPageSize }: { pageIndex: number; pageSize: number }) => {
        setPage(newPageIndex + 1);
        setPageSize(newPageSize);
    };

    const handleLeadsTableSearchInputChange = (value: string) => {
        setInputSearchValue(value);
    };

    if (loading && leads.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-lg text-slate-700">Loading leads...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-28">
            <Button variant="outline" onClick={() => router.push(`/unions/${unionId}`)}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Union Details
            </Button>
            
            <div className="flex gap-2">
                <Button
                    onClick={handleSyncLeadsToZoho}
                    className="flex items-center space-x-2 w-fit"
                    disabled={syncingToZoho || leads.filter(lead => !lead.zoho_crm_lead_id).length === 0}
                >
                    {syncingToZoho ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <RefreshCw className="mr-2 h-4 w-4" />
                    )}
                    <span>Sync Unsynced Leads to Zoho ({leads.filter(lead => !lead.zoho_crm_lead_id).length})</span>
                </Button>

                <Button
                    onClick={handleDownloadCSV}
                    className="flex items-center space-x-2 w-fit"
                    disabled={downloadingCSV || leads.length === 0}
                    variant="outline"
                >
                    {downloadingCSV ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Download className="mr-2 h-4 w-4" />
                    )}
                    <span>Download as CSV</span>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Leads for Union ID: {unionId}</CardTitle>
                    <CardDescription>
                        View and manage all saved leads associated with this union.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <LeadsTable
                        columns={leadsColumns}
                        data={leads}
                        loading={loading}
                        pageIndex={page - 1}
                        pageSize={pageSize}
                        totalItems={totalItems}
                        totalPages={totalPages}
                        onPaginationChange={handleLeadsTablePaginationChange}
                        onSearchChange={handleLeadsTableSearchInputChange}
                        currentSearchValue={inputSearchValue}
                    />
                </CardContent>
            </Card>
        </div>
    );
};

export default UnionLeadsPage;