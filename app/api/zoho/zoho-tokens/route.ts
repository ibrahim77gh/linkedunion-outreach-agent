import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("zoho_tokens")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return Response.json(data);
  } catch (error: any) {
    console.error("Error fetching Zoho tokens:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
