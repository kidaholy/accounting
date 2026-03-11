import { TenantContext, getTenantModel, getTenantCollection } from './tenantContext';
import connectDB from './db';

// Types for financial reports
export interface BalanceSheetData {
  reportingDate: Date;
  assets: {
    currentAssets: {
      cashOnHand: number;
      bankBalances: number;
      tradeReceivables: number;
      inventory: number;
      otherCurrentAssets: number;
      totalCurrentAssets: number;
    };
    propertyAndEquipment: {
      equipmentCost: number;
      accumulatedDepreciation: number;
      netBookValue: number;
    };
    totalAssets: number;
  };
  liabilities: {
    currentLiabilities: {
      profitTaxPayable: number;
      vatPayable: number;
      otherPayables: number;
      totalCurrentLiabilities: number;
    };
    totalLiabilities: number;
  };
  capital: {
    retainedEarnings: number;
    netIncome: number;
    totalCapital: number;
  };
  totalLiabilitiesAndCapital: number;
}

export interface IncomeStatementData {
  period: { startDate: Date; endDate: Date };
  revenues: {
    foodSales: number;
    drinkSales: number;
    otherRevenue: number;
    totalRevenues: number;
  };
  costOfSales: {
    foodMaterials: number;
    beverageCosts: number;
    totalCostOfSales: number;
  };
  grossProfit: number;
  expenses: {
    foodMaterialsExpense: number;
    suppliesExpense: number;
    salariesExpense: number;
    rentExpense: number;
    utilitiesExpense: number;
    depreciationExpense: number;
    otherExpenses: number;
    totalExpenses: number;
  };
  netIncomeBeforeTax: number;
  profitTax: number;
  netIncomeAfterTax: number;
}

export interface VatDeclarationData {
  reportingPeriod: { startDate: Date; endDate: Date };
  taxableSales: {
    standardRated: number;
    zeroRated: number;
    exempt: number;
    totalTaxableSales: number;
  };
  outputVat: number;
  taxablePurchases: {
    capitalGoods: number;
    generalExpenses: number;
    totalTaxablePurchases: number;
  };
  inputVat: number;
  adjustments: {
    creditNotes: number;
    debitNotes: number;
    badDebts: number;
  };
  netVatPayable: number;
  vatCarriedForward: number;
  vatCreditAvailable: number;
}

export interface FixedAssetsScheduleData {
  reportingDate: Date;
  totalCost: number;
  totalAccumulatedDepreciation: number;
  totalNetBookValue: number;
  assets: Array<{
    assetId: string;
    assetName: string;
    assetCategory: string;
    acquisitionDate: Date;
    acquisitionCost: number;
    depreciationRate: number;
    accumulatedDepreciation: number;
    netBookValue: number;
    status: string;
  }>;
}

export interface InventoryValuationData {
  reportingDate: Date;
  totalValue: number;
  totalItems: number;
  items: Array<{
    itemId: string;
    itemCode: string;
    description: string;
    unit: string;
    quantityOnHand: number;
    unitCost: number;
    totalValue: number;
  }>;
}

// Ethiopian Calendar Conversion
export function toEthiopianDate(gregorianDate: Date): { year: number; month: number; day: number } {
  // Simplified conversion - Ethiopian calendar is approximately 7-8 years behind Gregorian
  // For production, use a proper Ethiopian calendar library
  const ethiopianYear = gregorianDate.getFullYear() - 7;
  const ethiopianMonth = ((gregorianDate.getMonth() + 4) % 12) + 1;
  const ethiopianDay = gregorianDate.getDate();
  
  return { year: ethiopianYear, month: ethiopianMonth, day: ethiopianDay };
}

export function getEthiopianFiscalYear(date: Date): number {
  const ethiopianDate = toEthiopianDate(date);
  // Ethiopian fiscal year starts on Tahsas 1 (approx July 8)
  // If current month is before July, fiscal year is previous Ethiopian year
  return ethiopianDate.month < 4 ? ethiopianDate.year - 1 : ethiopianDate.year;
}

