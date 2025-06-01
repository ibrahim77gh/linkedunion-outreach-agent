// app/api/leads/route.ts
import { type NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase'; // Your server-side Supabase client

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const searchParams = req.nextUrl.searchParams;

    // Required parameter: union_id to filter leads for a specific union
    const unionId = searchParams.get('unionId');
    if (!unionId) {
      return NextResponse.json({ success: false, error: "unionId is required" }, { status: 400 });
    }

    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10); // Default to 10 items per page
    const offset = (page - 1) * pageSize;
    const limit = pageSize;

    // Search/Filter parameter (e.g., by company_name, first_name, last_name, email_address)
    const searchQuery = searchParams.get('search') || '';

    // Sorting parameters
    // You can extend this to allow sorting by other lead properties
    const sortBy = searchParams.get('sortBy') || 'created_at'; // Default sort by creation date
    const sortOrder = searchParams.get('sortOrder') === 'desc' ? 'desc' : 'asc';

    let query = supabase
      .from('leads')
      .select('*', { count: 'exact' }) // Request exact count for pagination metadata
      .eq('union_id', unionId); // Crucial: Filter leads by the provided unionId

    // Apply search filter if present
    if (searchQuery) {
      // Supabase's ILIKE is case-insensitive. Use .or() for multiple fields.
      query = query.or(
        `company_name.ilike.%${searchQuery}%,` +
        `first_name.ilike.%${searchQuery}%,` +
        `last_name.ilike.%${searchQuery}%,` +
        `email_address.ilike.%${searchQuery}%`
      );
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: leads, error, count } = await query;

    if (error) {
      console.error("Error fetching paginated leads:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: leads,
      pagination: {
        totalItems: count,
        currentPage: page,
        pageSize: pageSize,
        totalPages: count ? Math.ceil(count / pageSize) : 0,
      },
    });
  } catch (error) {
    console.error("API error fetching leads:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch leads" }, { status: 500 });
  }
}
