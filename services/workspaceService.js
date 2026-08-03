import { db } from '@/lib/db';
import * as emailService from '@/services/emailService';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const FALLBACK_STORE_PATH = path.join(process.cwd(), '.vdr_workspace_requests.json');

/**
 * Read from local JSON fallback if Supabase table has not been migrated yet.
 */
function readFallbackStore() {
  try {
    if (fs.existsSync(FALLBACK_STORE_PATH)) {
      const data = fs.readFileSync(FALLBACK_STORE_PATH, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('[WorkspaceService] Error reading fallback store:', err);
  }
  return [];
}

/**
 * Write to local JSON fallback if Supabase table has not been migrated yet.
 */
function writeFallbackStore(requests) {
  try {
    fs.writeFileSync(FALLBACK_STORE_PATH, JSON.stringify(requests, null, 2), 'utf8');
  } catch (err) {
    console.error('[WorkspaceService] Error writing fallback store:', err);
  }
}

/**
 * Map a company record from the companies table to the request object shape needed by admin UI
 */
function mapCompanyToRequest(company) {
  const rawStatus = String(company.status || 'pending').toLowerCase().trim();
  let s = 'pending';
  if (['active', 'approved', 'trial', 'enabled'].includes(rawStatus)) {
    s = 'approved';
  } else if (['rejected', 'suspended', 'disabled', 'cancelled', 'inactive'].includes(rawStatus)) {
    s = 'rejected';
  } else {
    s = 'pending';
  }

  return {
    id: company.id,
    company_id: company.id,
    company_name: company.name,
    super_admin_name: company.super_admin_name || company.admin_name || company.name || 'Admin',
    super_admin_email: company.super_admin_email || company.admin_email || company.email,
    plan_name: company.plan_name || 'Standard VDR',
    admin_name: company.super_admin_name || company.admin_name || company.name || 'Admin',
    admin_email: company.super_admin_email || company.admin_email || company.email,
    phone: company.phone_number || '',
    plan_id: company.plan_id || '1',
    status: s,
    rejection_reason: company.rejection_reason || null,
    created_at: company.created_at || new Date().toISOString()
  };
}

/**
 * Create a new workspace request when user clicks "Request Workspace"
 * ALL registration requests are stored directly in the 'companies' table with status='pending'
 */
export async function createWorkspaceRequest({ companyName, adminName, adminEmail, phone, planId, password }) {
  if (!companyName || !adminName || !adminEmail || !planId) {
    throw new Error("Missing required fields for workspace request.");
  }

  let planName = `Plan (${planId})`;
  try {
    const { data: pData } = await db.from('plans').select('name').eq('id', planId).single();
    if (pData && pData.name) {
      planName = pData.name;
    }
  } catch (err) {
    console.warn("[WorkspaceService] Note fetching plan name:", err.message);
  }

  // 1. Create company record in companies table with status = 'pending'
  let companyId = crypto.randomUUID();
  let company = {
    id: companyId,
    name: companyName,
    email: adminEmail,
    phone_number: phone,
    status: 'pending',
    super_admin_name: adminName,
    super_admin_email: adminEmail,
    plan_name: planName,
    plan_id: planId,
    created_at: new Date().toISOString()
  };

  try {
    let { data: compData, error: compErr } = await db
      .from('companies')
      .insert([{
        id: companyId,
        name: companyName,
        email: adminEmail,
        phone_number: phone,
        status: 'pending',
        super_admin_name: adminName,
        super_admin_email: adminEmail,
        plan_name: planName,
        plan_id: planId
      }])
      .select()
      .single();

    if (compErr && (compErr.message.includes('column') || compErr.code === '42703' || compErr.message.includes('schema'))) {
      // If companies table does not yet have the extra columns, insert basic columns
      const basicCompany = {
        id: companyId,
        name: companyName,
        email: adminEmail,
        phone_number: phone,
        status: 'pending'
      };
      const retryRes = await db
        .from('companies')
        .insert([basicCompany])
        .select()
        .single();
      compData = retryRes.data;
      compErr = retryRes.error;
    }

    if (compErr) {
      console.warn("[WorkspaceService] Company create warning, saving to local store:", compErr.message);
      const store = readFallbackStore();
      store.push(company);
      writeFallbackStore(store);
    } else if (compData) {
      company = { ...company, ...compData };
      companyId = compData.id;
    }
  } catch (e) {
    console.warn("[WorkspaceService] Company create fallback:", e.message);
    const store = readFallbackStore();
    store.push(company);
    writeFallbackStore(store);
  }

  // 2. Create Supabase auth user if possible
  let userId = crypto.randomUUID();
  try {
    const { data: authData, error: authErr } = await db.auth.admin.createUser({
      email: adminEmail,
      password: password || 'DefaultTempPass123!',
      email_confirm: true,
    });
    if (authData?.user?.id) {
      userId = authData.user.id;
    } else if (authErr) {
      console.warn("[WorkspaceService] Auth createUser note:", authErr.message);
    }
  } catch (e) {
    console.warn("[WorkspaceService] Auth user creation note:", e.message);
  }

  // 3. Create or update user record in custom users table
  try {
    const { data: existingUsers } = await db.from('users').select('id, company_id').eq('email', adminEmail).limit(1);
    if (existingUsers && existingUsers.length > 0) {
      userId = existingUsers[0].id;
      companyId = existingUsers[0].company_id || companyId;
      await db.from('users').update({ request_status: 'pending' }).eq('id', userId);
    } else {
      const userPayload = {
        id: userId,
        company_id: companyId,
        name: adminName,
        email: adminEmail,
        password_hash: password || 'defaultHash',
        role: 'super_admin',
        status: 'active',
        nda_status: 'not_required'
      };

      const { error: userErr } = await db.from('users').insert([{
        ...userPayload,
        request_status: 'pending'
      }]);

      if (userErr) {
        if (userErr.message && userErr.message.includes('request_status')) {
          await db.from('users').insert([userPayload]);
        } else {
          console.warn("[WorkspaceService] User insert note:", userErr.message);
        }
      }
    }
  } catch (e) {
    console.warn("[WorkspaceService] User check/insert exception:", e.message);
  }

  // 4. Send email notification to Admin/BO using Resend / SMTP fallback
  await emailService.sendRequestMailToAdmin({
    companyName,
    adminName,
    adminEmail,
    phone,
    planId,
    planName,
    requestId: companyId
  });

  return {
    success: true,
    request: mapCompanyToRequest(company),
    company,
    userId
  };
}

/**
 * Get all pending workspace requests from companies table
 */
export async function getPendingWorkspaceRequests() {
  return getWorkspaceRequestsByStatus('pending');
}

/**
 * Get workspace requests filtered by status (pending, approved, rejected) from companies table
 */
export async function getWorkspaceRequestsByStatus(status) {
  let allCompanies = [];
  try {
    const { data, error } = await db
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      allCompanies = data;
    }
  } catch (e) {
    console.warn("[WorkspaceService] Supabase getWorkspaceRequestsByStatus error, falling back to local store:", e.message);
  }

  const store = readFallbackStore();
  const mergedMap = new Map();
  store.forEach(item => mergedMap.set(item.id, item));
  allCompanies.forEach(item => mergedMap.set(item.id, { ...mergedMap.get(item.id), ...item }));

  const mergedList = Array.from(mergedMap.values()).sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

  return mergedList
    .map(mapCompanyToRequest)
    .filter(r => r.status === status);
}

/**
 * Get all workspace requests (for admin filtering) from companies table
 */
export async function getAllWorkspaceRequests() {
  let allCompanies = [];
  try {
    const { data, error } = await db
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      allCompanies = data;
    }
  } catch (e) {
    console.warn("[WorkspaceService] Supabase getAll error, falling back to local store:", e.message);
  }

  const store = readFallbackStore();
  const mergedMap = new Map();
  store.forEach(item => mergedMap.set(item.id, item));
  allCompanies.forEach(item => mergedMap.set(item.id, { ...mergedMap.get(item.id), ...item }));

  const mergedList = Array.from(mergedMap.values()).sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

  return mergedList.map(mapCompanyToRequest);
}