// Balance Sheet Calculation
export async function calculateBalanceSheet(
  context: TenantContext,
  asOfDate: Date
): Promise<BalanceSheetData> {
  await connectDB();
  
  const accountsCollection = getTenantCollection(context, 'accounts');
  const transactionsCollection = getTenantCollection(context, 'transactions');
  const inventoryCollection = getTenantCollection(context, 'inventory');
  const assetsCollection = getTenantCollection(context, 'fixed_assets');
  
  // 1. Calculate Current Assets
  // Cash accounts (1000-1099)
  const cashAccounts = await accountsCollection.find({
    accountCode: { $regex: '^10' },
    accountType: 'asset'
  }).toArray();
  const cashOnHand = cashAccounts.reduce((sum, acc) => sum + (acc.currentBalance || 0), 0);
  
  // Bank accounts (1100-1199)
  const bankAccounts = await accountsCollection.find({
    accountCode: { $regex: '^11' },
    accountType: 'asset'
  }).toArray();
  const bankBalances = bankAccounts.reduce((sum, acc) => sum + (acc.currentBalance || 0), 0);
  
  // Trade receivables (1200-1299)
  const receivableAccounts = await accountsCollection.find({
    accountCode: { $regex: '^12' },
    accountType: 'asset'
  }).toArray();
  const tradeReceivables = receivableAccounts.reduce((sum, acc) => sum + (acc.currentBalance || 0), 0);
  
  // Inventory valuation
  const inventoryItems = await inventoryCollection.find({ isActive: true }).toArray();
  const inventory = inventoryItems.reduce((sum, item) => sum + (item.totalValue || 0), 0);
  
  // Other current assets (1300-1399)
  const otherCurrentAssetAccounts = await accountsCollection.find({
    accountCode: { $regex: '^13' },
    accountType: 'asset'
  }).toArray();
  const otherCurrentAssets = otherCurrentAssetAccounts.reduce((sum, acc) => sum + (acc.currentBalance || 0), 0);
  
  const totalCurrentAssets = cashOnHand + bankBalances + tradeReceivables + inventory + otherCurrentAssets;
  
  // 2. Calculate Fixed Assets
  const fixedAssets = await assetsCollection.find({ 
    status: { $in: ['active', 'fully_depreciated'] }
  }).toArray();
  
  const equipmentCost = fixedAssets.reduce((sum, asset) => sum + (asset.acquisitionCost || 0), 0);
  const accumulatedDepreciation = fixedAssets.reduce((sum, asset) => sum + (asset.accumulatedDepreciation || 0), 0);
  const netBookValue = equipmentCost - accumulatedDepreciation;
  
  const totalAssets = totalCurrentAssets + netBookValue;
  
  // 3. Calculate Liabilities
  // Profit tax payable (2000-2099)
  const taxAccounts = await accountsCollection.find({
    accountCode: { $regex: '^20' },
    accountType: 'liability'
  }).toArray();
  const profitTaxPayable = taxAccounts.reduce((sum, acc) => sum + Math.abs(acc.currentBalance || 0), 0);
  
  // VAT payable (2100-2199)
  const vatAccounts = await accountsCollection.find({
    accountCode: { $regex: '^21' },
    accountType: 'liability'
  }).toArray();
  const vatPayable = vatAccounts.reduce((sum, acc) => sum + Math.abs(acc.currentBalance || 0), 0);
  
  // Other payables (2200-2999)
  const otherPayableAccounts = await accountsCollection.find({
    accountCode: { $regex: '^22|^23|^24|^25|^26|^27|^28|^29' },
    accountType: 'liability'
  }).toArray();
  const otherPayables = otherPayableAccounts.reduce((sum, acc) => sum + Math.abs(acc.currentBalance || 0), 0);
  
  const totalCurrentLiabilities = profitTaxPayable + vatPayable + otherPayables;
  const totalLiabilities = totalCurrentLiabilities;
  
  // 4. Calculate Capital
  // Retained earnings (3000-3099)
  const retainedEarningsAccounts = await accountsCollection.find({
    accountCode: { $regex: '^30' },
    accountType: 'equity'
  }).toArray();
  const retainedEarnings = retainedEarningsAccounts.reduce((sum, acc) => sum + (acc.currentBalance || 0), 0);
  
  // Current year net income (from income statement)
  const fiscalYearStart = new Date(asOfDate.getFullYear(), 6, 1); // July 1
  if (asOfDate < fiscalYearStart) {
    fiscalYearStart.setFullYear(fiscalYearStart.getFullYear() - 1);
  }
  
  const incomeStmt = await calculateIncomeStatement(context, fiscalYearStart, asOfDate);
  const netIncome = incomeStmt.netIncomeAfterTax;
  
  const totalCapital = retainedEarnings + netIncome;
  
  // 5. Validate balance
  const totalLiabilitiesAndCapital = totalLiabilities + totalCapital;
  
  if (Math.abs(totalAssets - totalLiabilitiesAndCapital) > 0.01) {
    console.warn('Balance sheet does not balance:', {
      totalAssets,
      totalLiabilitiesAndCapital,
      difference: totalAssets - totalLiabilitiesAndCapital
    });
  }
  
  return {
    reportingDate: asOfDate,
    assets: {
      currentAssets: {
        cashOnHand,
        bankBalances,
        tradeReceivables,
        inventory,
        otherCurrentAssets,
        totalCurrentAssets
      },
      propertyAndEquipment: {
        equipmentCost,
        accumulatedDepreciation,
        netBookValue
      },
      totalAssets
    },
    liabilities: {
      currentLiabilities: {
        profitTaxPayable,
        vatPayable,
        otherPayables,
        totalCurrentLiabilities
      },
      totalLiabilities
    },
    capital: {
      retainedEarnings,
      netIncome,
      totalCapital
    },
    totalLiabilitiesAndCapital
  };
}

