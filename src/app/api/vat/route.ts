import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { VatDeclaration } from '@/lib/models';

// Initialize database with sample data if empty
const initializeDB = async () => {
  try {
    const vatCount = await VatDeclaration.countDocuments();
    if (vatCount === 0) {
      console.log('Seeding initial VAT Declaration...');
      await VatDeclaration.create({
        taxable_sales: 49615311.42,
        local_purchases: 1819350.66,
        capital_assets: 48690.60,
        month_year: 'Current'
      });
    }
  } catch (error) {
    console.error('Error initializing data:', error);
  }
};

export async function GET() {
  try {
    await connectDB();
    await initializeDB();
    
    let vat = await VatDeclaration.findOne({ month_year: 'Current' });
    if (!vat) {
      vat = await VatDeclaration.create({ month_year: 'Current' });
    }
    return NextResponse.json({ ...vat.toObject(), id: vat._id });
  } catch (err) {
    console.error('Error fetching VAT:', err);
    return NextResponse.json({ error: 'Failed to fetch VAT' }, { status: 500 });
  }
}
