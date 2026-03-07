import connectDB from './db';
import { Transaction, AccountBalance, StockInventory, FixedAsset } from './models';

// Chart of Accounts Constants (Ethiopian 5-digit ledger)
export const COA = {
    // Assets (10000 - 19999)
    ASSET_CASH: 10100,
    ASSET_AR: 10101,
    ASSET_INV: 10102,
    ASSET_FIXED: 10200,

    // Liabilities & Capital (30000 - 39999)
    LIAB_AP: 30100,
    LIAB_VAT: 30101,
    LIAB_LOAN: 30102,
    EQUITY_CAPITAL: 30200,

    // Revenue (40000 - 49999)
    REVENUE_SALES: 40000,

    // Expenses (50000 - 59999)
    EXP_COGS: 50000,
    EXP_OPERATING: 50100,
    EXP_PURCHASES: 50200,
};

export const VAT_RATE = 0.15; // Standard Ethiopian VAT

export interface VatReport {
    baseSales: number;
    outputVat: number;
    basePurchases: number;
    inputVat: number;
    netVatPayable: number;
}

export interface IncomeStatement {
    revenue: number;
    purchases: number;
    openingInventory: number;
    goodsAvailableForSale: number;
    endingInventoryValue: number;
    costOfSales: number;
    grossProfit: number;
    operatingExpenses: number;
    netIncome: number;
}

export interface BalanceSheet {
    assets: {
        cashAndBank: number;
        accountsReceivable: number;
        inventoryValue: number;
        fixedAssetsNbv: number;
        totalAssets: number;
    };
    liabilities: {
        taxPayable: number;
        otherPayables: number;
        loans: number;
        totalLiabilities: number;
    };
    capital: number;
}

/**
 * Module A: Real-Time Inventory Calculation
 * Calculates Ending Inventory Total Value dynamically matching account 10102
 */
export async function calculateEndingInventory(tenantId: string): Promise<number> {
    await connectDB();
    const inventory = await StockInventory.find({ tenant: tenantId });
    const totalValue = inventory.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0);
    return totalValue;
}

/**
 * Module B: Income Statement Logic
 * Strict formula: Revenue - COGS (Purchases - Ending Inv) - Expenses
 */
export async function generateIncomeStatement(tenantId: string, startDate?: Date, endDate?: Date): Promise<IncomeStatement> {
    await connectDB();

    const query: any = { tenant: tenantId };
    if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = startDate;
        if (endDate) query.date.$lte = endDate;
    }

    const transactions = await Transaction.find(query);

    let revenue = 0;
    let purchases = 0;
    let operatingExpenses = 0;

    // Aggregate by 5-digit account code
    transactions.forEach(tx => {
        if (tx.accountCode >= 40000 && tx.accountCode < 50000) {
            revenue += tx.amount;
        } else if (tx.accountCode === COA.EXP_PURCHASES) {
            purchases += tx.amount;
        } else if (tx.accountCode >= 50000 && tx.accountCode < 60000 && tx.accountCode !== COA.EXP_PURCHASES) {
            operatingExpenses += tx.amount;
        }
    });

    // Fetch Opening Inventory from AccountBalance ledger 10102
    // If no balance exists, it defaults to 0
    const opBal = await AccountBalance.findOne({ tenant: tenantId, accountCode: 10102 });
    const openingInventory = opBal ? opBal.balance : 0;

    const endingInventoryValue = await calculateEndingInventory(tenantId);

    // COGS Breakdown: (Opening + Purchases) - Ending
    const goodsAvailableForSale = openingInventory + purchases;
    const costOfSales = goodsAvailableForSale - endingInventoryValue;
    const grossProfit = revenue - costOfSales;
    const netIncome = grossProfit - operatingExpenses;

    return {
        revenue,
        purchases,
        openingInventory,
        goodsAvailableForSale,
        endingInventoryValue,
        costOfSales,
        grossProfit,
        operatingExpenses,
        netIncome
    };
}

/**
 * Helper to get raw balance sheet numbers prior to calculating net income
 */
