import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { StockInventory } from '@/lib/models';

// Initialize database with sample data if empty
const initializeDB = async () => {
  try {
    const stockCount = await StockInventory.countDocuments();
    if (stockCount === 0) {
      console.log('Seeding initial Stock Inventory...');
      await StockInventory.insertMany([
        { name: 'Acacia', unit: 'Number', quantity: 26, unit_cost: 1000.00 },
        { name: 'Ambo Water', unit: 'cart', quantity: 159, unit_cost: 27.00 },
        { name: 'Anbesa Beer', unit: 'cart', quantity: 36, unit_cost: 40.00 },
        { name: 'Areke Large', unit: 'Number', quantity: 16, unit_cost: 480.00 },
        { name: 'Areke haset 150ml', unit: 'Number', quantity: 7, unit_cost: 55.00 },
        { name: 'Areke haset 100ml', unit: 'Number', quantity: 45, unit_cost: 43.00 },
        { name: 'Awashe Large', unit: 'Number', quantity: 127, unit_cost: 305.00 },
        { name: 'Balageru - L', unit: 'Number', quantity: 154, unit_cost: 67.00 },
        { name: 'Camila', unit: 'Number', quantity: 17, unit_cost: 555.00 },
        { name: 'Other beer', unit: 'cart', quantity: 2690, unit_cost: 58.33 },
        { name: 'Coca Cola', unit: 'cart', quantity: 1204, unit_cost: 25.00 }
      ]);
    }
  } catch (error) {
    console.error('Error initializing data:', error);
  }
};

export async function GET() {
  try {
    await connectDB();
    await initializeDB();
    
    const items = await StockInventory.find();
    return NextResponse.json(items.map(i => ({ ...i.toObject(), id: i._id })));
  } catch (err) {
    console.error('Error fetching inventory:', err);
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    
    const newItem = await StockInventory.create(body);
    return NextResponse.json({ ...newItem.toObject(), id: newItem._id });
  } catch (err) {
    console.error('Error creating inventory item:', err);
    return NextResponse.json({ error: 'Failed to create inventory item' }, { status: 500 });
  }
}
