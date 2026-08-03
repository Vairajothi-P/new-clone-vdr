import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
    try {
        const body = await req.json().catch(() => ({}));
        const session = body.session || {};
        
        const forwarded = req.headers.get('x-forwarded-for');
        const realIp = req.headers.get('x-real-ip');
        const clientIp = forwarded ? forwarded.split(',')[0].trim() : (realIp || '127.0.0.1');

        const userId = session.id || body.userId;
        const email = session.email || body.email || 'Unknown User';
        const reason = body.reason || 'User initiated logout';

        if (userId) {
            // Insert LOGOUT entry in document_edit_logs
            await supabase.from('document_edit_logs').insert([{
                user_id: userId,
                document_id: null,
                action_type: 'LOGOUT',
                metadata: {
                    ip_address: clientIp,
                    email: email,
                    reason: reason
                },
                changed_at: new Date().toISOString()
            }]);
        }

        return NextResponse.json({ success: true, clientIp });
    } catch (err) {
        console.error('[LOGOUT API ERROR]:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
