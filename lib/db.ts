// db.ts
import { supabaseServiceRole } from './supabase';

interface ZohoTokenData {
  id?: number;
  refresh_token: string;
  access_token: string;
  access_token_expires_at: Date; // Keep this as Date
  updated_at?: string;
  user_id?: string | null;
}

export async function getZohoTokens(userId: string | null = null): Promise<ZohoTokenData | null> {
  let query = supabaseServiceRole
    .from('zoho_tokens')
    .select('*')
    .limit(1);

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query.single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows found"
    console.error('Error fetching Zoho tokens from Supabase:', error);
    throw new Error('Failed to retrieve Zoho tokens from database.');
  }

  if (data) {
    // Convert the string back to a Date object
    // Ensure data.access_token_expires_at exists before trying to convert
    if (typeof data.access_token_expires_at === 'string') {
        data.access_token_expires_at = new Date(data.access_token_expires_at);
    }
    return data as ZohoTokenData; // Cast to ZohoTokenData type
  }

  return null;
}

// Your saveZohoTokens function remains mostly the same,
// as it's already converting to ISO string before saving
export async function saveZohoTokens({
  refresh_token,
  access_token,
  access_token_expires_at,
  userId = null,
}: {
  refresh_token: string;
  access_token: string;
  access_token_expires_at: Date;
  userId?: string | null;
}): Promise<ZohoTokenData> {
  const existingTokens = await getZohoTokens(userId);

  const upsertData: any = { // Use 'any' here temporarily for cleaner assignment
    refresh_token,
    access_token,
    // Convert Date object to ISO string for storage
    access_token_expires_at: access_token_expires_at.toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (userId) {
    upsertData.user_id = userId;
  }

  let result;

  if (existingTokens) {
    result = await supabaseServiceRole
      .from('zoho_tokens')
      .update(upsertData)
      .eq('id', existingTokens.id!)
      .select();
  } else {
    result = await supabaseServiceRole
      .from('zoho_tokens')
      .insert(upsertData)
      .select();
  }

  if (result.error) {
    console.error('Error saving Zoho tokens to Supabase:', result.error);
    throw new Error('Failed to save Zoho tokens to database.');
  }

  // Ensure the returned data also has access_token_expires_at as a Date object
  if (result.data && result.data[0]) {
    result.data[0].access_token_expires_at = new Date(result.data[0].access_token_expires_at);
  }

  return result.data![0];
}