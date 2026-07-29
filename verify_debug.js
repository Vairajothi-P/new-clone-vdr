const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  "https://xxlawcufvetxygaqwoxi.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4bGF3Y3VmdmV0eHlnYXF3b3hpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODc0MTczOCwiZXhwIjoyMDk0MzE3NzM4fQ.oykyXMdA63j-CRNmIon598xha42wt9k5jaJn2GX8YVQ"
);

async function run() {
  const email = "k.r.nagaraj2002@gmail.com";
  console.log("Fetching for:", email);
  
  const { data, error } = await supabaseAdmin
    .from('email_otps')
    .select('*')
    .eq('email', email)
    .single();

  console.log("Data:", data);
  console.log("Error:", error);
}

run();
