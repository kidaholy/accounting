import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { FixedAsset } from '@/lib/models';

// Initialize database with sample data if empty
const initializeDB = async () => {
  try {
    const assetsCount = await FixedAsset.countDocuments();
    if (assetsCount === 0) {
      console.log('Seeding initial Fixed Assets...');
      await FixedAsset.insertMany([
        { name: 'Generator', cost_beginning: 21739.13, dep_rate: 0.20, dep_beginning: 21739.13 },
        { name: 'Furniture', cost_beginning: 44347.82, dep_rate: 0.20, dep_beginning: 44347.82 },
        { name: 'Other Equipment', cost_beginning: 31524.13, dep_rate: 0.20, dep_beginning: 31524.13 },
        { name: 'Television', cost_beginning: 29565.22, dep_rate: 0.20, dep_beginning: 16753.61, dep_addition: 5913.04 }
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
    
    const assets = await FixedAsset.find();
    // Map _id to id for frontend compatibility
    return NextResponse.json(assets.map(a => ({ ...a.toObject(), id: a._id })));
  } catch (err) {
    console.error('Error fetching assets:', err);
    return NextResponse.json({ error: 'Failed to fetch assets' }, { status: 500 });
  }
}
