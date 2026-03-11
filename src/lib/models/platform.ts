import mongoose from 'mongoose';

// Platform Settings Schema - Global configuration for the SaaS platform
const PlatformSettingsSchema = new mongoose.Schema({
  subscriptionPlans: [{
    planId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    billingCycle: { type: String, enum: ['monthly', 'quarterly', 'yearly'], default: 'monthly' },
    features: {
      maxUsers: { type: Number, default: 1 },
      maxTransactions: { type: Number, default: 1000 },
      storageLimitGB: { type: Number, default: 1 },
      advancedReporting: { type: Boolean, default: false },
      prioritySupport: { type: Boolean, default: false },
      apiAccess: { type: Boolean, default: false }
    },
    isActive: { type: Boolean, default: true }
  }],
  platformConfig: {
    vatRate: { type: Number, default: 0.15 },
    depreciationRate: { type: Number, default: 0.20 },
    fiscalYearStart: { type: String, default: '01-01' },
    currency: { type: String, default: 'ETB' },
    ethiopianCalendarOffset: { type: Number, default: 7 },
    trialPeriodDays: { type: Number, default: 14 }
  },
  updatedAt: { type: Date, default: Date.now }
});

// Enhanced Tenant Schema with full SaaS features
const TenantSchema = new mongoose.Schema({
  tenantId: { type: String, required: true, unique: true },
  organizationName: { type: String, required: true },
  organizationType: { 
    type: String, 
    enum: ['butcher', 'retail', 'manufacturing', 'service', 'other'],
    default: 'other'
  },
  
  // Registration Details
  registration: {
    tin: { type: String, required: true, unique: true },
    vatNumber: { type: String },
    registrationDate: { type: Date },
    businessLicense: { type: String }
  },
  
  // Contact Information
  contact: {
    email: { type: String, required: true },
    phone: { type: String },
    address: {
      street: { type: String },
      city: { type: String },
      region: { type: String },
      country: { type: String, default: 'Ethiopia' }
    }
  },
  
  // Subscription Management
  subscription: {
    planId: { type: String, required: true },
    status: { 
      type: String, 
      enum: ['trial', 'active', 'suspended', 'cancelled', 'expired'],
      default: 'trial'
    },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    renewalDate: { type: Date },
    trialEndsAt: { type: Date },
    paymentMethod: {
      type: { type: String, enum: ['arifpay', 'bank_transfer', 'none'], default: 'none' },
      lastFour: { type: String },
      expiryDate: { type: Date }
    },
    billingHistory: [{
      invoiceId: { type: String },
      amount: { type: Number },
      currency: { type: String, default: 'ETB' },
      status: { type: String, enum: ['paid', 'pending', 'failed', 'refunded'] },
      paidAt: { type: Date },
      arifpayTransactionId: { type: String },
      createdAt: { type: Date, default: Date.now }
    }],
    failedPaymentCount: { type: Number, default: 0 },
    nextRetryDate: { type: Date }
  },
  
  // Schema Isolation Config
  schemaPrefix: { type: String, required: true, unique: true },
  
  // Settings
  settings: {
    fiscalYearEnd: { type: String, default: '06-30' },
    baseCurrency: { type: String, default: 'ETB' },
    timezone: { type: String, default: 'Africa/Addis_Ababa' },
    dateFormat: { type: String, default: 'dd/mm/yyyy' },
    valuationMethod: { type: String, enum: ['fifo', 'average', 'lifo'], default: 'average' }
  },
  
  // Usage Tracking
  usage: {
    currentUsers: { type: Number, default: 0 },
    currentTransactions: { type: Number, default: 0 },
    currentAssets: { type: Number, default: 0 },
    currentInventoryItems: { type: Number, default: 0 },
    storageUsedMB: { type: Number, default: 0 },
    lastCalculatedAt: { type: Date, default: Date.now }
  },
  
  // Metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  suspendedReason: { type: String },
  suspendedAt: { type: Date }
});

// Enhanced User Schema
const UserSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  tenantId: { type: String, required: true, index: true },
  
  // Profile
  email: { type: String, required: true },
  passwordHash: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: { type: String },
  
  // Role & Permissions
  role: { 
    type: String, 
    enum: ['super_admin', 'tenant_admin', 'accountant', 'staff', 'viewer'],
    required: true
  },
  permissions: [{ type: String }],
  
  // Status
  isActive: { type: Boolean, default: true },
  emailVerified: { type: Boolean, default: false },
  lastLoginAt: { type: Date },
  loginAttempts: { type: Number, default: 0 },
  lockedUntil: { type: Date },
  
  // Invitations
  invitation: {
    invitedBy: { type: String },
    invitedAt: { type: Date },
    token: { type: String },
    expiresAt: { type: Date },
    acceptedAt: { type: Date }
  },
  
  // Password Reset
  passwordReset: {
    token: { type: String },
    expiresAt: { type: Date },
    usedAt: { type: Date }
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Audit Log Schema - Comprehensive compliance tracking
const AuditLogSchema = new mongoose.Schema({
  auditId: { type: String, required: true, unique: true },
  tenantId: { type: String, required: true, index: true },
  userId: { type: String, required: true },
  userRole: { type: String },
  
  // Action Details
  action: { 
    type: String, 
    enum: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'SUBMIT', 'APPROVE', 'REJECT', 'EXPORT', 'PRINT'],
    required: true 
  },
  entityType: { 
    type: String, 
    enum: ['transaction', 'inventory', 'asset', 'report', 'user', 'tenant', 'setting', 'subscription'],
    required: true 
  },
  entityId: { type: String, required: true },
  
  // Change Tracking
  changes: {
    before: { type: mongoose.Schema.Types.Mixed },
    after: { type: mongoose.Schema.Types.Mixed }
  },
  
  // Context
  ipAddress: { type: String },
  userAgent: { type: String },
  sessionId: { type: String },
  
  // Report/Submission Context
  reportId: { type: String },
  reportType: { type: String },
  submissionId: { type: String },
  
  // Compliance
  isSensitive: { type: Boolean, default: false },
  retentionUntil: { type: Date },
  
  timestamp: { type: Date, default: Date.now, index: true }
});

// Export models
export const PlatformSettings = mongoose.models.PlatformSettings || 
  mongoose.model('PlatformSettings', PlatformSettingsSchema);
export const Tenant = mongoose.models.Tenant || mongoose.model('Tenant', TenantSchema);
export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);
