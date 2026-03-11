import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { FixedAsset } from '@/lib/models';
import { auth } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user?.role === 'viewer') {
      return NextResponse.json({ error: 'Read-only access' }, { status: 403 });
    }

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user?.role === 'viewer') {
      return NextResponse.json({ error: 'Read-only access' }, { status: 403 });
    }

    await connectDB();
    const { id } = await params;
    
    const deleted = await FixedAsset.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, message: 'Asset deleted successfully' });
  } catch (err) {
    console.error('Error deleting asset:', err);
    return NextResponse.json({ error: 'Failed to delete asset' }, { status: 500 });
  }
}
