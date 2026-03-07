import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import { User, Tenant } from '@/lib/models';

export async function POST() {
  try {
    await connectDB();

    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ role: 'super_admin' });
    if (existingSuperAdmin) {
      return NextResponse.json({ message: 'Super admin already exists' }, { status: 400 });
    }

    // Create super admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const superAdmin = await User.create({
      name: 'Super Admin',
      email: 'superadmin@example.com',
      password: hashedPassword,
      role: 'super_admin',
      isActive: true,
    });

    // Create a demo tenant
    const demoTenant = await Tenant.create({
      name: 'Demo Company',
      email: 'demo@example.com',
      phone: '+251911111111',
      address: 'Addis Ababa, Ethiopia',
      subscriptionPlan: 'professional',
      subscriptionStatus: 'active',
      subscriptionStartDate: new Date(),
      subscriptionEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      maxUsers: 10,
      maxAssets: 1000,
      maxInventoryItems: 5000,
    });

    // Create tenant admin
    const tenantAdminPassword = await bcrypt.hash('admin123', 10);
    const tenantAdmin = await User.create({
      name: 'Tenant Admin',
      email: 'admin@example.com',
      password: tenantAdminPassword,
      role: 'tenant_admin',
      tenant: demoTenant._id,
      isActive: true,
    });

    // Create accountant user
    const accountantPassword = await bcrypt.hash('accountant123', 10);
    const accountant = await User.create({
      name: 'Accountant',
      email: 'accountant@example.com',
      password: accountantPassword,
      role: 'accountant',
      tenant: demoTenant._id,
      isActive: true,
    });

    return NextResponse.json({
      message: 'Seed data created successfully',
      users: [
        { email: superAdmin.email, role: superAdmin.role },
        { email: tenantAdmin.email, role: tenantAdmin.role },
        { email: accountant.email, role: accountant.role },
      ],
      tenant: {
        name: demoTenant.name,
        plan: demoTenant.subscriptionPlan,
      },
    });
  } catch (error: unknown) {
    console.error('Seed error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to seed data', details: errorMessage },
      { status: 500 }
    );
  }
}
