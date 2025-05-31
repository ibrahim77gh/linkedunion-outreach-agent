// app/api/zoho/initiate-auth/route.ts
import { NextResponse } from 'next/server'; // Import NextResponse

export async function GET(request: Request) { // Use GET since it's a redirect action
  const ZOHO_CLIENT_ID = process.env.ZOHO_CLIENT_ID;
  const ZOHO_REDIRECT_URI = process.env.ZOHO_REDIRECT_URI;
  const ZOHO_SCOPES = 'ZohoCRM.modules.leads.CREATE,ZohoCRM.modules.leads.READ,ZohoCRM.users.ALL';

  if (!ZOHO_CLIENT_ID || !ZOHO_REDIRECT_URI) {
    return NextResponse.json({
      message: 'Zoho API credentials (CLIENT_ID or REDIRECT_URI) are not configured.',
    }, { status: 500 });
  }

  const authUrl = `https://accounts.zoho.com/oauth/v2/auth?` +
    `scope=${encodeURIComponent(ZOHO_SCOPES)}&` +
    `client_id=${encodeURIComponent(ZOHO_CLIENT_ID)}&` +
    `response_type=code&` +
    `access_type=offline&` +
    `redirect_uri=${encodeURIComponent(ZOHO_REDIRECT_URI)}`;

  // Use NextResponse.redirect for server-side redirects in App Router
  return NextResponse.redirect(authUrl);
}