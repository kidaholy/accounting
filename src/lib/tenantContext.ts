import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import mongoose from 'mongoose';
import connectDB from './db';
import { Tenant, PlatformSettings } from './models/platform';
import { 
  AccountSchema, 
  TransactionSchema, 
  InventorySchema, 
  FixedAssetSchema, 
  ReportSchema 
} from './models/tenant';

// Tenant Context Interface
export interface TenantContext {
  tenantId: string;
  schemaPrefix: string;
  userId: string;
  userRole: string;
  userEmail: string;
  organizationName: string;
  subscriptionPlan: string;
  subscriptionStatus: string;
}

// Permission checking
export const PERMISSIONS = {
  // Transaction permissions
  'transactions:read': ['super_admin', 'tenant_admin', 'accountant', 'staff', 'viewer'],
  'transactions:create': ['super_admin', 'tenant_admin', 'accountant', 'staff'],
  'transactions:update': ['super_admin', 'tenant_admin', 'accountant'],
  'transactions:delete': ['super_admin', 'tenant_admin'],
  'transactions:post': ['super_admin', 'tenant_admin', 'accountant'],
  
  // Inventory permissions
  'inventory:read': ['super_admin', 'tenant_admin', 'accountant', 'staff', 'viewer'],
  'inventory:create': ['super_admin', 'tenant_admin', 'accountant', 'staff'],
  'inventory:update': ['super_admin', 'tenant_admin', 'accountant', 'staff'],
  'inventory:delete': ['super_admin', 'tenant_admin'],
  'inventory:adjust': ['super_admin', 'tenant_admin', 'accountant'],
  
  // Asset permissions
  'assets:read': ['super_admin', 'tenant_admin', 'accountant', 'staff', 'viewer'],
  'assets:create': ['super_admin', 'tenant_admin', 'accountant'],
  'assets:update': ['super_admin', 'tenant_admin', 'accountant'],
  'assets:delete': ['super_admin', 'tenant_admin'],
  'assets:dispose': ['super_admin', 'tenant_admin', 'accountant'],
  
  // Report permissions
  'reports:read': ['super_admin', 'tenant_admin', 'accountant', 'staff', 'viewer'],
  'reports:create': ['super_admin', 'tenant_admin', 'accountant'],
  'reports:generate': ['super_admin', 'tenant_admin', 'accountant'],
  'reports:submit': ['super_admin', 'tenant_admin'],
  'reports:approve': ['super_admin', 'tenant_admin'],
  'reports:export': ['super_admin', 'tenant_admin', 'accountant'],
  
  // User management permissions
  'users:read': ['super_admin', 'tenant_admin'],
  'users:create': ['super_admin', 'tenant_admin'],
  'users:update': ['super_admin', 'tenant_admin'],
  'users:delete': ['super_admin', 'tenant_admin'],
  'users:invite': ['super_admin', 'tenant_admin'],
  
  // Settings permissions
  'settings:read': ['super_admin', 'tenant_admin', 'accountant'],
  'settings:update': ['super_admin', 'tenant_admin'],
  
  // Admin permissions
  'admin:tenants:read': ['super_admin'],
  'admin:tenants:manage': ['super_admin'],
  'admin:stats:read': ['super_admin'],
  'admin:audit:read': ['super_admin', 'tenant_admin'],
};

export function checkPermission(userRole: string, permission: string): boolean {
  const allowedRoles = PERMISSIONS[permission as keyof typeof PERMISSIONS];
  if (!allowedRoles) return false;
  return allowedRoles.includes(userRole);
}

// Resolve tenant context from request
export async function resolveTenantContext(req: NextRequest): Promise<TenantContext> {
  await connectDB();
  
  // Extract token from request
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  if (!token) {
    throw new Error('Unauthorized: No valid token');
  }
  
  const tenantId = token.tenantId as string;
  const userId = token.sub as string;
  const userRole = token.role as string;
  const userEmail = token.email as string;
  
  if (!tenantId && userRole !== 'super_admin') {
    throw new Error('Unauthorized: No tenant assigned');
  }
  
  // Super admin bypass - create context without tenant validation
  if (userRole === 'super_admin' && !tenantId) {
    return {
      tenantId: 'platform',
      schemaPrefix: '',
      userId,
      userRole,
      userEmail,
      organizationName: 'Platform Admin',
      subscriptionPlan: 'enterprise',
      subscriptionStatus: 'active'
    };
  }
  
  // Fetch tenant details
  const tenant = await Tenant.findOne({ tenantId });
  
  if (!tenant) {
    throw new Error('Tenant not found');
  }
  
  if (!tenant.isActive) {
    throw new Error('Tenant is inactive');
  }
  
  // Check subscription status
  if (tenant.subscription.status === 'suspended') {
    throw new Error(`Subscription suspended: ${tenant.suspendedReason || 'Contact support'}`);
  }
  
  if (tenant.subscription.status === 'expired' || tenant.subscription.status === 'cancelled') {
    throw new Error('Subscription expired. Please renew to continue.');
  }
  
  // Check trial period
  if (tenant.subscription.status === 'trial' && tenant.subscription.trialEndsAt) {
    if (new Date() > tenant.subscription.trialEndsAt) {
      throw new Error('Trial period has ended. Please subscribe to continue.');
    }
  }
  
  return {
    tenantId,
    schemaPrefix: tenant.schemaPrefix,
    userId,
    userRole,
    userEmail,
    organizationName: tenant.organizationName,
    subscriptionPlan: tenant.subscription.planId,
    subscriptionStatus: tenant.subscription.status
  };
}

