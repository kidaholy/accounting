import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/db';
import { SystemSetting } from '@/lib/models';

export async function GET() {
    try {
        const session = await auth();
        if (!session || !session.user || session.user.role !== 'super_admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const settings = await SystemSetting.find({});

        // Convert to a simple key-value object for easier frontend use
        const settingsObj = settings.reduce((acc: any, s) => {
            acc[s.key] = s.value;
            return acc;
        }, {});

        return NextResponse.json({ success: true, data: settingsObj });
    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session || !session.user || session.user.role !== 'super_admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const body = await request.json();
        const { key, value, description } = body;

        if (!key) {
            return NextResponse.json({ error: 'Key is required' }, { status: 400 });
        }

        const setting = await SystemSetting.findOneAndUpdate(
            { key },
            { value, description, updatedAt: Date.now() },
            { upsert: true, new: true }
        );

        return NextResponse.json({ success: true, data: setting });
    } catch (error) {
        console.error('Error updating setting:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
