// app/api/zoho/sync-leads/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';
import { getZohoTokens, saveZohoTokens } from '@/lib/db';
import { supabaseServiceRole } from '@/lib/supabase'; // Import the service role client

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

    // Refresh token if expired or near expiration (within 5 minutes)
    if (new Date() >= new Date(zohoTokens.access_token_expires_at.getTime() - 5 * 60 * 1000)) {
        console.log('Access token expired or near expiration. Refreshing...');
        zohoTokens.access_token = await refreshAccessToken(zohoTokens.refresh_token);
    }

    // Create a mapping array to track original leads with their index
    const leadsWithIndex = leads.map((lead, index) => ({ ...lead, originalIndex: index }));

    const dataForZoho = leadsWithIndex.map((lead: any) => ({
      Company: lead.company_name,
      Last_Name: lead.last_name,
      First_Name: lead.first_name,
      Email: lead.email_address,
      Phone: lead.phone_number,
      Website: lead.website_url,
      Street: lead.street,
      City: lead.city,
      State: lead.state,
      Zip_Code: lead.zip_code,
      Country: lead.country,
      Industry: lead.industry,
      Annual_Revenue: lead.annual_revenue,
      No_of_Employees: lead.no_of_employees,
      Lead_Source: lead.source_platform,
      Lead_Status: lead.status,
      Email_Opt_Out: lead.email_opt_out,
      Description: lead.notes,
    }));

    console.log(`Syncing ${dataForZoho.length} leads to Zoho CRM...`);

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

    console.log('Zoho API Response:', JSON.stringify(zohoResponse.data, null, 2));

    const successfulLeads = zohoResponse.data.data.filter((r: any) => r.status === 'success');
    const failedLeads = zohoResponse.data.data.filter((r: any) => r.status === 'error');

    console.log(`Successful leads: ${successfulLeads.length}, Failed leads: ${failedLeads.length}`);

    // Update successfully synced leads with their Zoho CRM ID in our database
    const updatePromises = [];
    
    for (let i = 0; i < successfulLeads.length; i++) {
      const zohoLeadResult = successfulLeads[i];
      const originalLead = leadsWithIndex[i]; // Use index-based mapping since Zoho returns results in the same order
      
      if (originalLead && zohoLeadResult.details && zohoLeadResult.details.id) {
        console.log(`Updating lead ${originalLead.id} with Zoho CRM ID: ${zohoLeadResult.details.id}`);
        
        const updatePromise = supabaseServiceRole
          .from('leads')
          .update({ zoho_crm_lead_id: zohoLeadResult.details.id })
          .eq('id', originalLead.id)
          .then(({ error }) => {
            if (error) {
              console.error(`Error updating lead ${originalLead.id} with Zoho CRM ID:`, error);
              return { success: false, leadId: originalLead.id, error };
            } else {
              console.log(`Successfully updated lead ${originalLead.id} with Zoho CRM ID: ${zohoLeadResult.details.id}`);
              return { success: true, leadId: originalLead.id, zohoId: zohoLeadResult.details.id };
            }
          });
        
        updatePromises.push(updatePromise);
      } else {
        console.warn(`Could not match lead at index ${i}:`, {
          zohoResult: zohoLeadResult,
          originalLead: originalLead ? { id: originalLead.id, email: originalLead.email_address } : null
        });
      }
    }

    // Wait for all database updates to complete
    const updateResults = await Promise.all(updatePromises);
    const successfulUpdates = updateResults.filter(result => result.success);
    const failedUpdates = updateResults.filter(result => !result.success);

    console.log(`Database updates completed: ${successfulUpdates.length} successful, ${failedUpdates.length} failed`);

    if (failedUpdates.length > 0) {
      console.error('Failed database updates:', failedUpdates);
    }

    return NextResponse.json({
      successfulLeadsCount: successfulLeads.length,
      failedLeadsCount: failedLeads.length,
      databaseUpdatesSuccessful: successfulUpdates.length,
      databaseUpdatesFailed: failedUpdates.length,
      failedDetails: failedLeads,
      failedUpdates: failedUpdates,
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