// import { createClient } from '@supabase/supabase-js';
// import { NextResponse } from 'next/server';

// const supabase = createClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL,
//     process.env.SUPABASE_SERVICE_ROLE_KEY // Admin Key required to bypass RLS for verification
// );

// const corsHeaders = {
//     'Access-Control-Allow-Origin': '*',
//     'Access-Control-Allow-Methods': 'POST, OPTIONS',
//     'Access-Control-Allow-Headers': 'Content-Type, Authorization',
// };

// export async function OPTIONS() { return NextResponse.json({}, { headers: corsHeaders }); }

// export async function POST(req) {
//     try {
//         const body = await req.json();
//         const { email, password, doc_id } = body;

//         if (!email || !password || !doc_id) {
//             return NextResponse.json({ success: false, message: "Missing credentials." }, { status: 400, headers: corsHeaders });
//         }

//         // 1. Verify User & Password
//         const { data: user, error: userErr } = await supabase.from('users').select('id, role, password_hash').eq('email', email).single();
//         if (userErr || !user || user.password_hash !== password) {
//             return NextResponse.json({ success: false, message: "Invalid email or password." }, { status: 401, headers: corsHeaders });
//         }

//         // 2. Grab Document Info (Now fetching creator_revoked)
//         const { data: docData, error: docError } = await supabase.from('documents')
//             .select('dek_ref, folder_id, uploaded_by, creator_revoked')
//             .eq('id', doc_id)
//             .single();

//         if (docError || !docData) {
//             return NextResponse.json({ success: false, message: "Document not found in Vault." }, { status: 404, headers: corsHeaders });
//         }

//         // 3. STRICT Real-Time Permissions Check
//         let hasAccess = false;
//         let canEdit = false;

//         // 🔥 ONLY Super Admin has God Mode. 
//         // Creators get access UNLESS the Super Admin flipped the 'creator_revoked' switch!
//         if (user.role === 'super_admin' || (docData.uploaded_by === user.id && docData.creator_revoked !== true)) {
//             hasAccess = true;
//             canEdit = true;
//         } else {
//             // Rule B: Standard Users must have an active permission row in the DB right NOW
//             const { data: userGroups } = await supabase.from('user_groups').select('group_id').eq('user_id', user.id);

//             if (userGroups && userGroups.length > 0) {
//                 const groupIds = userGroups.map(g => g.group_id);

//                 let orConditions = `document_id.eq.${doc_id}`;
//                 if (docData.folder_id) {
//                     orConditions += `,folder_id.eq.${docData.folder_id}`;
//                 }

//                 const { data: perms } = await supabase.from('permissions')
//                     .select('can_view, can_edit')
//                     .in('group_id', groupIds)
//                     .or(orConditions);

//                 if (perms && perms.length > 0) {
//                     if (perms.some(p => p.can_view === true)) hasAccess = true;
//                     if (perms.some(p => p.can_edit === true)) canEdit = true;
//                 }
//             }
//         }
//         // // 2. Grab Document Info (Needed to check Folder Inheritance and Creator)
//         // const { data: docData, error: docError } = await supabase.from('documents').select('dek_ref, folder_id, uploaded_by').eq('id', doc_id).single();
//         // if (docError || !docData) {
//         //     return NextResponse.json({ success: false, message: "Document not found in Vault." }, { status: 404, headers: corsHeaders });
//         // }

//         // // 3. STRICT Real-Time Permissions Check
//         // let hasAccess = false;
//         // let canEdit = false;

//         // // Rule A: Admins & the Original Creator get instant God Mode
//         // if (['super_admin', 'admin', 'subadmin'].includes(user.role) || docData.uploaded_by === user.id) {
//         //     hasAccess = true;
//         //     canEdit = true;
//         // } else {
//         //     // Rule B: Standard Users must have an active permission row in the DB right NOW
//         //     const { data: userGroups } = await supabase.from('user_groups').select('group_id').eq('user_id', user.id);

//         //     if (userGroups && userGroups.length > 0) {
//         //         const groupIds = userGroups.map(g => g.group_id);

