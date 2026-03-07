import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/db';
import { FixedAsset, Tenant } from '@/lib/models';

// Helper to get tenant ID from session
async function getTenantId() {
  const session = await auth();
  if (!session?.user?.tenantId) {
    // For super admin without tenant, return null
    if (session?.user?.role === 'super_admin') {
      return null;
    }
    throw new Error('No tenant assigned');
  }
  return session.user.tenantId;
}

// Helper to check subscription limits
async function checkAssetLimit(tenantId: string) {
  const tenant = await Tenant.findById(tenantId);
  if (!tenant) throw new Error('Tenant not found');
  
  const currentCount = await FixedAsset.countDocuments({ tenant: tenantId });
  return currentCount < tenant.maxAssets;
}

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const tenantId = await getTenantId();
    
    // Super admin sees all assets, tenant users see only their assets
    const query = tenantId ? { tenant: tenantId } : {};
    const assets = await FixedAsset.find(query);
    
    return NextResponse.json(assets.map(a => ({ ...a.toObject(), id: a._id })));
  } catch (err) {
    console.error('Error fetching assets:', err);
    return NextResponse.json({ error: 'Failed to fetch assets' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'No tenant assigned' }, { status: 403 });
    }

    // Check role permissions
    if (session.user.role === 'viewer') {
      return NextResponse.json({ error: 'Read-only access' }, { status: 403 });
    }

    await connectDB();
    
    // Check subscription limit
    const canAdd = await checkAssetLimit(session.user.tenantId);
    if (!canAdd) {
      return NextResponse.json({ 
        error: 'Asset limit reached. Please upgrade your subscription.' 
      }, { status: 403 });
    }

    const body = await request.json();
    const newAsset = await FixedAsset.create({
      ...body,
      tenant: session.user.tenantId
    });
    
    return NextResponse.json({ ...newAsset.toObject(), id: newAsset._id });
  } catch (err) {
    console.error('Error creating asset:', err);
    return NextResponse.json({ error: 'Failed to create asset' }, { status: 500 });
  }
}
