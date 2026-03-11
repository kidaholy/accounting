// Export all models from a central location
export * from './platform';
export * from './tenant';

// Re-export legacy models for backward compatibility
export { 
  Tenant as LegacyTenant,
  User as LegacyUser,
  FixedAsset as LegacyFixedAsset,
  VatDeclaration as LegacyVatDeclaration,
  StockInventory as LegacyStockInventory,
  ProductCategory as LegacyProductCategory,
  Product as LegacyProduct,
  Transaction as LegacyTransaction,
  AccountBalance as LegacyAccountBalance,
  AuditLog as LegacyAuditLog
} from '../models';
