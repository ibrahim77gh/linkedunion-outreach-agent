import { supabase } from "@/lib/supabase";

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Fetch data from Supabase
    const { data, error } = await supabase
      .from("zoho_tokens")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error: any) {
    console.error("Error fetching Zoho tokens:", error);
    return res.status(500).json({ error: error.message });
  }
}
