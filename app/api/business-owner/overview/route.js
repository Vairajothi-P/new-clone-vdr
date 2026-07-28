import { NextResponse } from 'next/server';
import { getOverviewStats } from '@/lib/business-owner/store';

export async function GET() {
  try {
    const stats = await getOverviewStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching owner overview:', error);
    return NextResponse.json(
      { error: 'Failed to fetch overview data' },
      { status: 500 }
    );
  }
}
