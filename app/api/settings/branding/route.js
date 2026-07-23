import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
    try {
        const { action, session, payload } = await req.json();
        if (!session || !session.company_id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const companyId = session.company_id;

        // ─── 1. FETCH BRANDING DATA ───
        if (action === 'fetch') {
            const { data: compData } = await supabase
                .from('companies')
                .select('name, primary_color')
                .eq('id', companyId)
                .single();

            const { data: wsData } = await supabase
                .from('workspace_settings')
                .select('logo_url')
                .eq('company_id', companyId)
                .single();

            return NextResponse.json({
                success: true,
                branding: {
                    name: compData?.name || '',
                    primary_color: compData?.primary_color || '#1c7f9f',
                    logo_url: wsData?.logo_url || ''
                }
            });
        }

        // ─── 2. SAVE BRANDING DATA ───
        if (action === 'save') {
            const { name, primary_color, logoBase64, logoMime, logoName } = payload;
            let logoUrl = payload.logo_url;

            // If a new logo was uploaded, store it in the 'vdr-logos' bucket
            if (logoBase64 && logoName) {
                const ext = logoName.split('.').pop();
                const fileName = `${companyId}_brand_${Date.now()}.${ext}`;
                const buffer = Buffer.from(logoBase64, 'base64');

                const { error: uploadErr } = await supabase.storage
                    .from('vdr-logos')
                    .upload(fileName, buffer, { contentType: logoMime, upsert: true });

                if (uploadErr) throw uploadErr;

                const { data: publicUrlData } = supabase.storage.from('vdr-logos').getPublicUrl(fileName);
                logoUrl = publicUrlData?.publicUrl || fileName;
            }

            // Update companies table (name, color)
            if (name !== undefined || primary_color !== undefined) {
                await supabase.from('companies').update({
                    ...(name !== undefined && { name }),
                    ...(primary_color !== undefined && { primary_color })
                }).eq('id', companyId);
            }

            // Update or Insert into workspace_settings table (logo_url)
            if (logoUrl !== undefined) {
                const { data: existingWs } = await supabase
                    .from('workspace_settings')
                    .select('id')
                    .eq('company_id', companyId)
                    .single();

                if (existingWs) {
                    await supabase.from('workspace_settings').update({ logo_url: logoUrl }).eq('company_id', companyId);
                } else {
                    await supabase.from('workspace_settings').insert({ company_id: companyId, logo_url: logoUrl });
                }
            }

            return NextResponse.json({ success: true, logo_url: logoUrl });
        }

        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    } catch (err) {
        console.error("Branding API Error:", err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}