import mongoose from 'mongoose';

// Tenant Schema (for multi-tenancy)
const TenantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  address: { type: String },
  subscriptionPlan: { 
    type: String, 
    enum: ['free', 'basic', 'professional', 'enterprise'],
    default: 'free'
  },
  subscriptionStatus: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'cancelled'],
    default: 'active'
  },
  subscriptionStartDate: { type: Date, default: Date.now },
  subscriptionEndDate: { type: Date },
  maxUsers: { type: Number, default: 1 },
  maxAssets: { type: Number, default: 10 },
  maxInventoryItems: { type: Number, default: 50 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// User Schema (with roles)
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['super_admin', 'tenant_admin', 'accountant', 'viewer'],
    default: 'viewer'
  },
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Fixed Asset Schema (with tenant isolation)
const FixedAssetSchema = new mongoose.Schema({
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  name: { type: String, required: true },
  cost_beginning: { type: Number, default: 0 },
  addition: { type: Number, default: 0 },
  dep_rate: { type: Number, default: 0.20 },
  dep_beginning: { type: Number, default: 0 },
  dep_addition: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// VAT Declaration Schema (with tenant isolation)
const VatDeclarationSchema = new mongoose.Schema({
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  taxable_sales: { type: Number, default: 0 },
  local_purchases: { type: Number, default: 0 },
  capital_assets: { type: Number, default: 0 },
  month_year: { type: String, default: 'Current' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Stock Inventory Schema (with tenant isolation)
const StockInventorySchema = new mongoose.Schema({
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  name: { type: String, required: true },
  unit: { type: String },
  quantity: { type: Number, default: 0 },
  unit_cost: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Audit Log Schema
const AuditLogSchema = new mongoose.Schema({
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  entityType: { type: String, required: true },
  entityId: { type: String },
  oldValues: { type: mongoose.Schema.Types.Mixed },
  newValues: { type: mongoose.Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now }
});

// Export models (check if already compiled to avoid overwrite error in dev)
export const Tenant = mongoose.models.Tenant || mongoose.model('Tenant', TenantSchema);
export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export const FixedAsset = mongoose.models.FixedAsset || mongoose.model('FixedAsset', FixedAssetSchema);
export const VatDeclaration = mongoose.models.VatDeclaration || mongoose.model('VatDeclaration', VatDeclarationSchema);
export const StockInventory = mongoose.models.StockInventory || mongoose.model('StockInventory', StockInventorySchema);
export const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);
