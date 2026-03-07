import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/db';
import { Transaction } from '@/lib/models';

export async function GET(request: Request) {
    try {
        const session = await auth();
        if (!session || !session.user || !session.user.tenantId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const transactions = await Transaction.find({ tenant: session.user.tenantId }).sort({ date: -1 });
        return NextResponse.json({ success: true, data: transactions });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session || !session.user || !session.user.tenantId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check role (viewers shouldn't create transactions)
        if (session.user.role === 'viewer') {
            return NextResponse.json({ error: 'Forbidden. Read-only access.' }, { status: 403 });
        }

        await connectDB();
        const body = await request.json();

        const newTransaction = await Transaction.create({
            tenant: session.user.tenantId,
            ...body
        });

        return NextResponse.json({ success: true, data: newTransaction }, { status: 201 });
    } catch (error) {
        console.error('Error creating transaction:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
