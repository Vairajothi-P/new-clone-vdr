import { createClient } from "@supabase/supabase-js";

export const createSupabaseClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy.supabase.co";
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy-key";
    return createClient(supabaseUrl, supabaseKey);
};

export const supabase = createSupabaseClient();