/**
 * Get the current request status for a user email from companies table
 */
export async function getUserRequestStatusByEmail(email) {
  if (!email) return { status: 'approved', rejection_reason: null };
  try {
    const { data, error } = await db
      .from('companies')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(1);

    if (!error && data && data.length > 0) {
      const s = data[0].status || 'pending';
      let mappedStatus = 'pending';
      if (s === 'active' || s === 'approved') mappedStatus = 'approved';
      else if (s === 'rejected' || s === 'suspended') mappedStatus = 'rejected';

      return { status: mappedStatus, rejection_reason: data[0].rejection_reason || null };
    }
  } catch (e) {
    // ignore DB error
  }

  const store = readFallbackStore();
  const found = store
    .filter(r => (r.super_admin_email || r.admin_email || r.email)?.toLowerCase() === email.toLowerCase())
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

  if (found) {
    const s = found.status || 'pending';
    let mappedStatus = 'pending';
    if (s === 'active' || s === 'approved') mappedStatus = 'approved';
    else if (s === 'rejected' || s === 'suspended') mappedStatus = 'rejected';
    return { status: mappedStatus, rejection_reason: found.rejection_reason };
  }

  return { status: 'approved', rejection_reason: null };
}

/**
 * Approve a workspace request (updates company status -> 'active' in companies table)
 */
