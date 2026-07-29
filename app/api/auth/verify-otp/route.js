export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });
    }

    // 1. Check if OTP exists and is valid
    const { data: records, error: dbError } = await supabaseAdmin
      .from('email_otps')
      .select('*')
      .eq('email', email)
      .order('expires_at', { ascending: false })
      .limit(1);

    if (dbError || !records || records.length === 0) {
      console.error("DB Error or no record in verify-otp:", dbError);
      return NextResponse.json({ error: "Invalid or expired OTP." }, { status: 400 });
    }

    const record = records[0];

    // 2. Check if expired
    if (new Date(record.expires_at) < new Date()) {
      return NextResponse.json({ error: "This OTP has expired. Please request a new one." }, { status: 400 });
    }

    // 3. Check if OTP matches
    if (record.otp !== otp) {
      return NextResponse.json({ error: "Incorrect OTP code." }, { status: 400 });
    }

    // 4. If valid, delete the OTP so it can't be reused
    await supabaseAdmin
      .from('email_otps')
      .delete()
      .eq('email', email);

    return NextResponse.json({ success: true, message: "OTP Verified" });
  } catch (err) {
    console.error("Error verifying OTP:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
