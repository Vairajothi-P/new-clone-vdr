import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // Query the businessowners_users table
    const { data: admin, error } = await supabaseAdmin
      .from('businessowners_users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !admin) {
      return NextResponse.json({ error: "Invalid executive credentials." }, { status: 401 });
    }

    // In a production app, you should use bcrypt to hash and compare passwords.
    // For this demo, we are doing a direct comparison based on your hardcoded logic.
    if (admin.password !== password) {
      return NextResponse.json({ error: "Invalid executive credentials." }, { status: 401 });
    }

    // Return session data (excluding password)
    const sessionData = {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      loggedInAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, user: sessionData });
  } catch (err) {
    console.error("Super Admin login error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
