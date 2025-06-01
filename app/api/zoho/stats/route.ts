// app/api/zoho/stats/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';
import { getZohoTokens, saveZohoTokens } from '@/lib/db';

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

  const { access_token, expires_in } = response.data;
  const expiresAt = new Date(Date.now() + expires_in * 1000);

  await saveZohoTokens({
    refresh_token: refreshToken,
    access_token,
    access_token_expires_at: expiresAt,
  });

  return access_token;
}

export async function GET() {
  try {
    let zohoTokens = await getZohoTokens();

    if (!zohoTokens) {
      return NextResponse.json({ 
        success: false,
        message: 'Zoho not connected. Please initiate OAuth first.' 
      }, { status: 401 });
    }

    // Refresh token if expired or near expiration (within 5 minutes)
    if (new Date() >= new Date(zohoTokens.access_token_expires_at.getTime() - 5 * 60 * 1000)) {
      console.log('Access token expired or near expiration. Refreshing...');
      zohoTokens.access_token = await refreshAccessToken(zohoTokens.refresh_token);
    }

    // Get basic lead statistics
    const leadsResponse = await axios.get(
      'https://www.zohoapis.com/crm/v6/Leads?fields=id,Created_Time,Lead_Status&per_page=200',
      {
        headers: {
          'Authorization': `Zoho-oauthtoken ${zohoTokens.access_token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const leads = leadsResponse.data.data || [];
    const totalCount = leadsResponse.data.info?.count || leads.length;

    // Calculate statistics
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const recentLeads = leads.filter((lead: any) => {
      const createdDate = new Date(lead.Created_Time);
      return createdDate >= thirtyDaysAgo;
    });

    const weeklyLeads = leads.filter((lead: any) => {
      const createdDate = new Date(lead.Created_Time);
      return createdDate >= sevenDaysAgo;
    });

    // Group by status
    const statusGroups = leads.reduce((acc: any, lead: any) => {
      const status = lead.Lead_Status || 'Unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const stats = {
      totalLeads: totalCount,
      recentLeads: recentLeads.length,
      weeklyLeads: weeklyLeads.length,
      statusBreakdown: statusGroups,
      connected: true,
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error: any) {
    console.error('Error fetching Zoho stats:', error);

    if (error.response && error.response.status === 401) {
      return NextResponse.json({
        success: false,
        message: 'Zoho CRM authorization failed. Please re-connect to Zoho.',
        error: error.response.data,
      }, { status: 401 });
    }

    return NextResponse.json({
      success: false,
      message: 'Failed to fetch Zoho CRM statistics.',
      error: error.response ? error.response.data : error.message,
    }, { status: 500 });
  }
}