// Income Statement Calculation
export async function calculateIncomeStatement(
  context: TenantContext,
  startDate: Date,
  endDate: Date
): Promise<IncomeStatementData> {
  await connectDB();
  
  const transactionsCollection = getTenantCollection(context, 'transactions');
  const assetsCollection = getTenantCollection(context, 'fixed_assets');
  
  // Get all posted transactions in the period
  const transactions = await transactionsCollection.find({
    transactionDate: { $gte: startDate, $lte: endDate },
    status: 'posted'
  }).toArray();
  
  // Revenue accounts (4000-4999)
  const foodSales = transactions
    .filter(t => t.category === 'sales' && t.subcategory === 'food')
    .reduce((sum, t) => sum + t.totalAmount, 0);
  
  const drinkSales = transactions
    .filter(t => t.category === 'sales' && t.subcategory === 'drinks')
    .reduce((sum, t) => sum + t.totalAmount, 0);
  
  const otherRevenue = transactions
    .filter(t => t.category === 'sales' && !['food', 'drinks'].includes(t.subcategory))
    .reduce((sum, t) => sum + t.totalAmount, 0);
  
  const totalRevenues = foodSales + drinkSales + otherRevenue;
  
  // Cost of Sales (5000-5999)
  const foodMaterials = transactions
    .filter(t => t.category === 'purchase' && t.subcategory === 'food_materials')
    .reduce((sum, t) => sum + t.totalAmount, 0);
  
  const beverageCosts = transactions
    .filter(t => t.category === 'purchase' && t.subcategory === 'beverages')
    .reduce((sum, t) => sum + t.totalAmount, 0);
  
  const totalCostOfSales = foodMaterials + beverageCosts;
  const grossProfit = totalRevenues - totalCostOfSales;
  
  // Expenses (6000-9999)
  const foodMaterialsExpense = transactions
    .filter(t => t.category === 'expense' && t.subcategory === 'food_materials')
    .reduce((sum, t) => sum + t.totalAmount, 0);
  
  const suppliesExpense = transactions
    .filter(t => t.category === 'expense' && t.subcategory === 'supplies')
    .reduce((sum, t) => sum + t.totalAmount, 0);
  
  const salariesExpense = transactions
    .filter(t => t.category === 'expense' && t.subcategory === 'salaries')
    .reduce((sum, t) => sum + t.totalAmount, 0);
  
  const rentExpense = transactions
    .filter(t => t.category === 'expense' && t.subcategory === 'rent')
    .reduce((sum, t) => sum + t.totalAmount, 0);
  
  const utilitiesExpense = transactions
    .filter(t => t.category === 'expense' && t.subcategory === 'utilities')
    .reduce((sum, t) => sum + t.totalAmount, 0);
  
  // Calculate depreciation expense for the period
  const activeAssets = await assetsCollection.find({
    status: { $in: ['active', 'fully_depreciated'] }
  }).toArray();
  
  const depreciationExpense = activeAssets.reduce((sum, asset) => {
    const annualDepreciation = asset.acquisitionCost * asset.depreciationRate;
    const monthlyDepreciation = annualDepreciation / 12;
    // Approximate months in period
    const monthsInPeriod = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / (30 * 24 * 60 * 60 * 1000)));
    return sum + (monthlyDepreciation * monthsInPeriod);
  }, 0);
  
  const otherExpenses = transactions
    .filter(t => t.category === 'expense' && !['food_materials', 'supplies', 'salaries', 'rent', 'utilities'].includes(t.subcategory))
    .reduce((sum, t) => sum + t.totalAmount, 0);
  
  const totalExpenses = foodMaterialsExpense + suppliesExpense + salariesExpense + 
                       rentExpense + utilitiesExpense + depreciationExpense + otherExpenses;
  
  const netIncomeBeforeTax = grossProfit - totalExpenses;
  const profitTax = Math.max(0, netIncomeBeforeTax * 0.30); // 30% tax rate
  const netIncomeAfterTax = netIncomeBeforeTax - profitTax;
  
  return {
    period: { startDate, endDate },
    revenues: {
      foodSales,
      drinkSales,
      otherRevenue,
      totalRevenues
    },
    costOfSales: {
      foodMaterials,
      beverageCosts,
      totalCostOfSales
    },
    grossProfit,
    expenses: {
      foodMaterialsExpense,
      suppliesExpense,
      salariesExpense,
      rentExpense,
      utilitiesExpense,
      depreciationExpense,
      otherExpenses,
      totalExpenses
    },
    netIncomeBeforeTax,
    profitTax,
    netIncomeAfterTax
  };
}

