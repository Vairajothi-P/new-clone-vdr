import { NextResponse } from 'next/server';
import {
  getEmailTemplates,
  updateEmailTemplate,
} from '@/lib/business-owner/store';

export async function GET() {
  try {
    const templates = await getEmailTemplates();
    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Error fetching email templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch email templates' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }
    const updated = await updateEmailTemplate(body.id, {
      subject: body.subject,
      body: body.body,
    });
    const all = await getEmailTemplates();
    return NextResponse.json({ template: updated, templates: all });
  } catch (error) {
    console.error('Error updating email template:', error);
    return NextResponse.json(
      { error: 'Failed to update email template' },
      { status: 500 }
    );
  }
}
