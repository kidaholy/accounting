import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import { Tenant, User } from '@/lib/models';

export async function POST(req: Request) {
    try {
        const { businessName, businessEmail, adminName, adminEmail, adminPassword } = await req.json();

        // Basic validation
        if (!businessName || !businessEmail || !adminName || !adminEmail || !adminPassword) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        await connectDB();

        // Check for existing business email (tenant)
        const existingTenant = await Tenant.findOne({ email: businessEmail });
        if (existingTenant) {
            return NextResponse.json({ error: 'This business email is already registered' }, { status: 400 });
        }

        // Check for existing user email
        const existingUser = await User.findOne({ email: adminEmail });
        if (existingUser) {
            return NextResponse.json({ error: 'This admin email is already registered' }, { status: 400 });
        }

        // 1. Create the Tenant
        const tenant = await Tenant.create({
            name: businessName,
            email: businessEmail,
            subscriptionPlan: 'professional', // Defaulting to professional for now
            subscriptionStatus: 'active',
            subscriptionStartDate: new Date(),
        });

        // 2. Create the Admin User
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        const user = await User.create({
            name: adminName,
            email: adminEmail,
            password: hashedPassword,
            role: 'tenant_admin',
            tenant: tenant._id,
            isActive: true,
        });

        return NextResponse.json({
            message: 'Registration successful',
            tenantId: tenant._id,
            userId: user._id
        }, { status: 201 });

    } catch (error: any) {
        console.error('Registration error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
