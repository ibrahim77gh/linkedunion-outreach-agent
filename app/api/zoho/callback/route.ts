// app/api/zoho/callback/route.ts
import { NextResponse } from 'next/server'; // Import NextResponse for easier response handling
import axios from 'axios';
import { saveZohoTokens } from '@/lib/db';

// Use GET because Zoho redirects with the code in query parameters
export async function GET(request: Request) { // 'request' is a standard Web Request object
  const { searchParams } = new URL(request.url);
  const grantToken = searchParams.get('code');

  const ZOHO_CLIENT_ID = process.env.ZOHO_CLIENT_ID;
  const ZOHO_CLIENT_SECRET = process.env.ZOHO_CLIENT_SECRET;
  const ZOHO_REDIRECT_URI = process.env.ZOHO_REDIRECT_URI;

  if (!grantToken) {
    return NextResponse.json({ message: 'Authorization code not received from Zoho.' }, { status: 400 });
  }

  if (!ZOHO_CLIENT_ID || !ZOHO_CLIENT_SECRET || !ZOHO_REDIRECT_URI) {
    return NextResponse.json({ message: 'Zoho API credentials are not configured.' }, { status: 500 });
  }

  try {
    const response = await axios.post(
      'https://accounts.zoho.com/oauth/v2/token',
      null, // Body is null for application/x-www-form-urlencoded with params
      {
        params: {
          code: grantToken,
          client_id: ZOHO_CLIENT_ID,
          client_secret: ZOHO_CLIENT_SECRET,
          redirect_uri: ZOHO_REDIRECT_URI,
          grant_type: 'authorization_code',
        },
      }
    );

    const { access_token, refresh_token, expires_in } = response.data;

    const expiresAt = new Date(Date.now() + expires_in * 1000);

    await saveZohoTokens({
      refresh_token,
      access_token,
      access_token_expires_at: expiresAt,
      // userId: 'some-user-id', // Add this if you're associating with users
    });

    // You can redirect the user to a success page or display a message
    // return NextResponse.redirect(new URL('/zoho-success', request.url));
    return new Response('Successfully connected to Zoho CRM! You can close this window or navigate back.', { status: 200, headers: { 'Content-Type': 'text/html' } });
  } catch (error: any) {
    console.error(
      'Error exchanging Zoho grant token:',
      error.response ? error.response.data : error.message
    );

    return NextResponse.json({
      message: 'Failed to connect to Zoho CRM. Please check your credentials and try again.',
      error: error.response ? error.response.data : error.message,
    }, { status: 500 });
  }
}