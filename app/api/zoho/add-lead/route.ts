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
    // userId: 'some-user-id', // Pass user ID if applicable
  });

  return access_token;
}

export async function POST(request: Request) { 
  const { leads } = await request.json(); 

  if (!leads || !Array.isArray(leads) || leads.length === 0) {
    return NextResponse.json({ message: 'No leads provided for sync.' }, { status: 400 });
  }

  try {
    let zohoTokens = await getZohoTokens();

    if (!zohoTokens) {
      return NextResponse.json({ message: 'Zoho not connected. Please initiate OAuth first.' }, { status: 401 });
    }

    if (new Date() >= new Date(zohoTokens.access_token_expires_at.getTime() - 5 * 60 * 1000)) {
        console.log('Access token expired or near expiration. Refreshing...');
        zohoTokens.access_token = await refreshAccessToken(zohoTokens.refresh_token);
    }

   const dataForZoho = leads.map((lead: any) => ({
      Company: lead.company_name,  
      Last_Name: lead.name.split(' ').pop() || '',
      First_Name: lead.name.split(' ').slice(0, -1).join(' ') || lead.name,
      Email: lead.email_address, 
      Phone: lead.phone_number,
      Website: lead.website_url, 
    }));

    const zohoApiUrl = 'https://www.zohoapis.com/crm/v6/Leads';
    const zohoResponse = await axios.post(
      zohoApiUrl,
     { data: dataForZoho }, 
      {
        headers: {
          'Authorization': `Zoho-oauthtoken ${zohoTokens.access_token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const successfulLeads = zohoResponse.data.data.filter((r: any) => r.status === 'success');
    const failedLeads = zohoResponse.data.data.filter((r: any) => r.status === 'error');

    return NextResponse.json({
      successfulLeadsCount: successfulLeads.length,
      failedLeadsCount: failedLeads.length,
      failedDetails: failedLeads,
      message: 'Leads sync attempt completed.',
      zohoApiResponse: zohoResponse.data,
    }, { status: 200 });

  } catch (error: any) {
    console.error(
      'Error syncing leads to Zoho CRM:',
      error.response ? error.response.data : error.message
    );

    if (error.response && error.response.status === 401) {
        return NextResponse.json({
            message: 'Zoho CRM authorization failed. Please re-connect to Zoho.',
            error: error.response.data,
        }, { status: 401 });
    }

    return NextResponse.json({
      message: 'Failed to sync leads to Zoho CRM. Please check logs for details.',
      error: error.response ? error.response.data : error.message,
    }, { status: 500 });
  }
}