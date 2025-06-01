// app/unions/page.tsx
'use client';

import { useState, useEffect, useCallback } from "react";
import { Database, Union } from "@/lib/supabase"; // Assuming your Supabase types are here
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { columns } from "@/components/union-data-table/column";
import { DataTable } from "@/components/ui/data-table";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const UnionsPage = () => {
    const [unions, setUnions] = useState<Union[]>([]);
    const [loading, setLoading] = useState(true);
    const [, setIsDeleting] = useState(false);
    const [editingUnion, setEditingUnion] = useState<Union | null>(null);
    const [isSavingEdit, setIsSavingEdit] = useState(false);

    // Pagination and search states
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10); // Matches default in API
    const [search, setSearch] = useState("");
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const { toast } = useToast();
    const supabase = createClientComponentClient<Database>();

    // Use useCallback for fetchUnions as it's a dependency in useEffect
    const fetchUnions = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                pageSize: pageSize.toString(),
                search: search,
            });

            // console.log("Fetching unions with params:", params.toString()); // Debugging line

            const response = await fetch(`/api/unions?${params.toString()}`);
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.error || "Failed to fetch unions from API.");
            }

            setUnions(result.data);
            setTotalItems(result.pagination.totalItems);
            setTotalPages(result.pagination.totalPages);
        } catch (error: unknown) {
            console.error("Error fetching unions:", error);
            const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
            toast({
                title: "Error",
                description: `Failed to load unions: ${errorMessage}`,
                variant: "destructive",
            });
            setUnions([]);
            setTotalItems(0);
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    }, [page, pageSize, search, toast]); // Dependencies are crucial for useCallback and useEffect

    useEffect(() => {
        fetchUnions();
    }, [fetchUnions]); // fetchUnions changes when page, pageSize, or search changes, triggering re-fetch

    const handleDeleteUnion = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this union?")) {
            return;
        }
        setIsDeleting(true);
        const { error } = await supabase
            .from('unions')
            .delete()
            .eq('id', id);

        if (error) {
            console.error("Error deleting union:", error);
            toast({
                title: "Error",
                description: `Failed to delete union: ${error.message}`,
                variant: "destructive",
            });
        } else {
            toast({
                title: "Success",
                description: "Union deleted successfully. Refreshing data...",
            });
            fetchUnions(); // Re-fetch data to reflect changes
        }
        setIsDeleting(false);
    };

    const handleEditUnion = (union: Union) => {
        setEditingUnion({ ...union });
    };

    const handleSaveEdit = async () => {
        if (!editingUnion || !editingUnion.id) return;

        setIsSavingEdit(true);
        const { id, created_at, updated_at, ...updates } = editingUnion;
        const { error } = await supabase
            .from('unions')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id);

        if (error) {
            console.error("Error updating union:", error);
            toast({
                title: "Error",
                description: `Failed to update union: ${error.message}`,
                variant: "destructive",
            });
        } else {
            toast({
                title: "Success",
                description: "Union updated successfully. Refreshing data...",
            });
            setEditingUnion(null); // Close dialog
            fetchUnions(); // Re-fetch data to reflect changes
        }
        setIsSavingEdit(false);
    };

    const handleGenerateReport = (union: Union) => {
        toast({
            title: "Generating Report",
            description: `Initiating report generation for ${union.name}... (API integration pending)`,
        });
        console.log("Generate Report for:", union);
    };

    const handleGenerateLeads = (union: Union) => {
        toast({
            title: "Generating Leads",
            description: `Initiating lead generation for ${union.name}... (API integration pending)`,
        });
        console.log("Generate Leads for:", union);
    };

    // Consolidated onPaginationChange handler
    const handleDataTablePaginationChange = ({ pageIndex: newPageIndex, pageSize: newPageSize }: { pageIndex: number; pageSize: number }) => {
        // console.log("DataTable pagination change received:", { newPageIndex, newPageSize }); // Debugging line
        setPage(newPageIndex + 1); // Convert 0-indexed react-table pageIndex to 1-indexed for your state/API
        setPageSize(newPageSize);
        // fetchUnions will be called by useEffect due to state changes
    };

    const handleDataTableSearchChange = (value: string) => {
        // console.log("DataTable search change received:", value); // Debugging line
        setSearch(value);
        setPage(1); // Reset to first page on new search
        // fetchUnions will be called by useEffect due to state changes
    };

    if (loading && unions.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-lg text-slate-700">Loading unions...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>All Union Data</CardTitle>
                    <CardDescription>
                        Manage and view all collected union information.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={unions}
                        // Pass pagination and search props to DataTable
                        pageIndex={page - 1} // React-table uses 0-indexed pageIndex
                        pageSize={pageSize}
                        totalItems={totalItems}
                        totalPages={totalPages}
                        onPaginationChange={handleDataTablePaginationChange} // Use the new consolidated handler
                        onSearchChange={handleDataTableSearchChange}
                        // Pass the action handlers
                        onDeleteUnion={handleDeleteUnion}
                        onGenerateReport={handleGenerateReport}
                        onGenerateLeads={handleGenerateLeads}
                        onEditUnion={handleEditUnion}
                        loading={loading} 
                        currentSearchValue={""}                    
                    />
                </CardContent>
            </Card>

            {/* Edit Union Dialog (same as before) */}
            <Dialog open={!!editingUnion} onOpenChange={(open) => !open && setEditingUnion(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Union</DialogTitle>
                        <DialogDescription>
                            Make changes to the union details here. Click save when you&apos;re done.
                        </DialogDescription>
                    </DialogHeader>
                    {editingUnion && (
                        <div className="grid gap-4 py-4">
                            {/* ... (your input fields for editingUnion) ... */}
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                    Name
                                </Label>
                                <Input
                                    id="name"
                                    value={editingUnion.name || ''}
                                    onChange={(e) => setEditingUnion({ ...editingUnion, name: e.target.value })}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="type" className="text-right">
                                    Type
                                </Label>
                                <Input
                                    id="type"
                                    value={editingUnion.union_type || ''}
                                    onChange={(e) => setEditingUnion({ ...editingUnion, union_type: e.target.value })}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="industry" className="text-right">
                                    Industry
                                </Label>
                                <Input
                                    id="industry"
                                    value={editingUnion.industry || ''}
                                    onChange={(e) => setEditingUnion({ ...editingUnion, industry: e.target.value })}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="state" className="text-right">
                                    State
                                </Label>
                                <Input
                                    id="state"
                                    value={editingUnion.state || ''}
                                    onChange={(e) => setEditingUnion({ ...editingUnion, state: e.target.value })}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="country" className="text-right">
                                    Country
                                </Label>
                                <Input
                                    id="country"
                                    value={editingUnion.country || ''}
                                    onChange={(e) => setEditingUnion({ ...editingUnion, country: e.target.value })}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="phone" className="text-right">
                                    Phone
                                </Label>
                                <Input
                                    id="phone"
                                    value={editingUnion.phone || ''}
                                    onChange={(e) => setEditingUnion({ ...editingUnion, phone: e.target.value })}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="email" className="text-right">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    value={editingUnion.email || ''}
                                    onChange={(e) => setEditingUnion({ ...editingUnion, email: e.target.value })}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="website" className="text-right">
                                    Website
                                </Label>
                                <Input
                                    id="website"
                                    value={editingUnion.website || ''}
                                    onChange={(e) => setEditingUnion({ ...editingUnion, website: e.target.value })}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="address" className="text-right">
                                    Address
                                </Label>
                                <Textarea
                                    id="address"
                                    value={editingUnion.address || ''}
                                    onChange={(e) => setEditingUnion({ ...editingUnion, address: e.target.value })}
                                    className="col-span-3"
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingUnion(null)}>Cancel</Button>
                        <Button onClick={handleSaveEdit} disabled={isSavingEdit}>
                            {isSavingEdit ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Save changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default UnionsPage;