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

            // Safely map logo_path/logo_opacity/logo_position from attributes if they were saved there (schema cache workaround)
            if (wmSettings && wmSettings.attributes) {
                if (wmSettings.attributes.logo_path !== undefined) wmSettings.logo_path = wmSettings.attributes.logo_path;
                if (wmSettings.attributes.logo_opacity !== undefined) wmSettings.logo_opacity = wmSettings.attributes.logo_opacity;
                if (wmSettings.attributes.logo_position !== undefined) wmSettings.logo_position = wmSettings.attributes.logo_position;
            }
            if (templates) {
                templates.forEach(t => {
                    if (t.attributes) {
                        if (t.attributes.logo_path !== undefined) t.logo_path = t.attributes.logo_path;
                        if (t.attributes.logo_opacity !== undefined) t.logo_opacity = t.attributes.logo_opacity;
                        if (t.attributes.logo_position !== undefined) t.logo_position = t.attributes.logo_position;
                    }
                });
            }

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

            // Move un-migrated columns into the JSON attributes field to avoid schema cache error
            const { logo_path, logo_opacity, logo_position, ...dbPayload } = settingsPayload;
            dbPayload.attributes = dbPayload.attributes || {};
            if (logo_path !== undefined) dbPayload.attributes.logo_path = logo_path;
            if (logo_opacity !== undefined) dbPayload.attributes.logo_opacity = logo_opacity;
            if (logo_position !== undefined) dbPayload.attributes.logo_position = logo_position;

            let newId = recordId;
            if (recordId) {
                const { error } = await supabase.from('watermark_settings').update(dbPayload).eq('id', recordId).eq('company_id', companyId);
                if (error) throw error;
            } else {
                const { data, error } = await supabase.from('watermark_settings').insert(dbPayload).select().single();
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

            // Move un-migrated columns into the JSON attributes field to avoid schema cache error
            const { logo_path, logo_opacity, logo_position, ...dbTemplateForm } = templateForm;
            dbTemplateForm.attributes = dbTemplateForm.attributes || {};
            dbTemplateForm.attributes.logo_path = finalLogoPath;
            if (logo_opacity !== undefined) dbTemplateForm.attributes.logo_opacity = logo_opacity;
            if (logo_position !== undefined) dbTemplateForm.attributes.logo_position = logo_position;

            if (templateId) {
                const { error } = await supabase.from('watermark_templates').update(dbTemplateForm).eq('id', templateId).eq('company_id', companyId);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('watermark_templates').insert(dbTemplateForm);
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