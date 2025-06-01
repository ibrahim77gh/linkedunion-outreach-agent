// components/leads-table/leads-table.tsx
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, MoreHorizontal } from "lucide-react";

interface LeadsTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  loading: boolean;

  // Props for server-side pagination and search (making it reusable)
  pageIndex: number; // 0-indexed current page
  pageSize: number;  // items per page
  totalItems: number; // Total number of items (from API count)
  totalPages: number; // Total number of pages (from API calculated totalPages)
  onPaginationChange: (paginationState: { pageIndex: number; pageSize: number }) => void;
  onSearchChange: (value: string) => void;
  currentSearchValue: string; // Controlled value for the search input

  // Optional: Add any specific action handlers if needed for the table itself
  // For example, if you want to enable editing/deleting leads directly from this table
  // onEditLead?: (lead: TData) => void;
  // onDeleteLead?: (id: string) => void;
}

export function LeadsTable<TData, TValue>({
  columns,
  data,
  loading,
  pageIndex,
  pageSize,
  totalItems,
  totalPages,
  onPaginationChange,
  onSearchChange,
  currentSearchValue,
}: LeadsTableProps<TData, TValue>) {
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
    manualPagination: true, // Crucial: tells react-table to not manage pagination itself
    manualFiltering: true, // Crucial: tells react-table to not manage filtering itself
    // meta: {
    //   // Pass any specific action handlers here if needed
    //   onEditLead,
    //   onDeleteLead,
    // },
  });

  return (
    <div className="rounded-md border">
      <div className="flex items-center py-4 px-4">
        <div className="relative flex-grow max-w-sm">
          <Input
            placeholder="Search leads by company or contact..."
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
                <p className="mt-2">Fetching leads...</p>
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
                No leads found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="flex items-center justify-between space-x-2 py-4 px-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {totalItems} total leads
        </div>

        <div className="flex items-center space-x-6 lg:space-x-8">
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
            {totalPages > 0 && (
                <Select
                    value={`${pageIndex + 1}`}
                    onValueChange={(value) => {
                        onPaginationChange({ pageIndex: Number(value) - 1, pageSize });
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
