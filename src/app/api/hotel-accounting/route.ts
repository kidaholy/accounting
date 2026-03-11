import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import mongoose from 'mongoose';

const HotelAccountingSchema = new mongoose.Schema({
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    date: { type: Date, default: Date.now },
    purchases: [{
        name: String,
        unit: String,
        quantity: Number,
        unitCost: Number,
        totalCost: Number
    }],
    sales: [{
        name: String,
        quantity: Number,
        unitPrice: Number,
        totalAmount: Number
    }],
    expenses: [{
        category: String,
        amount: Number
    }],
    capital: {
        opening: { type: Number, default: 0 },
        assets: {
            cash: { type: Number, default: 0 },
            receivables: { type: Number, default: 0 },
            fixedAssets: { type: Number, default: 0 }
        },
        liabilities: {
            payables: { type: Number, default: 0 },
            loans: { type: Number, default: 0 }
        }
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const HotelAccounting = mongoose.models.HotelAccounting || mongoose.model('HotelAccounting', HotelAccountingSchema);

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const tenantId = req.headers.get('x-tenant-id') || 'default';
        
        const records = await HotelAccounting.find({ tenant: tenantId }).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, data: records });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();
        const tenantId = req.headers.get('x-tenant-id') || 'default';
        
        const record = await HotelAccounting.create({
            tenant: tenantId,
            ...body,
            updatedAt: new Date()
        });
        
        return NextResponse.json({ success: true, data: record });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();
        const { id, ...updateData } = body;
        
        const record = await HotelAccounting.findByIdAndUpdate(
            id,
            { ...updateData, updatedAt: new Date() },
            { new: true }
        );
        
        return NextResponse.json({ success: true, data: record });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
