import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/db';
import { Tenant, User } from '@/lib/models';

export async function GET() {
    try {
        const session = await auth();

        if (!session || session.user.role !== 'super_admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const [
            totalTenants,
            activeTenants,
            totalUsers,
            activeUsers,
            recentTenants
        ] = await Promise.all([
            Tenant.countDocuments(),
            Tenant.countDocuments({ subscriptionStatus: 'active' }),
            User.countDocuments(),
            User.countDocuments({ isActive: true }),
            Tenant.find().sort({ createdAt: -1 }).limit(5)
        ]);

        return NextResponse.json({
            totalTenants,
            activeTenants,
            totalUsers,
            activeUsers,
            recentTenants: recentTenants.map(t => ({
                id: t._id,
                name: t.name,
                email: t.email,
                plan: t.subscriptionPlan,
                status: t.subscriptionStatus,
                createdAt: t.createdAt
            }))
        });
    } catch (error: any) {
        console.error('Error fetching admin stats:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