// VAT Declaration Calculation
export async function calculateVatDeclaration(
  context: TenantContext,
  startDate: Date,
  endDate: Date
): Promise<VatDeclarationData> {
  await connectDB();
  
  const transactionsCollection = getTenantCollection(context, 'transactions');
  
  // Get all posted transactions in the period with VAT
  const transactions = await transactionsCollection.find({
    transactionDate: { $gte: startDate, $lte: endDate },
    status: 'posted',
    'vat.isVatable': true
  }).toArray();
  
  // Output VAT (Sales)
  const salesTransactions = transactions.filter(t => t.vat.vatType === 'output');
  const standardRatedSales = salesTransactions
    .filter(t => t.vat.vatRate === 0.15)
    .reduce((sum, t) => sum + t.totalAmount, 0);
  const zeroRatedSales = salesTransactions
    .filter(t => t.vat.vatRate === 0)
    .reduce((sum, t) => sum + t.totalAmount, 0);
  const exemptSales = salesTransactions
    .filter(t => t.vat.vatRate === null || t.vat.vatRate === undefined)
    .reduce((sum, t) => sum + t.totalAmount, 0);
  
  const outputVat = standardRatedSales * 0.15;
  
  // Input VAT (Purchases)
  const purchaseTransactions = transactions.filter(t => t.vat.vatType === 'input');
  const capitalGoodsPurchases = purchaseTransactions
    .filter(t => t.category === 'purchase' && t.subcategory === 'capital_goods')
    .reduce((sum, t) => sum + t.totalAmount, 0);
  const generalExpensePurchases = purchaseTransactions
    .filter(t => t.category === 'purchase' && t.subcategory !== 'capital_goods')
    .reduce((sum, t) => sum + t.totalAmount, 0);
  
  const inputVat = purchaseTransactions.reduce((sum, t) => sum + (t.vat.vatAmount || 0), 0);
  
  // Adjustments (simplified - would need credit/debit note tracking)
  const adjustments = {
    creditNotes: 0,
    debitNotes: 0,
    badDebts: 0
  };
  
  const netVatPayable = outputVat - inputVat;
  const vatCarriedForward = netVatPayable < 0 ? Math.abs(netVatPayable) : 0;
  const vatCreditAvailable = vatCarriedForward;
  
  return {
    reportingPeriod: { startDate, endDate },
    taxableSales: {
      standardRated: standardRatedSales,
      zeroRated: zeroRatedSales,
      exempt: exemptSales,
      totalTaxableSales: standardRatedSales + zeroRatedSales + exemptSales
    },
    outputVat,
    taxablePurchases: {
      capitalGoods: capitalGoodsPurchases,
      generalExpenses: generalExpensePurchases,
      totalTaxablePurchases: capitalGoodsPurchases + generalExpensePurchases
    },
    inputVat,
    adjustments,
    netVatPayable: Math.max(0, netVatPayable),
    vatCarriedForward,
    vatCreditAvailable
  };
}

