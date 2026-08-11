import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
    try {
        const { session, changes, groupId } = await req.json();

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        if (!groupId) {
            return NextResponse.json(
                { error: 'groupId is required' },
                { status: 400 }
            );
        }

        if (!Array.isArray(changes)) {
            return NextResponse.json(
                { error: 'changes must be an array' },
                { status: 400 }
            );
        }

        // Get existing permissions for this company + group
        const { data: existingPerms, error: fetchErr } = await supabase
            .from('permissions')
            .select('id, scope, document_id, folder_id')
            .eq('company_id', session.company_id)
            .eq('group_id', groupId);

        if (fetchErr) {
            throw fetchErr;
        }

        for (const change of changes) {
            const { targetId, type, updatedState } = change;

            const scope = type === 'doc' ? 'document' : 'folder';

            const existing = (existingPerms || []).find((permission) => {
                if (scope === 'document') {
                    return (
                        permission.scope === 'document' &&
                        permission.document_id === targetId
                    );
                }

                return (
                    permission.scope === 'folder' &&
                    permission.folder_id === targetId
                );
            });

            const payload = {
                company_id: session.company_id,
                group_id: groupId,
                scope,

                document_id:
                    type === 'doc' ? targetId : null,

                folder_id:
                    type === 'fol' ? targetId : null,

                can_view: updatedState?.can_view ?? false,
                can_edit: updatedState?.can_edit ?? false,
                can_upload: updatedState?.can_upload ?? false,
                can_download_secure:
                    updatedState?.can_download_secure ?? false,
                can_download_original:
                    updatedState?.can_download_original ?? false,
                can_delete: updatedState?.can_delete ?? false,
                can_redact: updatedState?.can_redact ?? false,

                updated_at: new Date().toISOString()
            };

            // Existing permission → UPDATE
            if (existing?.id) {
                const { error: updateErr } = await supabase
                    .from('permissions')
                    .update(payload)
                    .eq('id', existing.id);

                if (updateErr) {
                    throw updateErr;
                }
            }

            // New permission → INSERT
            else {
                const { error: insertErr } = await supabase
                    .from('permissions')
                    .insert(payload);

                if (insertErr) {
                    throw insertErr;
                }
            }
        }

        return NextResponse.json({
            success: true
        });

    } catch (error) {
        console.error('Access save error:', error);

        return NextResponse.json(
            {
                success: false,
                error: error.message
            },
            { status: 500 }
        );
    }
}