//         //         // 🔥 THE FIX: Strictly check ONLY this specific Document, its Parent Folder, or Global 'files' scope.
//         //         // We removed 'workspace' here because it was a loophole granting access to everything!
//         //         let orConditions = `document_id.eq.${doc_id},scope.eq.files`;
//         //         if (docData.folder_id) {
//         //             orConditions += `,folder_id.eq.${docData.folder_id}`;
//         //         }

//         //         const { data: perms } = await supabase.from('permissions')
//         //             .select('can_view, can_edit')
//         //             .in('group_id', groupIds)
//         //             .or(orConditions);

//         //         if (perms && perms.length > 0) {
//         //             // Check if ANY of their valid groups grant view or edit access
//         //             if (perms.some(p => p.can_view === true)) hasAccess = true;
//         //             if (perms.some(p => p.can_edit === true)) canEdit = true;
//         //         }
//         //     }
//         // }

//         // 4. Final Lockout Enforcement
//         if (!hasAccess) {
//             // If they were removed from the DB, the server cuts them off here.
//             return NextResponse.json({
//                 success: false,
//                 message: "Access Revoked: You no longer have permission to view this file."
//             }, { status: 403, headers: corsHeaders });
//         }

//         // 5. Send Decryption Key and Dynamic UI State
//         return NextResponse.json({
//             success: true,
//             fernet_key: docData.dek_ref,
//             can_edit: canEdit // Tells the HTML file whether to show or hide the Edit button
//         }, { headers: corsHeaders });

//     } catch (error) {
//         console.error("Unlock Error:", error);
//         return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500, headers: corsHeaders });
//     }
// }





// // import { createClient } from '@supabase/supabase-js';
// // import { NextResponse } from 'next/server';

// // const supabase = createClient(
// //     process.env.NEXT_PUBLIC_SUPABASE_URL,
// //     process.env.SUPABASE_SERVICE_ROLE_KEY // Admin key
// // );

// // const corsHeaders = {
// //     'Access-Control-Allow-Origin': '*',
// //     'Access-Control-Allow-Methods': 'POST, OPTIONS',
// //     'Access-Control-Allow-Headers': 'Content-Type, Authorization',
// // };

// // export async function OPTIONS() { return NextResponse.json({}, { headers: corsHeaders }); }

// // export async function POST(req) {
// //     try {
// //         const body = await req.json();
// //         const { email, password, doc_id } = body;

// //         if (!email || !password || !doc_id) return NextResponse.json({ success: false }, { status: 400, headers: corsHeaders });

// //         // 1. Verify User & Password
// //         const { data: user, error: userErr } = await supabase.from('users').select('id, role, password_hash').eq('email', email).single();
// //         if (userErr || !user || user.password_hash !== password) {
// //             return NextResponse.json({ success: false, message: "Invalid email or password." }, { status: 401, headers: corsHeaders });
// //         }

// //         // 2. Grab Document Info FIRST (We need the folder_id to check inherited permissions!)
// //         //const { data: docData, error: docError } = await supabase.from('documents').select('dek_ref, folder_id').eq('id', doc_id).single();
// //         const { data: docData, error: docError } = await supabase.from('documents').select('dek_ref, folder_id, uploaded_by').eq('id', doc_id).single();
// //         if (docError || !docData) return NextResponse.json({ success: false, message: "Document not found in Vault." }, { status: 404, headers: corsHeaders });

// //         // 3. Strict Permissions Check (Document + Folder + Workspace levels)
// //         let hasAccess = false;
// //         let canEdit = false;

// //         // if (user.role === 'super_admin' || user.role === 'admin' || user.role === 'subadmin') {
// //         //     hasAccess = true; canEdit = true;
// //         // }

// //         if (user.role === 'super_admin' || user.role === 'admin' || user.role === 'subadmin' || docData.uploaded_by === user.id) {
// //             hasAccess = true; canEdit = true;
// //         }
// //         else {
// //             const { data: userGroups } = await supabase.from('user_groups').select('group_id').eq('user_id', user.id);
// //             if (userGroups && userGroups.length > 0) {
// //                 const groupIds = userGroups.map(g => g.group_id);

// //                 // 🔥 THE FIX: Check if they have access to the Document, OR the parent Folder, OR the Workspace
// //                 let orConditions = `document_id.eq.${doc_id},scope.eq.workspace`;
// //                 if (docData.folder_id) orConditions += `,folder_id.eq.${docData.folder_id}`;

