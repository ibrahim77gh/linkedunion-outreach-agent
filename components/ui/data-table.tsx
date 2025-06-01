// components/ui/data-table.tsx
"use client";

import * as React from "react";
import {
  ColumnDef,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select, // Import Select
    SelectContent, // Import SelectContent
    SelectItem, // Import SelectItem
    SelectTrigger, // Import SelectTrigger
    SelectValue, // Import SelectValue
} from "@/components/ui/select"; // Assuming this path for shadcn/ui select components
import { Loader2, MoreHorizontal } from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onDeleteUnion: (id: string) => void;
  onGenerateReport: (union: TData) => void;
  onGenerateLeads: (union: TData) => void;
  onEditUnion: (union: TData) => void;
  loading: boolean;

  pageIndex: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  onPaginationChange: (paginationState: { pageIndex: number; pageSize: number }) => void;
  onSearchChange: (value: string) => void;
  currentSearchValue: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onDeleteUnion,
  onGenerateReport,
  onGenerateLeads,
  onEditUnion,
  loading,
  pageIndex,
  pageSize,
  totalItems,
  totalPages,
  onPaginationChange,
  onSearchChange,
  currentSearchValue,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    pageCount: totalPages,
    manualPagination: true,
    manualFiltering: true,
    meta: {
      onDeleteUnion,
      onGenerateReport,
      onGenerateLeads,
      onEditUnion,
    },
  });

  return (
    <div className="rounded-md border">
      <div className="flex items-center py-4 px-4">
        <div className="relative flex-grow max-w-sm">
          <Input
            placeholder="Search by union name..."
            value={currentSearchValue}
            onChange={(event) => {
              onSearchChange(event.target.value);
            }}
            className="pr-8"
            disabled={loading && data.length === 0}
          />
          {loading && (
            <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-blue-500" />
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <MoreHorizontal className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {loading && data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                <Loader2 className="mx-auto h-6 w-6 animate-spin text-blue-600" />
                <p className="mt-2">Fetching data...</p>
              </TableCell>
            </TableRow>
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="flex items-center justify-between space-x-2 py-4 px-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {totalItems} total unions
        </div>

        <div className="flex items-center space-x-6 lg:space-x-8">
            {/* Page Size Selector (Optional, but good to include if you want this control) */}
            <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">Rows per page</p>
                <Select
                    value={`${pageSize}`}
                    onValueChange={(value) => {
                        onPaginationChange({ pageIndex: 0, pageSize: Number(value) }); // Reset to first page
                    }}
                >
                    <SelectTrigger className="h-8 w-[70px]">
                        <SelectValue placeholder={pageSize} />
                    </SelectTrigger>
                    <SelectContent side="top">
                        {[10, 20, 30, 40, 50].map((size) => (
                            <SelectItem key={size} value={`${size}`}>
                                {size}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Page Display and Selector */}
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                Page {pageIndex + 1} of {totalPages}
            </div>
            {totalPages > 0 && ( // Only show dropdown if there are pages
                <Select
                    value={`${pageIndex + 1}`} // Current page (1-indexed)
                    onValueChange={(value) => {
                        onPaginationChange({ pageIndex: Number(value) - 1, pageSize }); // Convert back to 0-indexed
                    }}
                >
                    <SelectTrigger className="h-8 w-[70px]">
                        <SelectValue placeholder={pageIndex + 1} />
                    </SelectTrigger>
                    <SelectContent side="top">
                        {Array.from({ length: totalPages }, (_, i) => (
                            <SelectItem key={i} value={`${i + 1}`}>
                                {i + 1}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}

            {/* Pagination Buttons */}
            <div className="flex items-center space-x-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPaginationChange({ pageIndex: pageIndex - 1, pageSize })}
                    disabled={pageIndex === 0 || loading}
                >
                    Previous
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPaginationChange({ pageIndex: pageIndex + 1, pageSize })}
                    disabled={pageIndex >= totalPages - 1 || loading}
                >
                    Next
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
}