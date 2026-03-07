import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { StockInventory } from '@/lib/models';
import { auth } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const updated = await StockInventory.findOneAndUpdate(
      { _id: id, tenant: session.user.tenantId },
      body,
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 });
    }

    return NextResponse.json({ ...updated.toObject(), id: updated._id });
  } catch (err) {
    console.error('Error updating inventory item:', err);
    return NextResponse.json({ error: 'Failed to update inventory item' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    const deleted = await StockInventory.findOneAndDelete({ _id: id, tenant: session.user.tenantId });

    if (!deleted) {
      return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Item deleted' });
  } catch (err) {
    console.error('Error deleting inventory item:', err);
    return NextResponse.json({ error: 'Failed to delete inventory item' }, { status: 500 });
  }
}
