import { NextResponse } from 'next/server';
import {
  getPlans,
  addPlan,
  updatePlan,
  deletePlan,
  assignPlanToOrganization,
} from '@/lib/business-owner/store';

export async function GET() {
  try {
    const plans = await getPlans();
    return NextResponse.json({ plans });
  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plans' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.name || !body.price) {
      return NextResponse.json(
        { error: 'Plan name and price are required' },
        { status: 400 }
      );
    }
    const created = await addPlan(body);
    const all = await getPlans();
    return NextResponse.json({ plan: created, plans: all }, { status: 201 });
  } catch (error) {
    console.error('Error creating plan:', error);
    return NextResponse.json(
      { error: 'Failed to create plan' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    if (!body.planId) {
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400 }
      );
    }
    const updated = await updatePlan(body.planId, body);
    const all = await getPlans();
    return NextResponse.json({ plan: updated, plans: all });
  } catch (error) {
    console.error('Error updating plan:', error);
    return NextResponse.json(
      { error: 'Failed to update plan' },
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
        { error: 'Plan ID is required' },
        { status: 400 }
      );
    }
    await deletePlan(id);
    const all = await getPlans();
    return NextResponse.json({ success: true, plans: all });
  } catch (error) {
    console.error('Error deleting plan:', error);
    return NextResponse.json(
      { error: 'Failed to delete plan' },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    if (body.action === 'assign') {
      const { orgId, planName } = body;
      if (!orgId || !planName) {
        return NextResponse.json(
          { error: 'orgId and planName are required' },
          { status: 400 }
        );
      }
      const updatedOrg = await assignPlanToOrganization(orgId, planName);
      return NextResponse.json({ success: true, organization: updatedOrg });
    }
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in plans patch:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
