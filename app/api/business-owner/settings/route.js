import { NextResponse } from 'next/server';
import { getStore, saveStore, addActivityLog } from '@/lib/business-owner/store';

export async function GET() {
  try {
    const store = getStore();
    const admin = store.adminProfile || {
      name: 'Anushiya Selvaraj',
      email: 'owner@pibivdr.com',
    };
    return NextResponse.json({
      adminProfile: admin,
      maintenanceMode: store.maintenanceMode || false,
      defaultTrialDays: store.defaultTrialDays || 14,
      require2fa: store.require2fa !== false,
    });
  } catch (error) {
    console.error('Error getting settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const store = getStore();
    if (body.adminProfile) {
      store.adminProfile = { ...store.adminProfile, ...body.adminProfile };
      addActivityLog('Admin Profile Updated', `Updated executive profile for '${store.adminProfile.email}'.`, 'security');
    }
    if (body.systemSettings) {
      store.maintenanceMode = body.systemSettings.maintenanceMode;
      store.defaultTrialDays = body.systemSettings.defaultTrialDays;
      store.require2fa = body.systemSettings.require2fa;
      addActivityLog('System Settings Updated', 'Modified global VDR security and trial policies.', 'security');
    }
    saveStore(store);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
