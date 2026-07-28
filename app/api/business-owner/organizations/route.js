import { NextResponse } from 'next/server';
import {
  getOrganizations,
  addOrganization,
  updateOrganization,
  deleteOrganization,
} from '@/lib/business-owner/store';

export async function GET() {
  try {
    const orgs = await getOrganizations();
    return NextResponse.json({ organizations: orgs });
  } catch (error) {
    console.error('Error getting organizations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organizations' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.name || !body.adminEmail) {
      return NextResponse.json(
        { error: 'Name and Admin Email are required' },
        { status: 400 }
      );
    }
    const newOrg = await addOrganization(body);
    const all = await getOrganizations();
    return NextResponse.json({ organization: newOrg, organizations: all }, { status: 201 });
  } catch (error) {
    console.error('Error creating organization:', error);
    return NextResponse.json(
      { error: 'Failed to create organization' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      );
    }
    const updated = await updateOrganization(body.id, body);
    const all = await getOrganizations();
    return NextResponse.json({ organization: updated, organizations: all });
  } catch (error) {
    console.error('Error updating organization:', error);
    return NextResponse.json(
      { error: 'Failed to update organization' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      );
    }
    await deleteOrganization(id);
    const all = await getOrganizations();
    return NextResponse.json({ success: true, organizations: all });
  } catch (error) {
    console.error('Error deleting organization:', error);
    return NextResponse.json(
      { error: 'Failed to delete organization' },
      { status: 500 }
    );
  }
}
