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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, MoreHorizontal, Download } from "lucide-react";

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

  const downloadCSV = () => {
    // Get visible columns
    const visibleColumns = table.getAllLeafColumns()
      .filter(column => column.getIsVisible())
      .map(column => column.id);

    // Create CSV headers
    const headers = visibleColumns.join(',') + '\n';

    // Create CSV rows
    const rows = data.map(row => {
      return visibleColumns.map(columnId => {
        // @ts-ignore - We know the data exists
        const cellValue = row[columnId];
        // Escape quotes and wrap in quotes if contains commas
        const escapedValue = String(cellValue ?? '').replace(/"/g, '""');
        return escapedValue.includes(',') ? `"${escapedValue}"` : escapedValue;
      }).join(',');
    }).join('\n');

    // Combine headers and rows
    const csvContent = headers + rows;

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'unions.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="rounded-md border">
      <div className="flex items-center py-4 px-4">
        <div className="relative flex-grow max-w-sm">
          <Input
            placeholder="Search by union name..."
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

        <div className="flex space-x-2 ml-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={downloadCSV}
            disabled={loading || data.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
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
            {/* Page Size Selector */}
            <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">Rows per page</p>
                <Select
                    value={`${pageSize}`}
                    onValueChange={(value) => {
                        onPaginationChange({ pageIndex: 0, pageSize: Number(value) });
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