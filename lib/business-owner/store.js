import fs from 'fs';
import path from 'path';

const STORE_FILE = path.join(process.cwd(), '.vdr_owner_store.json');

const INITIAL_DATA = {
  organizations: [
    {
      id: 'org-101',
      name: 'Acme Corp VDR',
      adminEmail: 'admin@acmecorp.com',
      usersCount: 14,
      plan: 'Pro',
      status: 'active',
      storageUsedMb: 42500,
      storageLimitMb: 100000,
      createdAt: '2026-06-12',
    },
    {
      id: 'org-102',
      name: 'Global Financial M&A',
      adminEmail: 'compliance@globalmna.com',
      usersCount: 68,
      plan: 'Enterprise',
      status: 'active',
      storageUsedMb: 412000,
      storageLimitMb: 1000000,
      createdAt: '2026-05-19',
    },
    {
      id: 'org-103',
      name: 'Starlight Ventures',
      adminEmail: 'ops@starlightvc.com',
      usersCount: 4,
      plan: 'Free',
      status: 'trial',
      storageUsedMb: 680,
      storageLimitMb: 1000,
      createdAt: '2026-07-15',
    },
    {
      id: 'org-104',
      name: 'Apex Healthcare Group',
      adminEmail: 'security@apexhealth.org',
      usersCount: 22,
      plan: 'Pro',
      status: 'active',
      storageUsedMb: 89300,
      storageLimitMb: 100000,
      createdAt: '2026-06-28',
    },
    {
      id: 'org-105',
      name: 'Quantum Tech Labs',
      adminEmail: 'it-admin@quantumlabs.io',
      usersCount: 95,
      plan: 'Enterprise',
      status: 'suspended',
      storageUsedMb: 610000,
      storageLimitMb: 1000000,
      createdAt: '2026-04-03',
    },
  ],
  plans: [
    {
      id: 'plan-free',
      name: 'Free',
      price: '$0/mo',
      storageLimitMb: 1000,
      maxUsers: 5,
      description: 'Ideal for small trial due diligence projects.',
      features: [
        '1 GB Secure Storage',
        'Up to 5 Users',
        'Basic Document Watermark',
        'Standard Email Support',
      ],
      isPopular: false,
    },
    {
      id: 'plan-pro',
      name: 'Pro',
      price: '$299/mo',
      storageLimitMb: 100000,
      maxUsers: 25,
      description: 'For growing M&A teams and active deal rooms.',
      features: [
        '100 GB High-Speed Storage',
        'Up to 25 Users',
        'Dynamic NDA & Custom Watermarking',
        'Priority 24/7 Support',
        'Custom Brand Styling',
      ],
      isPopular: true,
    },
    {
      id: 'plan-enterprise',
      name: 'Enterprise',
      price: '$999/mo',
      storageLimitMb: 1000000,
      maxUsers: 500,
      description: 'Unlimited institutional control and maximum security.',
      features: [
        '1 TB Encrypted Storage',
        'Unlimited Users',
        'AI-Assisted Redaction & OCR',
        'Dedicated Account Manager',
        'SSO & SAML 2.0 Integration',
        'Full Compliance Audit Logs',
      ],
      isPopular: false,
    },
  ],
  emailTemplates: [
    {
      id: 'tpl-welcome',
      name: 'Welcome Email',
      subject: 'Welcome to {{company_name}} VDR Portal',
      body: `<p>Hello <strong>{{user_name}}</strong>,</p>
<p>Welcome to <strong>{{company_name}}</strong>'s Secure Virtual Data Room. Your account has been provisioned with high-security clearance.</p>
<p>You can access your workspace anytime by logging in here:</p>
<p><a href="{{login_url}}" style="padding:10px 18px;background-color:#1C7F9F;color:#ffffff;text-decoration:none;border-radius:6px;display:inline-block;font-weight:600;">Access Virtual Data Room</a></p>
<p>Best regards,<br/>The VDR Security Team</p>`,
      updatedAt: '2026-07-20 14:32:00',
    },
    {
      id: 'tpl-invite',
      name: 'User Invitation',
      subject: 'You have been invited to collaborate on {{company_name}} VDR',
      body: `<p>Hello <strong>{{user_name}}</strong>,</p>
<p>You have been invited as a guest collaborator in the <strong>{{company_name}}</strong> data room.</p>
<p>Please log in and review the required NDA before accessing sensitive deal documents:</p>
<p><a href="{{login_url}}" style="padding:10px 18px;background-color:#1C7F9F;color:#ffffff;text-decoration:none;border-radius:6px;display:inline-block;font-weight:600;">Open Invitation</a></p>
<p>Thank you,<br/>{{company_name}} Administration</p>`,
      updatedAt: '2026-07-22 10:15:00',
    },
    {
      id: 'tpl-reset',
      name: 'Password Reset',
      subject: 'Password Reset Request - {{company_name}} VDR',
      body: `<p>Hello <strong>{{user_name}}</strong>,</p>
<p>We received a request to reset your security password for your VDR account.</p>
<p>Please click the button below to securely reset your credentials:</p>
<p><a href="{{reset_link}}" style="padding:10px 18px;background-color:#E11D48;color:#ffffff;text-decoration:none;border-radius:6px;display:inline-block;font-weight:600;">Reset My Password</a></p>
<p>If you did not request this reset, please notify your Super Admin immediately.</p>`,
      updatedAt: '2026-07-25 09:04:00',
    },
  ],
  activityLogs: [
    {
      id: 'log-1',
      action: 'Organization Created',
      description: "New organization 'Quantum Tech Labs' provisioned with Enterprise Plan.",
      timestamp: '10 mins ago',
      iconType: 'org',
    },
    {
      id: 'log-2',
      action: 'Storage Limit Updated',
      description: "Increased storage quota to 100 GB for 'Apex Healthcare Group'.",
      timestamp: '2 hours ago',
      iconType: 'storage',
    },
    {
      id: 'log-3',
      action: 'Plan Reassigned',
      description: "Upgraded 'Global Financial M&A' from Pro to Enterprise.",
      timestamp: '5 hours ago',
      iconType: 'plan',
    },
    {
      id: 'log-4',
      action: 'Email Template Edited',
      subject: 'Welcome Email template updated by Super Admin.',
      description: 'Modified dynamic tokens in Welcome Email template.',
      timestamp: 'Yesterday',
      iconType: 'email',
    },
    {
      id: 'log-5',
      action: 'Security Audit',
      description: 'Super Admin login verified from IP 192.168.1.104.',
      timestamp: '2 days ago',
      iconType: 'security',
    },
  ],
  adminProfile: {
    name: 'Anushiya Selvaraj',
    email: 'owner@pibivdr.com',
    title: 'Super Admin / Business Owner',
    phone: '+1 (555) 019-2834',
    avatarUrl: '',
    passwordHash: 'superadmin2026',
  },
};

