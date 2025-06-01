// components/union-data-table/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Union } from "@/lib/supabase"; // Assuming your Union type is here
import Link from "next/link";

export const columns: ColumnDef<Union>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Union Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const union = row.original;
      return (
        <Link href={`/unions/${union.id}`} className="hover:underline text-blue-600">
          {union.name}
        </Link>
      );
    },
  },
  {
    accessorKey: "union_type",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Type
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "industry",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Industry
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "state",
    header: "State",
  },
  {
    accessorKey: "country",
    header: "Country",
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => {
      const phone = row.getValue("phone") as string;
      return phone ? <a href={`tel:${phone}`} className="hover:underline text-blue-600">{phone}</a> : "N/A";
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      const email = row.getValue("email") as string;
      return email ? <a href={`mailto:${email}`} className="hover:underline text-blue-600">{email}</a> : "N/A";
    },
  },
  {
    accessorKey: "website",
    header: "Website",
    cell: ({ row }) => {
      const website = row.getValue("website") as string;
      return website ? (
        <a href={website.startsWith('http') ? website : `http://${website}`} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-600">
          Link
        </a>
      ) : "N/A";
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const union = row.original;
      // Accessing functions passed via table.options.meta (see DataTable component)
      const { onDeleteUnion, onGenerateReport, onGenerateLeads, onEditUnion } = table.options.meta as {
          onDeleteUnion: (id: string) => void;
          onGenerateReport: (union: Union) => void;
          onGenerateLeads: (union: Union) => void;
          onEditUnion: (union: Union) => void;
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(union.id)}>
              Copy Union ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEditUnion(union)}>Edit Union</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDeleteUnion(union.id)} className="text-red-600">
              Delete Union
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onGenerateReport(union)}>Generate Report</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onGenerateLeads(union)}>Generate Leads</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];