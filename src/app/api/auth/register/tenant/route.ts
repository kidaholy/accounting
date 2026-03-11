import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import { Tenant, User, PlatformSettings } from '@/lib/models/platform';
import { generateId, generateTenantPrefix, getPlatformSettings } from '@/lib/tenantContext';
import { logAudit } from '@/lib/auditService';

// Initialize default chart of accounts for a new tenant
async function initializeChartOfAccounts(tenantPrefix: string) {
  const mongoose = (await import('mongoose')).default;
  const collectionName = `${tenantPrefix}accounts`;
  const collection = mongoose.connection.collection(collectionName);
  
  const defaultAccounts = [
    // Assets (1000-1999)
    { accountCode: '1000', accountName: 'Cash on Hand', accountType: 'asset', accountCategory: 'current_asset', openingBalance: 0, currentBalance: 0 },
    { accountCode: '1100', accountName: 'Bank Accounts', accountType: 'asset', accountCategory: 'current_asset', openingBalance: 0, currentBalance: 0 },
    { accountCode: '1200', accountName: 'Trade Receivables', accountType: 'asset', accountCategory: 'current_asset', openingBalance: 0, currentBalance: 0 },
    { accountCode: '1300', accountName: 'Inventory', accountType: 'asset', accountCategory: 'current_asset', openingBalance: 0, currentBalance: 0 },
    { accountCode: '1400', accountName: 'Prepaid Expenses', accountType: 'asset', accountCategory: 'current_asset', openingBalance: 0, currentBalance: 0 },
    { accountCode: '1500', accountName: 'Property and Equipment', accountType: 'asset', accountCategory: 'fixed_asset', openingBalance: 0, currentBalance: 0 },
    { accountCode: '1600', accountName: 'Accumulated Depreciation', accountType: 'asset', accountCategory: 'fixed_asset', openingBalance: 0, currentBalance: 0 },
    
    // Liabilities (2000-2999)
    { accountCode: '2000', accountName: 'Profit Tax Payable', accountType: 'liability', accountCategory: 'current_liability', openingBalance: 0, currentBalance: 0 },
    { accountCode: '2100', accountName: 'VAT Payable', accountType: 'liability', accountCategory: 'current_liability', openingBalance: 0, currentBalance: 0 },
    { accountCode: '2200', accountName: 'Trade Payables', accountType: 'liability', accountCategory: 'current_liability', openingBalance: 0, currentBalance: 0 },
    { accountCode: '2300', accountName: 'Accrued Expenses', accountType: 'liability', accountCategory: 'current_liability', openingBalance: 0, currentBalance: 0 },
    
    // Equity (3000-3999)
    { accountCode: '3000', accountName: 'Retained Earnings', accountType: 'equity', accountCategory: 'equity', openingBalance: 0, currentBalance: 0 },
    { accountCode: '3100', accountName: 'Net Income', accountType: 'equity', accountCategory: 'equity', openingBalance: 0, currentBalance: 0 },
    
    // Revenue (4000-4999)
    { accountCode: '4100', accountName: 'Food Sales', accountType: 'revenue', accountCategory: 'revenue', openingBalance: 0, currentBalance: 0 },
    { accountCode: '4200', accountName: 'Drink Sales', accountType: 'revenue', accountCategory: 'revenue', openingBalance: 0, currentBalance: 0 },
    { accountCode: '4300', accountName: 'Other Revenue', accountType: 'revenue', accountCategory: 'revenue', openingBalance: 0, currentBalance: 0 },
    
    // Cost of Sales (5000-5999)
    { accountCode: '5100', accountName: 'Food Materials', accountType: 'expense', accountCategory: 'cost_of_sales', openingBalance: 0, currentBalance: 0 },
    { accountCode: '5200', accountName: 'Beverage Costs', accountType: 'expense', accountCategory: 'cost_of_sales', openingBalance: 0, currentBalance: 0 },
    
    // Operating Expenses (6000-6999)
    { accountCode: '6100', accountName: 'Salaries and Wages', accountType: 'expense', accountCategory: 'operating_expense', openingBalance: 0, currentBalance: 0 },
    { accountCode: '6200', accountName: 'Supplies Expense', accountType: 'expense', accountCategory: 'operating_expense', openingBalance: 0, currentBalance: 0 },
    { accountCode: '6300', accountName: 'Rent Expense', accountType: 'expense', accountCategory: 'operating_expense', openingBalance: 0, currentBalance: 0 },
    { accountCode: '6400', accountName: 'Utilities Expense', accountType: 'expense', accountCategory: 'operating_expense', openingBalance: 0, currentBalance: 0 },
    { accountCode: '6500', accountName: 'Depreciation Expense', accountType: 'expense', accountCategory: 'operating_expense', openingBalance: 0, currentBalance: 0 },
    
    // Other Expenses (7000-7999)
    { accountCode: '7000', accountName: 'Other Expenses', accountType: 'expense', accountCategory: 'other_expense', openingBalance: 0, currentBalance: 0 },
  ];
  
  await collection.insertMany(defaultAccounts);
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const body = await req.json();
    const {
      organizationName,
      organizationType,
      email,
      password,
      phone,
      tin,
      vatNumber,
      address,
      planId = 'basic'
    } = body;
    
    // Validation
    if (!organizationName || !email || !password || !tin) {
      return NextResponse.json(
        { error: 'Missing required fields: organizationName, email, password, tin' },
        { status: 400 }
      );
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }
    
    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }
    
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }
    
    // Check if TIN already exists
    const existingTenant = await Tenant.findOne({ 'registration.tin': tin });
    if (existingTenant) {
      return NextResponse.json(
        { error: 'TIN already registered' },
        { status: 409 }
      );
    }
    
    // Get platform settings
    const platformSettings = await getPlatformSettings();
    
    // Validate plan
    const plan = platformSettings.subscriptionPlans.find(p => p.planId === planId);
    if (!plan || !plan.isActive) {
      return NextResponse.json(
        { error: 'Invalid or inactive subscription plan' },
        { status: 400 }
      );
    }
    
    // Generate unique IDs
    const tenantId = generateId('tenant');
    const schemaPrefix = generateTenantPrefix(tenantId);
    const userId = generateId('user');
    
    // Calculate trial end date
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + platformSettings.platformConfig.trialPeriodDays);
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create tenant
    const tenant = await Tenant.create({
      tenantId,
      organizationName,
      organizationType: organizationType || 'other',
      registration: {
        tin,
        vatNumber: vatNumber || '',
        registrationDate: new Date()
      },
      contact: {
        email,
        phone: phone || '',
        address: {
          street: address?.street || '',
          city: address?.city || '',
          region: address?.region || '',
          country: address?.country || 'Ethiopia'
        }
      },
      subscription: {
        planId,
        status: 'trial',
        startDate: new Date(),
        trialEndsAt,
        renewalDate: trialEndsAt,
        paymentMethod: { type: 'none' },
        billingHistory: []
      },
      schemaPrefix,
      settings: {
        fiscalYearEnd: '06-30',
        baseCurrency: 'ETB',
        timezone: 'Africa/Addis_Ababa',
        dateFormat: 'dd/mm/yyyy',
        valuationMethod: 'average'
      },
      usage: {
        currentUsers: 1,
        currentTransactions: 0,
        currentAssets: 0,
        currentInventoryItems: 0,
        storageUsedMB: 0
      },
      isActive: true
    });
    
    // Create tenant admin user
    const user = await User.create({
      userId,
      tenantId,
      email,
      passwordHash,
      firstName: organizationName.split(' ')[0] || 'Admin',
      lastName: organizationName.split(' ').slice(1).join(' ') || 'User',
      phone: phone || '',
      role: 'tenant_admin',
      permissions: [],
      isActive: true,
      emailVerified: false
    });
    
    // Initialize chart of accounts for tenant
    await initializeChartOfAccounts(schemaPrefix);
    
    // Log the registration
    await logAudit(
      {
        tenantId,
        schemaPrefix,
        userId,
        userRole: 'tenant_admin',
        userEmail: email,
        organizationName,
        subscriptionPlan: planId,
        subscriptionStatus: 'trial'
      },
      {
        action: 'CREATE',
        entityType: 'tenant',
        entityId: tenantId,
        changes: {
          after: {
            organizationName,
            email,
            tin,
            planId
          }
        }
      }
    );
    
    return NextResponse.json({
      success: true,
      message: 'Tenant registered successfully',
      data: {
        tenantId,
        organizationName,
        email,
        trialEndsAt,
        message: `Your ${platformSettings.platformConfig.trialPeriodDays}-day trial has started. Please complete payment before ${trialEndsAt.toLocaleDateString()} to continue using the service.`
      }
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Tenant registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