export function getStore() {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, 'utf8');
      const data = JSON.parse(raw);
      return { ...INITIAL_DATA, ...data };
    }
  } catch (err) {
    console.error('Error reading store file, falling back to initial data:', err);
  }
  saveStore(INITIAL_DATA);
  return INITIAL_DATA;
}

export function saveStore(data) {
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing store file:', err);
  }
}

export function addActivityLog(action, description, iconType = 'org') {
  const store = getStore();
  const newLog = {
    id: `log-${Date.now()}`,
    action,
    description,
    timestamp: 'Just now',
    iconType,
  };
  store.activityLogs = [newLog, ...(store.activityLogs || [])].slice(0, 30);
  saveStore(store);
  return newLog;
}

// ----------------------------------------------------
// EXPORTED BUSINESS OWNER API STORE HELPER FUNCTIONS
// ----------------------------------------------------

export async function getOverviewStats() {
  const store = getStore();
  const orgs = store.organizations || [];
  const totalOrganizations = orgs.length;
  const activeOrgs = orgs.filter((o) => o.status === 'active').length;
  const trialOrgs = orgs.filter((o) => o.status === 'trial').length;
  const totalUsers = orgs.reduce((acc, o) => acc + (Number(o.usersCount) || 0), 0);

  const storageUsedMb = orgs.reduce((acc, o) => acc + (Number(o.storageUsedMb) || 0), 0);
  const storageLimitMb = orgs.reduce((acc, o) => acc + (Number(o.storageLimitMb) || 0), 0);
  const storageUsedGb = Math.round(storageUsedMb / 1024);
  const storageLimitGb = Math.round(storageLimitMb / 1024) || 1;
  const storagePercentage = Math.min(100, Math.round((storageUsedGb / storageLimitGb) * 100));

  const planCounts = {};
  orgs.forEach((o) => {
    const p = o.plan || 'Free';
    planCounts[p] = (planCounts[p] || 0) + 1;
  });

  return {
    totalOrganizations,
    activeOrgs,
    trialOrgs,
    totalUsers,
    storageUsedGb,
    storageLimitGb,
    storagePercentage,
    activePlansCount: (store.plans || []).length,
    planCounts,
    recentActivity: store.activityLogs || [],
  };
}

export async function getOrganizations() {
  const store = getStore();
  return (store.organizations || []).map((org) => ({
    ...org,
    storageUsedGb: Math.round((org.storageUsedMb || 0) / 1024),
    storageLimitGb: Math.round((org.storageLimitMb || 51200) / 1024),
  }));
}

