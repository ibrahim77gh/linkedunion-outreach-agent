// app/api/dashboard/stats/route.ts
import { NextResponse } from 'next/server';
import { supabaseServiceRole } from '@/lib/supabase';
import { getZohoTokens } from '@/lib/db';
import axios from 'axios';

async function refreshAccessToken(refreshToken: string) {
  const ZOHO_CLIENT_ID = process.env.ZOHO_CLIENT_ID;
  const ZOHO_CLIENT_SECRET = process.env.ZOHO_CLIENT_SECRET;

  if (!ZOHO_CLIENT_ID || !ZOHO_CLIENT_SECRET) {
    throw new Error('Zoho API credentials are not configured for token refresh.');
  }

  const response = await axios.post(
    'https://accounts.zoho.com/oauth/v2/token',
    null,
    {
      params: {
        refresh_token: refreshToken,
        client_id: ZOHO_CLIENT_ID,
        client_secret: ZOHO_CLIENT_SECRET,
        grant_type: 'refresh_token',
      },
    }
  );

  return response.data.access_token;
}

async function getZohoStats(accessToken: string) {
  try {
    // Get leads count from Zoho
    const leadsResponse = await axios.get(
      'https://www.zohoapis.com/crm/v6/Leads?fields=id,Created_Time&per_page=1',
      {
        headers: {
          'Authorization': `Zoho-oauthtoken ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const totalZohoLeads = leadsResponse.data.info?.count || 0;

    // Get recent leads (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateFilter = thirtyDaysAgo.toISOString().split('T')[0];

    const recentLeadsResponse = await axios.get(
      `https://www.zohoapis.com/crm/v6/Leads?criteria=(Created_Time:greater_equal:${dateFilter})&fields=id&per_page=200`,
      {
        headers: {
          'Authorization': `Zoho-oauthtoken ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const recentZohoLeads = recentLeadsResponse.data.data?.length || 0;

    return {
      totalLeads: totalZohoLeads,
      recentLeads: recentZohoLeads,
      success: true
    };
  } catch (error) {
    console.error('Error fetching Zoho stats:', error);
    return {
      totalLeads: 0,
      recentLeads: 0,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function GET() {
  try {
    // Get Supabase stats
    const [unionsResult, leadsResult, syncedLeadsResult, searchResultsResult] = await Promise.all([
      // Total unions count
      supabaseServiceRole
        .from('unions')
        .select('id', { count: 'exact', head: true }),
      
      // Total leads count
      supabaseServiceRole
        .from('leads')
        .select('id', { count: 'exact', head: true }),
      
      // Synced leads count (leads with zoho_crm_lead_id)
      supabaseServiceRole
        .from('leads')
        .select('id', { count: 'exact', head: true })
        .not('zoho_crm_lead_id', 'is', null),
      
      // Search results count (if you have search_results table)
      supabaseServiceRole
        .from('search_results')
        .select('id', { count: 'exact', head: true })
        // .catch(() => ({ count: 0, error: null })) // Graceful fallback if table doesn't exist
    ]);

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [recentUnionsResult, recentLeadsResult] = await Promise.all([
      supabaseServiceRole
        .from('unions')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString()),
      
      supabaseServiceRole
        .from('leads')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString())
    ]);

    // Calculate growth percentages
    const totalUnions = unionsResult.count || 0;
    const totalLeads = leadsResult.count || 0;
    const syncedLeads = syncedLeadsResult.count || 0;
    const totalSearches = searchResultsResult.count || 0;
    
    const recentUnions = recentUnionsResult.count || 0;
    const recentLeads = recentLeadsResult.count || 0;

    // Calculate simple growth (you might want to make this more sophisticated)
    const unionsGrowth = totalUnions > 0 ? Math.round((recentUnions / totalUnions) * 100) : 0;
    const leadsGrowth = totalLeads > 0 ? Math.round((recentLeads / totalLeads) * 100) : 0;
    const syncRate = totalLeads > 0 ? Math.round((syncedLeads / totalLeads) * 100) : 0;

    // Try to get Zoho stats
    let zohoStats = { totalLeads: 0, recentLeads: 0, success: false };
    
    try {
      const zohoTokens = await getZohoTokens();
      if (zohoTokens) {
        // Check if token needs refresh
        if (new Date() >= new Date(zohoTokens.access_token_expires_at.getTime() - 5 * 60 * 1000)) {
          zohoTokens.access_token = await refreshAccessToken(zohoTokens.refresh_token);
        }
        zohoStats = await getZohoStats(zohoTokens.access_token);
      }
    } catch (error) {
      console.error('Error getting Zoho stats:', error);
    }

    // Get recent activity for the activity feed
    const recentActivityResult = await supabaseServiceRole
      .from('leads')
      .select('id, created_at, company_name, union_id, zoho_crm_lead_id')
      .order('created_at', { ascending: false })
      .limit(5);

    const recentActivity = recentActivityResult.data?.map(lead => ({
      action: lead.zoho_crm_lead_id ? "Lead synced to Zoho" : "New lead added",
      target: lead.company_name,
      status: lead.zoho_crm_lead_id ? "completed" : "pending",
      time: formatTimeAgo(new Date(lead.created_at)),
      id: lead.id
    })) || [];

    const stats = {
      totalUnions,
      totalLeads,
      syncedLeads,
      totalSearches,
      unionsGrowth,
      leadsGrowth,
      syncRate,
      zohoConnected: zohoStats.success,
      zohoTotalLeads: zohoStats.totalLeads,
      recentActivity
    };

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString();
}