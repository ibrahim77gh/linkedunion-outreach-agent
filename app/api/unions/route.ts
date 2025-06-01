// app/api/unions/route.ts
import { type NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase'; // Your server-side Supabase client

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const searchParams = req.nextUrl.searchParams;

    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10); // Default to 10 items per page
    const offset = (page - 1) * pageSize;
    const limit = pageSize;

    // Search/Filter parameter (e.g., by name)
    const searchQuery = searchParams.get('search') || '';

    // Sorting parameters
    const sortBy = searchParams.get('sortBy') || 'name'; // Default sort by name
    const sortOrder = searchParams.get('sortOrder') === 'desc' ? 'desc' : 'asc';

    let query = supabase
      .from('unions')
      .select('*', { count: 'exact' }); // Request exact count for pagination metadata

    // Apply search filter if present
    if (searchQuery) {
      // Supabase's ILIKE is case-insensitive
      query = query.ilike('name', `%${searchQuery}%`);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: unions, error, count } = await query;

    if (error) {
      console.error("Error fetching paginated unions:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: unions,
      pagination: {
        totalItems: count,
        currentPage: page,
        pageSize: pageSize,
        totalPages: count ? Math.ceil(count / pageSize) : 0,
      },
    });
  } catch (error) {
    console.error("API error fetching unions:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch unions" }, { status: 500 });
  }
}