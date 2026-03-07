import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { FixedAsset } from '@/lib/models';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    
    const updated = await FixedAsset.findByIdAndUpdate(id, body, { new: true });
    if (!updated) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }
    
    return NextResponse.json({ ...updated.toObject(), id: updated._id });
  } catch (err) {
    console.error('Error updating asset:', err);
    return NextResponse.json({ error: 'Failed to update asset' }, { status: 500 });
  }
}
