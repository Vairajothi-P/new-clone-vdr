import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET() {
  try {
    // Fetch companies
    const { data: companies, error: compErr } = await supabaseAdmin
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false });

    if (compErr) throw compErr;

    // Fetch subscriptions to get plan info (Note: your subscriptions schema does not have plan_id or plans relation, so we fetch what is available)
    const { data: subscriptions, error: subErr } = await supabaseAdmin
      .from('subscriptions')
      .select('*');

    if (subErr) throw subErr;

    // Fetch users to get user counts
    const { data: users, error: usersErr } = await supabaseAdmin
      .from('users')
      .select('company_id');
      
    if (usersErr) throw usersErr;

    // Format data for the BO Dashboard
    const formattedOrgs = companies.map(company => {
      const sub = subscriptions?.find(s => s.company_id === company.id) || {};
      const usersCount = users?.filter(u => u.company_id === company.id).length || 0;
      
      return {
        id: company.id,
        name: company.name,
        adminEmail: company.email,
        usersCount: usersCount,
        plan: company.plan_name || 'Standard VDR',
        status: company.status,
        storageUsedMb: 0, // Placeholder, actual storage calculation requires file tracking
        storageLimitMb: sub.storage_limit_mb || 0,
        createdAt: company.created_at,
      };
    });

    return NextResponse.json({ organizations: formattedOrgs });
  } catch (error) {
    console.error('Error getting organizations from Supabase:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organizations' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  return NextResponse.json(
    { error: 'Organizations should be created via /register endpoint' },
    { status: 400 }
  );
}

export async function PUT(request) {
  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 });
    }

    // In the BO dashboard, the PUT is used for Edit OR Approval.
    // If the BO is "Approving" the company:
    const updateData = {};
    if (body.status) updateData.status = body.status;
    // other fields can be updated as needed
    
    // Update Company
    const { data: updatedCompany, error: updateErr } = await supabaseAdmin
      .from('companies')
      .update(updateData)
      .eq('id', body.id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    // Update Subscription (Storage, Users Limit, Status)
    if (body.status === 'active') {
      await supabaseAdmin
        .from('subscriptions')
        .update({
           plan_status: 'active',
           // Note: if the BO dashboard sent updated storageLimitMb, we'd update it here:
           storage_limit_mb: body.storageLimitMb,
        })
        .eq('company_id', body.id);
        
      // Update Users status to active for this company
      await supabaseAdmin
        .from('users')
        .update({ status: 'active' })
        .eq('company_id', body.id);

      // Send Activation Email to Super Admin
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_PORT === '465',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        const mailOptions = {
          from: `"VDR System" <${process.env.SMTP_USER}>`,
          to: updatedCompany.email,
          subject: `Your VDR Account has been Approved!`,
          html: `
            <h2>Welcome to VDR!</h2>
            <p>Your organization <strong>${updatedCompany.name}</strong> has been approved.</p>
            <p>You can now log in and access your workspace.</p>
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/login">Login Here</a></p>
          `,
        };
        await transporter.sendMail(mailOptions);
      } catch (mailErr) {
        console.error("Failed to send activation email:", mailErr);
      }
    }

    // Return the updated list
    return GET();
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
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 });
    }
    
    // Note: Supabase constraints might require deleting users/subscriptions first if cascading isn't on.
    const { error: delErr } = await supabaseAdmin
      .from('companies')
      .delete()
      .eq('id', id);

    if (delErr) throw delErr;

    return GET();
  } catch (error) {
    console.error('Error deleting organization:', error);
    return NextResponse.json(
      { error: 'Failed to delete organization' },
      { status: 500 }
    );
  }
}
