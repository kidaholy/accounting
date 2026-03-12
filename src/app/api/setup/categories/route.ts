import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/db';
import { ProductCategory } from '@/lib/models';

export async function GET() {
    try {
        const session = await auth();
        if (!session || !session.user || !session.user.tenantId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const categories = await ProductCategory.find({ tenant: session.user.tenantId })
            .sort({ name: 1 });

        return NextResponse.json({ success: true, data: categories });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session || !session.user || !session.user.tenantId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { name, type, accountCode, hasVat } = await request.json();
        if (!name || !type) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await connectDB();
        const category = await ProductCategory.create({
            tenant: session.user.tenantId,
            name,
            type,
            accountCode,
            hasVat: hasVat !== undefined ? hasVat : true
        });

        return NextResponse.json({ success: true, data: category });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
export async function DELETE(request: Request) {
    try {
        const session = await auth();
        if (!session || !session.user || !session.user.tenantId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
        }

        await connectDB();
        await ProductCategory.findOneAndDelete({
            _id: id,
            tenant: session.user.tenantId
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
