import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { StockInventory } from '@/lib/models';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = session.user.tenantId;

    await connectDB();

    const items = await StockInventory.find({ tenant: tenantId });
    return NextResponse.json(items.map(i => ({ ...i.toObject(), id: i._id })));
  } catch (err) {
    console.error('Error fetching inventory:', err);
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = session.user.tenantId;

    await connectDB();
    const body = await request.json();

    const newItem = await StockInventory.create({ ...body, tenant: tenantId });
    return NextResponse.json({ ...newItem.toObject(), id: newItem._id });
  } catch (err) {
    console.error('Error creating inventory item:', err);
    return NextResponse.json({ error: 'Failed to create inventory item' }, { status: 500 });
  }
}
