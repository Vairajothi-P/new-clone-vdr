const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Extract supabase URL and ANON key from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);

if (!urlMatch || !keyMatch) {
  console.log("Could not find Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(urlMatch[1].trim(), keyMatch[1].trim());

async function checkSchema() {
  const tables = ['users', 'groups', 'permissions', 'documents', 'folders', 'qna_threads', 'document_redactions'];
  
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.log(`Error reading ${table}: ${error.message}`);
    } else {
      if (data && data.length > 0) {
        console.log(`Table ${table} columns:`, Object.keys(data[0]).join(', '));
      } else {
        console.log(`Table ${table} is empty. Can't infer schema from select * limit 1.`);
      }
    }
  }
}

checkSchema();
