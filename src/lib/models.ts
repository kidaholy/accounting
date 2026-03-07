import mongoose from 'mongoose';

// Fixed Asset Schema
const FixedAssetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  cost_beginning: { type: Number, default: 0 },
  addition: { type: Number, default: 0 },
  dep_rate: { type: Number, default: 0.20 },
  dep_beginning: { type: Number, default: 0 },
  dep_addition: { type: Number, default: 0 }
});

// VAT Declaration Schema
const VatDeclarationSchema = new mongoose.Schema({
  taxable_sales: { type: Number, default: 0 },
  local_purchases: { type: Number, default: 0 },
  capital_assets: { type: Number, default: 0 },
  month_year: { type: String, default: 'Current' }
});

// Stock Inventory Schema
const StockInventorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  unit: { type: String },
  quantity: { type: Number, default: 0 },
  unit_cost: { type: Number, default: 0 }
});

// Export models (check if already compiled to avoid overwrite error in dev)
export const FixedAsset = mongoose.models.FixedAsset || mongoose.model('FixedAsset', FixedAssetSchema);
export const VatDeclaration = mongoose.models.VatDeclaration || mongoose.model('VatDeclaration', VatDeclarationSchema);
export const StockInventory = mongoose.models.StockInventory || mongoose.model('StockInventory', StockInventorySchema);
