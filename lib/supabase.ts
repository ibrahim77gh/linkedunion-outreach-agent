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

export interface Union {
  id?: string
  name: string
  website?: string
  email?: string
  phone?: string
  address?: string
  union_type?: string
  local_number?: string
  membership_info?: string
  state?: string
  country?: string
  created_at?: string
  updated_at?: string
}

export interface SearchResult {
  id?: string
  search_type: "location" | "deep"
  search_params: Record<string, any>
  raw_results: string
  sources: Array<{ url: string; title?: string }>
  unions_found: number
  created_at?: string
}
