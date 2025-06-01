// lib/supabase.ts
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // For server-side operations


export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const supabaseServiceRole = createClient(supabaseUrl, serviceRoleKey);


// Server-side client for API routes
export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!


  return createClient(supabaseUrl, supabaseServiceKey)
}

export type Union = {
  id: string;
  name: string;
  website?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  union_type?: string | null;
  industry?: string | null;
  local_number?: string | null;
  state?: string | null;
  country?: string | null;
  membership_info?: string | null;
  created_at: string;
  updated_at: string;
};

export interface SearchResult {
  id?: string
  search_type: "location" | "deep"
  search_params: Record<string, unknown>
  raw_results: string
  sources: Array<{ url: string; title?: string }>
  unions_found: number
  created_at?: string
}

export interface Database {
  public: {
    Tables: {
      unions: {
        Row: {
          id: string;
          name: string;
          website: string | null;
          email: string | null;
          phone: string | null;
          address: string | null;
          union_type: string | null; // Matches DB column
          industry: string | null;   // Matches DB column
          local_number: string | null;
          membership_info: string | null;
          state: string | null;
          country: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          website?: string | null;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          union_type?: string | null;
          industry?: string | null;
          local_number?: string | null;
          membership_info?: string | null;
          state?: string | null;
          country?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          website?: string | null;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          union_type?: string | null;
          industry?: string | null;
          local_number?: string | null;
          membership_info?: string | null;
          state?: string | null;
          country?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      // ADD THE LEADS TABLE DEFINITION HERE
      leads: {
        Row: {
          id: string;
          created_at: string;
          first_name: string | null;
          last_name: string;
          company_name: string;
          email_address: string | null;
          phone_number: string | null;
          job_title: string | null;
          website_url: string | null;
          industry: string | null;
          notes: string | null;
          source_platform: string;
          status: string;
          email_opt_out: boolean;
          annual_revenue: number | null;
          no_of_employees: number | null;
          street: string | null;
          city: string | null;
          state: string | null;
          zip_code: string | null;
          country: string | null;
          zoho_crm_lead_id: string | null;
          union_id: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          first_name?: string | null;
          last_name: string;
          company_name: string;
          email_address?: string | null;
          phone_number?: string | null;
          job_title?: string | null;
          website_url?: string | null;
          industry?: string | null;
          notes?: string | null;
          source_platform?: string;
          status?: string;
          email_opt_out?: boolean;
          annual_revenue?: number | null;
          no_of_employees?: number | null;
          street?: string | null;
          city?: string | null;
          state?: string | null;
          zip_code?: string | null;
          country?: string | null;
          zoho_crm_lead_id?: string | null;
          union_id?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          first_name?: string | null;
          last_name?: string;
          company_name?: string;
          email_address?: string | null;
          phone_number?: string | null;
          job_title?: string | null;
          website_url?: string | null;
          industry?: string | null;
          notes?: string | null;
          source_platform?: string;
          status?: string;
          email_opt_out?: boolean;
          annual_revenue?: number | null;
          no_of_employees?: number | null;
          street?: string | null;
          city?: string | null;
          state?: string | null;
          zip_code?: string | null;
          country?: string | null;
          zoho_crm_lead_id?: string | null;
          union_id?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export interface Lead {
  id?: string; // UUID is optional when creating
  created_at?: string;
  first_name: string | null;
  last_name: string;
  company_name: string;
  email_address: string | null;
  phone_number: string | null;
  job_title: string | null;
  website_url: string | null;
  industry: string | null;
  notes: string | null;
  source_platform?: string; // Default 'My Software Platform'
  status?: string; // Default 'New'
  email_opt_out?: boolean; // Default false
  annual_revenue: number | null;
  no_of_employees: number | null;
  street: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  country: string | null;
  zoho_crm_lead_id: string | null;
  union_id: string | null; // This will link to the current union
}