// //                 const { data: perms } = await supabase.from('permissions').select('can_view, can_edit').in('group_id', groupIds).or(orConditions);

// //                 if (perms) {
// //                     if (perms.some(p => p.can_view === true)) hasAccess = true;
// //                     if (perms.some(p => p.can_edit === true)) canEdit = true; // ✅ Unlocks the Edit Button!
// //                 }
// //             }
// //         }

// //         if (!hasAccess) return NextResponse.json({ success: false, message: "No permission to view this file." }, { status: 403, headers: corsHeaders });

// //         // 4. Send Key AND Edit Permission
// //         return NextResponse.json({ success: true, fernet_key: docData.dek_ref, can_edit: canEdit }, { headers: corsHeaders });

// //     } catch (error) { return NextResponse.json({ success: false, message: "Internal Error" }, { status: 500, headers: corsHeaders }); }
// // }



// // import { createClient } from '@supabase/supabase-js';
// // import { NextResponse } from 'next/server';

// // const supabase = createClient(
// //     process.env.NEXT_PUBLIC_SUPABASE_URL,
// //     process.env.SUPABASE_SERVICE_ROLE_KEY // Admin key
// // );

// // const corsHeaders = {
// //     'Access-Control-Allow-Origin': '*',
// //     'Access-Control-Allow-Methods': 'POST, OPTIONS',
// //     'Access-Control-Allow-Headers': 'Content-Type, Authorization',
// // };Spell

// // export async function OPTIONS() {
// //     return NextResponse.json({}, { headers: corsHeaders });
// // }

// // export async function POST(req) {
// //     try {
// //         const body = await req.json();
// //         const { email, password, doc_id } = body;

// //         if (!email || !password || !doc_id) {
// //             return NextResponse.json({ success: false, message: "Missing credentials" }, { status: 400, headers: corsHeaders });
// //         }

// //         // --- STEP A: Verify User & Password ---
// //         const { data: user, error: userErr } = await supabase
// //             .from('users').select('id, role, password_hash').eq('email', email).single();

// //         if (userErr || !user || user.password_hash !== password) {
// //             return NextResponse.json({ success: false, message: "Invalid email or password." }, { status: 401, headers: corsHeaders });
// //         }

// //         // --- STEP B: Strict Permissions Check ---
// //         let hasAccess = false;
// //         let canEdit = false; // 🔥 New Flag

// //         // 1. Admins get automatic View AND Edit access
// //         if (user.role === 'super_admin' || user.role === 'admin' || user.role === 'subadmin') {
// //             hasAccess = true;
// //             canEdit = true;
// //         } else {
// //             // 2. Normal users check the database
// //             const { data: userGroups } = await supabase.from('user_groups').select('group_id').eq('user_id', user.id);

// //             if (userGroups && userGroups.length > 0) {
// //                 const groupIds = userGroups.map(g => g.group_id);
// //                 const { data: perms } = await supabase.from('permissions').select('can_view, can_edit')
// //                     .eq('document_id', doc_id).eq('scope', 'document').in('group_id', groupIds);

// //                 if (perms) {
// //                     if (perms.some(p => p.can_view === true)) hasAccess = true;
// //                     if (perms.some(p => p.can_edit === true)) canEdit = true; // Check if they can edit!
// //                 }
// //             }
// //         }

// //         if (!hasAccess) {
// //             return NextResponse.json({ success: false, message: "You do not have permission to view this file." }, { status: 403, headers: corsHeaders });
// //         }

// //         // --- STEP C: Grab the Fernet Key ---
// //         const { data: docData, error: docError } = await supabase.from('documents').select('dek_ref').eq('id', doc_id).single();

// //         if (docError || !docData) {
// //             return NextResponse.json({ success: false, message: "Document not found in Vault." }, { status: 404, headers: corsHeaders });
// //         }

// //         // --- STEP D: Send Key AND Edit Permission ---
// //         return NextResponse.json({
// //             success: true,
// //             fernet_key: docData.dek_ref,
// //             can_edit: canEdit // 🔥 Sent to the HTML Wrapper!
// //         }, { headers: corsHeaders });

// //     } catch (error) {
// //         console.error('Unlock API Error:', error);
// //         return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500, headers: corsHeaders });
// //     }
// // }