// Fixed Assets Schedule Calculation
export async function calculateFixedAssetsSchedule(
  context: TenantContext,
  asOfDate: Date
): Promise<FixedAssetsScheduleData> {
  await connectDB();
  
  const assetsCollection = getTenantCollection(context, 'fixed_assets');
  
  const assets = await assetsCollection.find({
    $or: [
      { status: { $in: ['active', 'fully_depreciated'] } },
      { disposalDate: { $gte: asOfDate } }
    ]
  }).toArray();
  
  const assetData = assets.map(asset => ({
    assetId: asset.assetId,
    assetName: asset.assetName,
    assetCategory: asset.assetCategory,
    acquisitionDate: asset.acquisitionDate,
    acquisitionCost: asset.acquisitionCost,
    depreciationRate: asset.depreciationRate,
    accumulatedDepreciation: asset.accumulatedDepreciation,
    netBookValue: asset.netBookValue,
    status: asset.status
  }));
  
  const totalCost = assetData.reduce((sum, a) => sum + a.acquisitionCost, 0);
  const totalAccumulatedDepreciation = assetData.reduce((sum, a) => sum + a.accumulatedDepreciation, 0);
  const totalNetBookValue = assetData.reduce((sum, a) => sum + a.netBookValue, 0);
  
  return {
    reportingDate: asOfDate,
    totalCost,
    totalAccumulatedDepreciation,
    totalNetBookValue,
    assets: assetData
  };
}

// Inventory Valuation Calculation
export async function calculateInventoryValuation(
  context: TenantContext,
  asOfDate: Date
): Promise<InventoryValuationData> {
  await connectDB();
  
  const inventoryCollection = getTenantCollection(context, 'inventory');
  
  const items = await inventoryCollection.find({
    isActive: true
  }).toArray();
  
  const itemData = items.map(item => ({
    itemId: item.itemId,
    itemCode: item.itemCode,
    description: item.description,
    unit: item.unit,
    quantityOnHand: item.quantityOnHand,
    unitCost: item.unitCost,
    totalValue: item.totalValue
  }));
  
  const totalValue = itemData.reduce((sum, i) => sum + i.totalValue, 0);
  
  return {
    reportingDate: asOfDate,
    totalValue,
    totalItems: itemData.length,
    items: itemData
  };
}

// Depreciation calculation for a single asset
export function calculateDepreciation(
  acquisitionCost: number,
  acquisitionDate: Date,
  depreciationRate: number,
  asOfDate: Date
): { accumulatedDepreciation: number; netBookValue: number } {
  const annualDepreciation = acquisitionCost * depreciationRate;
  
  // Calculate years elapsed
  const yearsElapsed = (asOfDate.getTime() - acquisitionDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  
  const accumulatedDepreciation = Math.min(annualDepreciation * yearsElapsed, acquisitionCost);
  const netBookValue = acquisitionCost - accumulatedDepreciation;
  
  return {
    accumulatedDepreciation,
    netBookValue: Math.max(0, netBookValue)
  };
}

// Generate depreciation schedule
export function generateDepreciationSchedule(
  acquisitionCost: number,
  depreciationRate: number,
  usefulLifeYears: number
): Array<{
  year: number;
  openingBookValue: number;
  annualDepreciation: number;
  accumulatedDepreciation: number;
  closingBookValue: number;
}> {
  const schedule = [];
  const annualDepreciation = acquisitionCost * depreciationRate;
  let currentValue = acquisitionCost;
  let totalDepreciation = 0;
  
  for (let year = 1; year <= usefulLifeYears; year++) {
    const yearDepreciation = Math.min(annualDepreciation, currentValue);
    totalDepreciation += yearDepreciation;
    
    schedule.push({
      year,
      openingBookValue: currentValue,
      annualDepreciation: yearDepreciation,
      accumulatedDepreciation: totalDepreciation,
      closingBookValue: Math.max(0, currentValue - yearDepreciation)
    });
    
    currentValue -= yearDepreciation;
    if (currentValue <= 0) break;
  }
  
  return schedule;
}