// Get tenant-specific collection
export function getTenantCollection(context: TenantContext, collectionName: string) {
  if (context.userRole === 'super_admin' && context.tenantId === 'platform') {
    throw new Error('Super admin must specify a tenant for data operations');
  }
  
  const fullCollectionName = `${context.schemaPrefix}${collectionName}`;
  return mongoose.connection.collection(fullCollectionName);
}

// Get tenant-specific Mongoose model
export function getTenantModel(context: TenantContext, modelName: string) {
  if (context.userRole === 'super_admin' && context.tenantId === 'platform') {
    throw new Error('Super admin must specify a tenant for data operations');
  }
  
  const collectionName = `${context.schemaPrefix}${modelName}`;
  
  // Return existing model if already compiled
  if (mongoose.models[collectionName]) {
    return mongoose.models[collectionName];
  }
  
  // Create model based on model name
  let schema;
  switch (modelName) {
    case 'accounts':
      schema = AccountSchema;
      break;
    case 'transactions':
      schema = TransactionSchema;
      break;
    case 'inventory':
      schema = InventorySchema;
      break;
    case 'fixed_assets':
      schema = FixedAssetSchema;
      break;
    case 'reports':
      schema = ReportSchema;
      break;
    default:
      throw new Error(`Unknown model: ${modelName}`);
  }
  
  return mongoose.model(collectionName, schema, collectionName);
}

// Get platform settings
export async function getPlatformSettings() {
  await connectDB();
  
  let settings = await PlatformSettings.findOne();
  
  if (!settings) {
    // Initialize default settings
    settings = await PlatformSettings.create({
      subscriptionPlans: [
        {
          planId: 'basic',
          name: 'Basic Plan',
          description: 'Perfect for small businesses',
          price: 500,
          billingCycle: 'monthly',
          features: {
            maxUsers: 3,
            maxTransactions: 5000,
            storageLimitGB: 5,
            advancedReporting: false,
            prioritySupport: false,
            apiAccess: false
          }
        },
        {
          planId: 'professional',
          name: 'Professional Plan',
          description: 'For growing businesses',
          price: 1500,
          billingCycle: 'monthly',
          features: {
            maxUsers: 10,
            maxTransactions: 50000,
            storageLimitGB: 25,
            advancedReporting: true,
            prioritySupport: true,
            apiAccess: false
          }
        },
        {
          planId: 'enterprise',
          name: 'Enterprise Plan',
          description: 'Full features for large organizations',
          price: 5000,
          billingCycle: 'monthly',
          features: {
            maxUsers: 100,
            maxTransactions: 500000,
            storageLimitGB: 100,
            advancedReporting: true,
            prioritySupport: true,
            apiAccess: true
          }
        }
      ],
      platformConfig: {
        vatRate: 0.15,
        depreciationRate: 0.20,
        fiscalYearStart: '01-01',
        currency: 'ETB',
        ethiopianCalendarOffset: 7,
        trialPeriodDays: 14
      }
    });
  }
  
  return settings;
}

// Check subscription limits
export async function checkSubscriptionLimit(
  context: TenantContext,
  limitType: 'users' | 'transactions' | 'assets' | 'inventory' | 'storage'
): Promise<{ allowed: boolean; current: number; limit: number }> {
  await connectDB();
  
  const tenant = await Tenant.findOne({ tenantId: context.tenantId });
  if (!tenant) {
    throw new Error('Tenant not found');
  }
  
  const settings = await getPlatformSettings();
  const plan = settings.subscriptionPlans.find((p: any) => p.planId === tenant.subscription.planId);
  
  if (!plan) {
    throw new Error('Invalid subscription plan');
  }
  
  let current = 0;
  let limit = 0;
  
  switch (limitType) {
    case 'users':
      current = tenant.usage.currentUsers;
      limit = plan.features.maxUsers;
      break;
    case 'transactions':
      current = tenant.usage.currentTransactions;
      limit = plan.features.maxTransactions;
      break;
    case 'assets':
      current = tenant.usage.currentAssets;
      limit = plan.features.maxAssets || 1000;
      break;
    case 'inventory':
      current = tenant.usage.currentInventoryItems;
      limit = plan.features.maxInventoryItems || 5000;
      break;
    case 'storage':
      current = tenant.usage.storageUsedMB;
      limit = (plan.features.storageLimitGB || 1) * 1024;
      break;
  }
  
  return {
    allowed: current < limit,
    current,
    limit
  };
}

// Update tenant usage
export async function updateTenantUsage(
  context: TenantContext,
  usageType: 'users' | 'transactions' | 'assets' | 'inventory' | 'storage',
  delta: number
): Promise<void> {
  await connectDB();
  
  const fieldMap = {
    users: 'usage.currentUsers',
    transactions: 'usage.currentTransactions',
    assets: 'usage.currentAssets',
    inventory: 'usage.currentInventoryItems',
    storage: 'usage.storageUsedMB'
  };
  
  await Tenant.updateOne(
    { tenantId: context.tenantId },
    {
      $inc: { [fieldMap[usageType]]: delta },
      $set: { 'usage.lastCalculatedAt': new Date() }
    }
  );
}

// Generate unique IDs
export function generateId(prefix: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}_${random}`;
}

// Generate tenant prefix
export function generateTenantPrefix(tenantId: string): string {
  return `t_${tenantId.replace('tenant_', '')}_`;
}