export async function approveWorkspaceRequest(requestId, adminUser) {
  if (!requestId) {
    throw new Error("Missing Request ID for approval.");
  }

  // 1. Find company in Supabase or fallback store
  let company = null;
  try {
    const { data, error } = await db
      .from('companies')
      .select('*')
      .eq('id', requestId)
      .single();
    if (!error && data) {
      company = data;
    }
  } catch (e) {}

  if (!company) {
    const store = readFallbackStore();
    company = store.find(r => r.id === requestId);
  }

  if (!company) {
    throw new Error("Company not found.");
  }

  const now = new Date().toISOString();

  // 2. Update company status -> "active" in companies table
  try {
    await db
      .from('companies')
      .update({ status: 'active' })
      .eq('id', requestId);
  } catch (e) {}

  const store = readFallbackStore();
  const index = store.findIndex(r => r.id === requestId);
  if (index !== -1) {
    store[index].status = 'active';
    writeFallbackStore(store);
  }

  // 3. Removed automatic workspace creation logic as requested.

  // 4. Update user record: request_status="approved", status="active"
  try {
    await db
      .from('users')
      .update({
        request_status: 'approved',
        status: 'active'
      })
      .eq('email', company.email);
  } catch (e) {
    console.warn("[WorkspaceService] User status update note:", e.message);
  }

  // 5. Send approval email via emailService
  const reqObj = mapCompanyToRequest(company);
  await emailService.sendApprovalMailToUser({
    userEmail: reqObj.admin_email,
    userName: reqObj.admin_name,
    companyName: reqObj.company_name,
    workspaceName: ""
  });

  return {
    success: true,
    requestId,
    status: 'approved'
  };
}

/**
 * Reject a workspace request (updates company status -> 'rejected' in companies table)
 */
export async function rejectWorkspaceRequest(requestId, reason, adminUser) {
  if (!requestId) {
    throw new Error("Missing Request ID for rejection.");
  }

  // 1. Find company
  let company = null;
  try {
    const { data, error } = await db
      .from('companies')
      .select('*')
      .eq('id', requestId)
      .single();
    if (!error && data) {
      company = data;
    }
  } catch (e) {}

  if (!company) {
    const store = readFallbackStore();
    company = store.find(r => r.id === requestId);
  }

  if (!company) {
    throw new Error("Company not found.");
  }

  // 2. Update company status -> "suspended" in companies table
  try {
    let { error: rejErr } = await db
      .from('companies')
      .update({
        status: 'suspended',
        rejection_reason: reason || 'Not approved by admin'
      })
      .eq('id', requestId);

    if (rejErr && (rejErr.message.includes('column') || rejErr.code === '42703')) {
      await db
        .from('companies')
        .update({ status: 'suspended' })
        .eq('id', requestId);
    }
  } catch (e) {}

  const store = readFallbackStore();
  const index = store.findIndex(r => r.id === requestId);
  if (index !== -1) {
    store[index].status = 'suspended';
    store[index].rejection_reason = reason || 'Not approved by admin';
    writeFallbackStore(store);
  }

  // 3. Update user.request_status -> "rejected"
  try {
    await db
      .from('users')
      .update({
        request_status: 'rejected',
        status: 'suspended'
      })
      .eq('email', company.email);
  } catch (e) {}

  // 4. Send rejection email
  const reqObj = mapCompanyToRequest(company);
  await emailService.sendRejectionMailToUser({
    userEmail: reqObj.admin_email,
    userName: reqObj.admin_name,
    companyName: reqObj.company_name,
    reason: reason || ''
  });

  return {
    success: true,
    requestId,
    status: 'rejected'
  };
}
