import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/db';
import { SystemSetting } from '@/lib/models';

export async function GET() {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const setting = await SystemSetting.findOne({ key: 'vat_rate' });

        // Default to 15 if not set
        const vatRate = setting ? parseFloat(setting.value) : 15;

        return NextResponse.json({ success: true, vatRate });
    } catch (error) {
        console.error('Error fetching VAT setting:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
