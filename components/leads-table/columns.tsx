// components/leads-table/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Lead } from "@/lib/supabase"; // Assuming Lead type is defined here or in a shared types file
import { CheckCircle, XCircle } from "lucide-react"; // Import icons for status

export const leadsColumns: ColumnDef<Lead>[] = [
  {
    accessorKey: "company_name",
    header: "Company Name",
    cell: ({ row }) => <div className="font-medium">{row.original.company_name}</div>,
  },
  {
    accessorFn: (row) => `${row.first_name || ''} ${row.last_name || ''}`.trim(),
    id: "contact_person",
    header: "Contact Person",
    cell: ({ row }) => {
      const fullName = `${row.original.first_name || ''} ${row.original.last_name || ''}`.trim();
      return <div>{fullName || 'N/A'}</div>;
    },
  },
  {
    accessorKey: "job_title",
    header: "Job Title",
    cell: ({ row }) => <div>{row.original.job_title || 'N/A'}</div>,
  },
  {
    accessorKey: "email_address",
    header: "Email",
    cell: ({ row }) => (
      <div>
        {row.original.email_address ? (
          <a href={`mailto:${row.original.email_address}`} className="text-blue-600 hover:underline">
            {row.original.email_address}
          </a>
        ) : 'N/A'}
      </div>
    ),
  },
  {
    accessorKey: "phone_number",
    header: "Phone",
    cell: ({ row }) => (
      <div>
        {row.original.phone_number ? (
          <a href={`tel:${row.original.phone_number}`} className="text-blue-600 hover:underline">
            {row.original.phone_number}
          </a>
        ) : 'N/A'}
      </div>
    ),
  },
  {
    accessorKey: "website_url",
    header: "Website",
    cell: ({ row }) => (
      <div>
        {row.original.website_url ? (
          <a
            href={row.original.website_url.startsWith('http') ? row.original.website_url : `http://${row.original.website_url}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Link
          </a>
        ) : 'N/A'}
      </div>
    ),
  },
  {
    accessorFn: (row) => `${row.city || ''}, ${row.state || ''}, ${row.country || ''}`.trim().replace(/^,/, '').replace(/,$/, '').replace(/,,/g, ','),
    id: "location",
    header: "Location",
    cell: ({ row }) => {
      const locationParts = [row.original.city, row.original.state, row.original.country].filter(Boolean);
      return <div>{locationParts.join(', ') || 'N/A'}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <div>{row.original.status || 'New'}</div>,
  },
  {
    accessorKey: "source_platform",
    header: "Source",
    cell: ({ row }) => <div>{row.original.source_platform || 'N/A'}</div>,
  },
  {
    accessorKey: "zoho_crm_lead_id", // This column will show sync status
    header: "Zoho Sync",
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        {row.original.zoho_crm_lead_id ? (
          <CheckCircle className="h-5 w-5 text-green-500" aria-label="Synced to Zoho" />
        ) : (
          <XCircle className="h-5 w-5 text-red-500" aria-label="Not Synced" />
        )}
      </div>
    ),
  },
];
