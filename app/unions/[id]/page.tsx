// app/unions/[id]/page.tsx
'use client';

import { useEffect, useState, useRef } from 'react'; // Import useRef
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database, Lead, Union } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Plus } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";

// Import the new LeadsTable component and its columns
import { LeadsTable } from "@/components/leads-table/leads-table";
import { leadsColumns } from "@/components/leads-table/columns";

 

const UnionDetailPage = ({ params }: any) => {
    const { id } = params;
    const [union, setUnion] = useState<Union | null>(null);
    const [loading, setLoading] = useState(true);
    const [generatingLeads, setGeneratingLeads] = useState(false);
    const [generatedLeads, setGeneratedLeads] = useState<Lead[]>([]);
    const [isSavingLeads, setIsSavingLeads] = useState(false);
    const [showSaveLeadsDialog, setShowSaveLeadsDialog] = useState(false);

    // LeadsTable pagination and search states (for generated leads, often simpler)
    // For generated leads, we typically don't paginate or search them,
    // but the LeadsTable component expects these props, so we provide defaults.
    const [generatedLeadsPageIndex, setGeneratedLeadsPageIndex] = useState(0);
    const [generatedLeadsPageSize, setGeneratedLeadsPageSize] = useState(10);
    const [generatedLeadsSearchValue, setGeneratedLeadsSearchValue] = useState('');
    const generatedLeadsTotalItems = generatedLeads.length;
    const generatedLeadsTotalPages = Math.ceil(generatedLeads.length / generatedLeadsPageSize);


    const supabase = createClientComponentClient<Database>();
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        const fetchUnion = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('unions')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                console.error("Error fetching union details:", error);
                toast({
                    title: "Error",
                    description: "Failed to load union details.",
                    variant: "destructive",
                });
                setUnion(null);
            } else if (data) {
                setUnion(data);
            } else {
                toast({
                    title: "Not Found",
                    description: "Union with this ID not found.",
                    variant: "destructive",
                });
                setUnion(null);
            }
            setLoading(false);
        };

        if (id) {
            fetchUnion();
        }
    }, [id, supabase, toast]);

    const handleGenerateLeads = async () => {
        if (!union) {
            toast({
                title: "Error",
                description: "Cannot generate leads: Union details not loaded.",
                variant: "destructive",
            });
            return;
        }

        setGeneratingLeads(true);
        setGeneratedLeads([]); // Clear previous leads
        toast({
            title: "Generating Leads",
            description: `AI is working to find leads for ${union.name}... This might take a moment.`,
        });

        try {
            const response = await fetch('/api/generate-leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    unionName: union.name,
                    unionType: union.union_type,
                    industry: union.industry,
                    state: union.state,
                    country: union.country,
                    unionId: union.id,
                }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.error || "Failed to generate leads from API.");
            }

            if (result.results && Array.isArray(result.results) && result.results.length > 0) {
                setGeneratedLeads(result.results);
                toast({
                    title: "Leads Generated!",
                    description: `Successfully generated ${result.results.length} potential leads. Review them below.`,
                    variant: "default",
                });
            } else {
                setGeneratedLeads([]);
                toast({
                    title: "No Leads Found",
                    description: "The AI did not find any new leads based on the union's information.",
                    variant: "default",
                });
            }

        } catch (error: unknown) {
            console.error("Error generating leads:", error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            toast({
                title: "Error",
                description: `Failed to generate leads: ${errorMessage}`,
                variant: "destructive",
            });
            setGeneratedLeads([]);
        } finally {
            setGeneratingLeads(false);
        }
    };

    const handleSaveGeneratedLeads = async () => {
        if (generatedLeads.length === 0) {
            toast({
                title: "No Leads to Save",
                description: "There are no generated leads to save.",
                variant: "info",
            });
            return;
        }

        setIsSavingLeads(true);
        setShowSaveLeadsDialog(false);

        let savedCount = 0;
        let updatedCount = 0;
        let errorCount = 0;
        let errors: string[] = [];

        for (const lead of generatedLeads) {
            try {
                // Check if lead already exists by email_address (if available and unique)
                // If email is null or not unique, you might need a more complex check
                let existingLeadId: string | null = null;
                if (lead.email_address) {
                    const { data: existingLead, error: fetchError } = await supabase
                        .from('leads')
                        .select('id')
                        .eq('email_address', lead.email_address)
                        .single();

                    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means "no rows found"
                        console.error("Error checking for existing lead by email:", fetchError);
                        errors.push(`Failed to check existing lead for ${lead.email_address || lead.company_name}: ${fetchError.message}`);
                        errorCount++;
                        continue;
                    }
                    if (existingLead) {
                        existingLeadId = existingLead.id;
                    }
                }

                if (existingLeadId) {
                    // Lead exists, update it
                    const { id, created_at, ...updates } = lead; // Exclude id and created_at for update
                    const { error: updateError } = await supabase
                        .from('leads')
                        .update({ ...updates, updated_at: new Date().toISOString() })
                        .eq('id', existingLeadId);

                    if (updateError) {
                        console.error("Error updating lead:", updateError);
                        errors.push(`Failed to update lead ${lead.email_address || lead.company_name}: ${updateError.message}`);
                        errorCount++;
                    } else {
                        updatedCount++;
                    }
                } else {
                    // Lead does not exist, insert new
                    const { id, ...newLeadData } = lead; // Ensure 'id' is not passed for new inserts
                    const { error: insertError } = await supabase
                        .from('leads')
                        .insert(newLeadData);

                    if (insertError) {
                        console.error("Error inserting new lead:", insertError);
                        errors.push(`Failed to insert new lead ${lead.email_address || lead.company_name}: ${insertError.message}`);
                        errorCount++;
                    } else {
                        savedCount++;
                    }
                }
            } catch (overallError: unknown) {
                console.error("Unexpected error during lead save/update:", overallError);
                const errorMessage = overallError instanceof Error ? overallError.message : String(overallError);
                errors.push(`Unexpected error for lead ${lead.email_address || lead.company_name}: ${errorMessage}`);
                errorCount++;
            }
        }

        if (savedCount > 0 || updatedCount > 0) {
            toast({
                title: "Leads Saved!",
                description: `Successfully created ${savedCount} new leads and updated ${updatedCount} existing leads.`,
                variant: "default",
            });
            setGeneratedLeads([]); // Clear generated leads after saving
        }
        if (errorCount > 0) {
            toast({
                title: "Partial Success with Errors",
                description: `Encountered ${errorCount} errors during lead saving. Some leads might not have been saved.`,
                variant: "default",
            });
            console.error("Lead saving errors:", errors);
        } else if (savedCount === 0 && updatedCount === 0) {
             toast({
                title: "No Leads Saved/Updated",
                description: "No leads were saved or updated, potentially due to errors.",
                variant: "destructive",
            });
        }
        setIsSavingLeads(false);
    };


    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-lg text-slate-700">Loading union details...</span>
            </div>
        );
    }

    if (!union) {
        return (
            <div className="space-y-4 text-center">
                <p className="text-lg text-red-600">Union not found.</p>
                <Button onClick={() => router.push('/unions')}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Unions
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-28">
            <Button variant="outline" onClick={() => router.push('/unions')}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Unions
            </Button>

            <Card>
                <CardHeader>
                    <CardTitle>{union.name}</CardTitle>
                    <CardDescription>Details for {union.name}</CardDescription>
                    <div className="mt-4 flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
                        <Button
                            onClick={handleGenerateLeads}
                            disabled={generatingLeads}
                        >
                            {generatingLeads ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Plus className="mr-2 h-4 w-4" />
                            )}
                            Generate Leads
                        </Button>
                        {/* Button to navigate to the saved leads page */}
                        <Button
                            variant="secondary"
                            onClick={() => router.push(`/unions/${union.id}/leads`)}
                        >
                            View Saved Leads
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-slate-600">Type:</p>
                        <p className="text-base">{union.union_type || 'N/A'}</p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-slate-600">Industry:</p>
                        <p className="text-base">{union.industry || 'N/A'}</p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-slate-600">State:</p>
                        <p className="text-base">{union.state || 'N/A'}</p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-slate-600">Country:</p>
                        <p className="text-base">{union.country || 'N/A'}</p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-slate-600">Phone:</p>
                        <p className="text-base">
                            {union.phone ? <a href={`tel:${union.phone}`} className="hover:underline text-blue-600">{union.phone}</a> : 'N/A'}
                        </p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-slate-600">Email:</p>
                        <p className="text-base">
                            {union.email ? <a href={`mailto:${union.email}`} className="hover:underline text-blue-600">{union.email}</a> : 'N/A'}
                        </p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-slate-600">Website:</p>
                        <p className="text-base">
                            {union.website ? (
                                <a href={union.website.startsWith('http') ? union.website : `http://${union.website}`} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-600">
                                    {union.website}
                                </a>
                            ) : 'N/A'}
                        </p>
                    </div>
                    <div className="space-y-2 col-span-1 md:col-span-2">
                        <p className="text-sm font-medium text-slate-600">Address:</p>
                        <p className="text-base">{union.address || 'N/A'}</p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-slate-600">Local Number:</p>
                        <p className="text-base">{union.local_number || 'N/A'}</p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-slate-600">Membership Info:</p>
                        <p className="text-base">{union.membership_info || 'N/A'}</p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-slate-600">Created At:</p>
                        <p className="text-base">{union.created_at ? new Date(union.created_at).toLocaleString() : 'N/A'}</p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-slate-600">Last Updated:</p>
                        <p className="text-base">{union.updated_at ? new Date(union.updated_at).toLocaleString() : 'N/A'}</p>
                    </div>
                </CardContent>
            </Card>

            {generatedLeads.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Generated Leads ({generatedLeads.length})</CardTitle>
                        <CardDescription>Review these AI-generated leads before saving them to your database.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <LeadsTable
                            columns={leadsColumns}
                            data={generatedLeads}
                            loading={generatingLeads} // Use generatingLeads for this table's loading state
                            pageIndex={generatedLeadsPageIndex}
                            pageSize={generatedLeadsPageSize}
                            totalItems={generatedLeadsTotalItems}
                            totalPages={generatedLeadsTotalPages}
                            onPaginationChange={({ pageIndex, pageSize }) => {
                                // For generated leads, we might not need full pagination
                                // but the component expects it. You can adjust logic here.
                                setGeneratedLeadsPageIndex(pageIndex);
                                setGeneratedLeadsPageSize(pageSize);
                            }}
                            onSearchChange={(value) => {
                                // For generated leads, search might just filter the current array
                                // or you might not need it at all.
                                setGeneratedLeadsSearchValue(value);
                            }}
                            currentSearchValue={generatedLeadsSearchValue}
                        />
                        <div className="flex justify-end mt-4">
                            <Button
                                onClick={() => setShowSaveLeadsDialog(true)}
                                disabled={isSavingLeads || generatedLeads.length === 0}
                            >
                                {isSavingLeads ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Plus className="mr-2 h-4 w-4" />
                                )}
                                Save {generatedLeads.length} Leads
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Save Leads Confirmation Dialog (unchanged) */}
            <Dialog open={showSaveLeadsDialog} onOpenChange={setShowSaveLeadsDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Saving Leads</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to save these {generatedLeads.length} leads to your database?
                            Duplicate leads will be updated based on their email address.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowSaveLeadsDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveGeneratedLeads} disabled={isSavingLeads}>
                            {isSavingLeads ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Confirm Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default UnionDetailPage;