export async function addOrganization(org) {
  const store = getStore();
  const newOrg = {
    id: `org-${Date.now()}`,
    name: org.name || 'New Organization',
    adminEmail: org.adminEmail || 'admin@example.com',
    usersCount: Number(org.usersCount) || 5,
    plan: org.plan || 'Pro',
    status: org.status || 'active',
    storageUsedMb: 0,
    storageLimitMb: Number(org.storageLimitMb) || 51200,
    createdAt: new Date().toISOString().split('T')[0],
  };
  store.organizations = [newOrg, ...(store.organizations || [])];
  saveStore(store);
  addActivityLog('Organization Created', `Provisioned tenant '${newOrg.name}' with ${newOrg.plan} plan.`, 'org');
  return newOrg;
}

export async function updateOrganization(id, updates) {
  const store = getStore();
  let updated = null;
  store.organizations = (store.organizations || []).map((o) => {
    if (o.id === id) {
      updated = { ...o, ...updates };
      return updated;
    }
    return o;
  });
  saveStore(store);
  if (updated) {
    addActivityLog('Organization Updated', `Updated tenant '${updated.name}' details.`, 'org');
  }
  return updated;
}

export async function deleteOrganization(id) {
  const store = getStore();
  const target = (store.organizations || []).find((o) => o.id === id);
  store.organizations = (store.organizations || []).filter((o) => o.id !== id);
  saveStore(store);
  if (target) {
    addActivityLog('Organization Deleted', `Deleted tenant account '${target.name}'.`, 'org');
  }
  return true;
}

export async function getPlans() {
  const store = getStore();
  return store.plans || [];
}

export async function addPlan(plan) {
  const store = getStore();
  const newPlan = {
    id: `plan-${Date.now()}`,
    name: plan.name || 'Custom Tier',
    price: plan.price || '$99/mo',
    storageLimitMb: Number(plan.storageLimitMb) || 51200,
    maxUsers: Number(plan.maxUsers) || 10,
    description: plan.description || 'Custom pricing tier',
    features: plan.features || ['Standard Support'],
    isPopular: false,
  };
  store.plans = [...(store.plans || []), newPlan];
  saveStore(store);
  addActivityLog('Plan Created', `Created subscription tier '${newPlan.name}'.`, 'plan');
  return newPlan;
}

export async function updatePlan(id, updates) {
  const store = getStore();
  let updated = null;
  store.plans = (store.plans || []).map((p) => {
    if (p.id === id) {
      updated = { ...p, ...updates };
      return updated;
    }
    return p;
  });
  saveStore(store);
  if (updated) {
    addActivityLog('Plan Updated', `Modified subscription plan '${updated.name}'.`, 'plan');
  }
  return updated;
}

export async function deletePlan(id) {
  const store = getStore();
  const target = (store.plans || []).find((p) => p.id === id);
  store.plans = (store.plans || []).filter((p) => p.id !== id);
  saveStore(store);
  if (target) {
    addActivityLog('Plan Deleted', `Removed subscription plan '${target.name}'.`, 'plan');
  }
  return true;
}

export async function assignPlanToOrganization(orgId, planName) {
  const store = getStore();
  let updatedOrg = null;
  store.organizations = (store.organizations || []).map((o) => {
    if (o.id === orgId) {
      updatedOrg = { ...o, plan: planName };
      return updatedOrg;
    }
    return o;
  });
  saveStore(store);
  if (updatedOrg) {
    addActivityLog('Plan Assigned', `Assigned '${planName}' tier to '${updatedOrg.name}'.`, 'plan');
  }
  return updatedOrg;
}

export async function getStorageStats() {
  const store = getStore();
  const orgs = store.organizations || [];
  const storageUsedMb = orgs.reduce((acc, o) => acc + (Number(o.storageUsedMb) || 0), 0);
  const storageLimitMb = orgs.reduce((acc, o) => acc + (Number(o.storageLimitMb) || 0), 0);
  return {
    storageUsedGb: Math.round(storageUsedMb / 1024),
    storageLimitGb: Math.round(storageLimitMb / 1024) || 1,
  };
}

export async function getEmailTemplates() {
  const store = getStore();
  return store.emailTemplates || [];
}

export async function updateEmailTemplate(id, updates) {
  const store = getStore();
  let updated = null;
  store.emailTemplates = (store.emailTemplates || []).map((t) => {
    if (t.id === id) {
      updated = { ...t, ...updates, updatedAt: new Date().toISOString() };
      return updated;
    }
    return t;
  });
  saveStore(store);
  if (updated) {
    addActivityLog('Email Template Updated', `Updated '${updated.name}' notification template.`, 'email');
  }
  return updated;
}
