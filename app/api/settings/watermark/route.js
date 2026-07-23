import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
    try {
        const { action, session, payload } = await req.json();
        if (!session || !session.company_id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const companyId = session.company_id;

        // ─── 1. FETCH ALL WATERMARK DATA ───
        if (action === 'fetch_all') {
            // Fetch branding logo
            const { data: wsData } = await supabase.from('workspace_settings').select('logo_url').eq('company_id', companyId).single();
            // Fetch active watermark settings
            const { data: wmSettings } = await supabase.from('watermark_settings').select('*').eq('company_id', companyId).limit(1).single();
            // Fetch templates
            const { data: templates } = await supabase.from('watermark_templates').select('*').eq('company_id', companyId).order('created_at', { ascending: false });

            return NextResponse.json({
                success: true,
                brandLogo: wsData?.logo_url || null,
                settings: wmSettings || null,
                templates: templates || []
            });
        }

        // ─── 2. SAVE ACTIVE SETTINGS ───
        if (action === 'save_settings') {
            const { recordId, settingsPayload } = payload;
            settingsPayload.company_id = companyId; // Enforce tenant isolation

            let newId = recordId;
            if (recordId) {
                const { error } = await supabase.from('watermark_settings').update(settingsPayload).eq('id', recordId).eq('company_id', companyId);
                if (error) throw error;
            } else {
                const { data, error } = await supabase.from('watermark_settings').insert(settingsPayload).select().single();
                if (error) throw error;
                if (data) newId = data.id;
            }
            return NextResponse.json({ success: true, recordId: newId });
        }

        // ─── 3. APPLY TEMPLATE ───
        if (action === 'apply_template') {
            const { templateId } = payload;
            await supabase.from('watermark_templates').update({ present: false }).eq('company_id', companyId);
            await supabase.from('watermark_templates').update({ present: true }).eq('id', templateId).eq('company_id', companyId);
            return NextResponse.json({ success: true });
        }

        // ─── 4. DELETE TEMPLATE ───
        if (action === 'delete_template') {
            const { templateId } = payload;
            await supabase.from('watermark_templates').delete().eq('id', templateId).eq('company_id', companyId);
            return NextResponse.json({ success: true });
        }

        // ─── 5. SAVE NEW TEMPLATE (WITH IMAGE UPLOAD) ───
        if (action === 'save_template') {
            const { templateId, templateForm, logoBase64, logoMime, logoName } = payload;
            templateForm.company_id = companyId;

            let finalLogoPath = templateForm.logo_path;

            // If user uploaded a new logo file, save it to bucket
            if (logoBase64) {
                const ext = logoName.split('.').pop();
                const fileName = `${companyId}_${Date.now()}.${ext}`;
                const buffer = Buffer.from(logoBase64, 'base64');

                const { error: uploadErr } = await supabase.storage.from('vdr-logos').upload(fileName, buffer, { contentType: logoMime });
                if (uploadErr) throw uploadErr;
                finalLogoPath = fileName;
            }

            templateForm.logo_path = finalLogoPath;

            if (templateId) {
                const { error } = await supabase.from('watermark_templates').update(templateForm).eq('id', templateId).eq('company_id', companyId);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('watermark_templates').insert(templateForm);
                if (error) throw error;
            }
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    } catch (err) {
        console.error("Watermark API Error:", err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}