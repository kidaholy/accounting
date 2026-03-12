import mongoose from 'mongoose';

// Chart of Accounts Schema - Per-tenant
export const AccountSchema = new mongoose.Schema({
  accountCode: { type: String, required: true },
  accountName: { type: String, required: true },
  accountType: { 
    type: String, 
    enum: ['asset', 'liability', 'equity', 'revenue', 'expense'],
    required: true 
  },
  accountCategory: { 
    type: String, 
    enum: ['current_asset', 'fixed_asset', 'current_liability', 'long_term_liability', 
           'equity', 'revenue', 'cost_of_sales', 'operating_expense', 'other_expense']
  },
  parentAccount: { type: String },
  
  // Balance tracking
  openingBalance: { type: Number, default: 0 },
  currentBalance: { type: Number, default: 0 },
  
  // Metadata
  isActive: { type: Boolean, default: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Transaction Schema - Double-entry bookkeeping
export const TransactionSchema = new mongoose.Schema({
  transactionId: { type: String, required: true, unique: true },
  transactionDate: { type: Date, required: true },
  referenceNumber: { type: String },
  
  // Double-entry entries
  entries: [{
    accountCode: { type: String, required: true },
    accountName: { type: String },
    debit: { type: Number, default: 0 },
    credit: { type: Number, default: 0 },
    description: { type: String }
  }],
  
  // Categorization
  category: { 
    type: String, 
    enum: ['sales', 'purchase', 'expense', 'adjustment', 'transfer', 'journal'],
    required: true 
  },
  subcategory: { type: String },
  
  // Amounts
  totalAmount: { type: Number, required: true },
  currency: { type: String, default: 'ETB' },
  
  // VAT Information
  vat: {
    isVatable: { type: Boolean, default: false },
    vatAmount: { type: Number, default: 0 },
    vatRate: { type: Number, default: 0 },
    vatType: { type: String, enum: ['output', 'input', 'none'], default: 'none' },
    vatAccount: { type: String }
  },
  
  // Status & Approval
  status: { 
    type: String, 
    enum: ['draft', 'posted', 'reversed', 'void'],
    default: 'draft'
  },
  postedAt: { type: Date },
  postedBy: { type: String },
  reversedAt: { type: Date },
  reversedBy: { type: String },
  reversalReason: { type: String },
  
  // Attachments
  attachments: [{
    fileName: { type: String },
    fileUrl: { type: String },
    fileType: { type: String },
    uploadedAt: { type: Date }
  }],
  
  // Metadata
  notes: { type: String },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Inventory Schema
export const InventorySchema = new mongoose.Schema({
  itemId: { type: String, required: true, unique: true },
  itemCode: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  
  // Unit of Measure
  unit: { type: String, required: true },
  
  // Stock Tracking
  quantityOnHand: { type: Number, default: 0 },
  quantityReserved: { type: Number, default: 0 },
  quantityAvailable: { type: Number, default: 0 },
  
  // Valuation
  unitCost: { type: Number, default: 0 },
  totalValue: { type: Number, default: 0 },
  valuationMethod: { type: String, enum: ['fifo', 'average', 'lifo'], default: 'average' },
  
  // Stock Movements
  movements: [{
    movementId: { type: String },
    date: { type: Date },
    type: { type: String, enum: ['purchase', 'sale', 'adjustment', 'return_in', 'return_out'] },
    quantity: { type: Number },
    unitCost: { type: Number },
    totalCost: { type: Number },
    reference: { type: String },
    transactionId: { type: String }
  }],
  
  // Reorder
  reorderLevel: { type: Number, default: 0 },
  reorderQuantity: { type: Number, default: 0 },
  
  // Category
  category: { type: String },
  
  // Status
  isActive: { type: Boolean, default: true },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Fixed Asset Schema
export const FixedAssetSchema = new mongoose.Schema({
  assetId: { type: String, required: true, unique: true },
  assetName: { type: String, required: true },
  assetCategory: { 
    type: String, 
    enum: ['equipment', 'furniture', 'vehicle', 'building', 'computer', 'other'],
    required: true 
  },
  
  // Acquisition
  acquisitionDate: { type: Date, required: true },
  acquisitionCost: { type: Number, required: true },
  
  // Depreciation
  depreciationMethod: { type: String, enum: ['straight_line'], default: 'straight_line' },
  depreciationRate: { type: Number, default: 0.20 },
  usefulLifeYears: { type: Number, default: 5 },
  
  // Current Values
  accumulatedDepreciation: { type: Number, default: 0 },
  netBookValue: { type: Number, default: 0 },
  
  // Depreciation Schedule
  depreciationSchedule: [{
    year: { type: Number },
    openingBookValue: { type: Number },
    annualDepreciation: { type: Number },
    accumulatedDepreciation: { type: Number },
    closingBookValue: { type: Number }
  }],
  
  // Disposal
  disposalDate: { type: Date },
  disposalAmount: { type: Number },
  gainLossOnDisposal: { type: Number },
  
  // Status
  status: { 
    type: String, 
    enum: ['active', 'fully_depreciated', 'disposed'],
    default: 'active'
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Report Schema
export const ReportSchema = new mongoose.Schema({
  reportId: { type: String, required: true, unique: true },
  reportType: { 
    type: String, 
    enum: ['balance_sheet', 'income_statement', 'vat_declaration', 'fixed_assets_schedule', 'inventory_valuation', 'trial_balance'],
    required: true 
  },
  
  // Reporting Period
  period: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    fiscalYear: { type: Number, required: true },
    month: { type: Number }
  },
  
  // Report Data
  data: { type: mongoose.Schema.Types.Mixed, required: true },
  
  // Calculated Values
  summary: {
    totalAssets: { type: Number },
    totalLiabilities: { type: Number },
    totalEquity: { type: Number },
    netIncome: { type: Number },
    totalVat: { type: Number },
    totalRevenue: { type: Number },
    totalExpenses: { type: Number }
  },
  
  // Submission Tracking
  submission: {
    status: { 
      type: String, 
      enum: ['draft', 'submitted', 'under_review', 'approved', 'rejected', 'withdrawn'],
      default: 'draft'
    },
    submittedAt: { type: Date },
    submittedBy: { type: String },
    submissionReference: { type: String },
    
    reviewHistory: [{
      status: { type: String },
      reviewedBy: { type: String },
      reviewedAt: { type: Date },
      comments: { type: String }
    }],
    
    taxAuthorityResponse: { type: mongoose.Schema.Types.Mixed },
    acknowledgementNumber: { type: String }
  },
  
  // PDF Generation
  pdfUrl: { type: String },
  generatedAt: { type: Date },
  
  // Version Control
  version: { type: Number, default: 1 },
  previousVersions: [{ type: String }],
  
  // Status
  isFinal: { type: Boolean, default: false },
  lockedAt: { type: Date },
  
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Helper function to get tenant-specific model
export function getTenantModel(tenantPrefix: string, modelName: string, schema: mongoose.Schema) {
  const collectionName = `${tenantPrefix}${modelName}`;
  return mongoose.models[collectionName] || mongoose.model(collectionName, schema, collectionName);
}