export async function generateBalanceSheet(tenantId: string): Promise<BalanceSheet> {
    await connectDB();

    const balances = await AccountBalance.find({ tenant: tenantId });

    let cashAndBank = 0;
    let accountsReceivable = 0;
    let otherPayables = 0;
    let loans = 0;
    let capital = 0;

    balances.forEach(b => {
        if (b.accountCode === COA.ASSET_CASH) cashAndBank += b.balance;
        if (b.accountCode === COA.ASSET_AR) accountsReceivable += b.balance;
        if (b.accountCode === COA.LIAB_AP) otherPayables += b.balance;
        if (b.accountCode === COA.LIAB_LOAN) loans += b.balance;
        if (b.accountCode === COA.EQUITY_CAPITAL) capital += b.balance;
    });

    const inventoryValue = await calculateEndingInventory(tenantId);

    // Net Book Value of Fixed Assets
    const assets = await FixedAsset.find({ tenant: tenantId });
    const fixedAssetsNbv = assets.reduce((sum, item) => {
        const cost = item.cost_beginning + item.addition;
        const dep = item.dep_beginning + item.dep_addition;
        return sum + (cost - dep);
    }, 0);

    return {
        assets: {
            cashAndBank,
            accountsReceivable,
            inventoryValue,
            fixedAssetsNbv,
            totalAssets: cashAndBank + accountsReceivable + inventoryValue + fixedAssetsNbv
        },
        liabilities: {
            taxPayable: 0, // Set later or dynamically based on VAT
            otherPayables,
            loans,
            totalLiabilities: otherPayables + loans
        },
        capital
    };
}

/**
 * Module C: The Balancing Engine (Validation)
 * Enforce: Assets = Liabilities + Capital + NetIncome
 */
export async function validateAccountingEquation(tenantId: string): Promise<boolean> {
    // 1. Get Net Income
    const incomeStmt = await generateIncomeStatement(tenantId);

    // 2. Get Balance Sheet totals
    const bs = await generateBalanceSheet(tenantId);

    const totalAssets = bs.assets.totalAssets;
    // The equation checks if the left side (Assets) strictly equals the right side (Liabilities + Capital + NetIncome)
    // Because JS floating point math is weird, we round to 2 decimals for the check.
    const rightSide = bs.liabilities.totalLiabilities + bs.capital + incomeStmt.netIncome;

    const diff = Math.abs(totalAssets - rightSide);

    // If diff is greater than a rounding error (e.g. 0.01), it's unbalanced
    if (diff > 0.01) {
        throw new Error("Reconciliation Error: The accounting equation does not balance. VAT Return generation is forbidden.");
    }

    return true;
}

/**
 * Module D: VAT Return Automation
 * Generates 15% precise VAT only if the books are balanced
 */
export async function generateVatReport(tenantId: string, startDate?: Date, endDate?: Date): Promise<VatReport> {
    await connectDB();

    // 1. Force the reconciliation balance check first!
    await validateAccountingEquation(tenantId);

    const query: any = { tenant: tenantId };
    if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = startDate;
        if (endDate) query.date.$lte = endDate;
    }

    const transactions = await Transaction.find(query);

    let baseSales = 0;
    let basePurchases = 0;

    transactions.forEach(tx => {
        // Base Sales (All 40000s series credit operations mapped to base sales)
        if (tx.accountCode >= 40000 && tx.accountCode < 50000) {
            baseSales += tx.amount;
        }
        // Base Purchases (All purchases mapped to base input pool)
        else if (tx.accountCode === COA.EXP_PURCHASES) {
            basePurchases += tx.amount;
        }
    });

    // Strictly apply standard Ethiopian VAT rate (15%)
    const outputVat = baseSales * VAT_RATE;
    const inputVat = basePurchases * VAT_RATE;

    return {
        baseSales,
        outputVat,
        basePurchases,
        inputVat,
        netVatPayable: outputVat - inputVat
    };
}

export async function generateFinancialRatios(tenantId: string, startDate?: Date, endDate?: Date) {
    const incomeStmt = await generateIncomeStatement(tenantId, startDate, endDate);
    const balanceSheet = await generateBalanceSheet(tenantId);

    const grossProfitMargin = incomeStmt.revenue > 0 ? (incomeStmt.grossProfit / incomeStmt.revenue) * 100 : 0;
    const netProfitMargin = incomeStmt.revenue > 0 ? (incomeStmt.netIncome / incomeStmt.revenue) * 100 : 0;

    const totalAssets = balanceSheet.assets.totalAssets;
    const returnOnAssets = totalAssets > 0 ? (incomeStmt.netIncome / totalAssets) * 100 : 0;

    const totalLiabilities = balanceSheet.liabilities.totalLiabilities;
    const debtRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;

    return {
        grossProfitMargin,
        netProfitMargin,
        returnOnAssets,
        debtRatio
    };
}

