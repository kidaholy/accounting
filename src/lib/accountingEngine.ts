import connectDB from './db';
import { Transaction, AccountBalance, StockInventory, FixedAsset } from './models';

// Chart of Accounts Constants (Ethiopian 5-digit ledger)
export const COA = {
    // Assets (10000 - 19999)
    ASSET_CASH: 10100,
    ASSET_AR: 10101,
    ASSET_INV: 10102,
    ASSET_FIXED_COST: 15100,
    ASSET_ACCUM_DEP: 17200,

    // Liabilities & Capital (30000 - 39999)
    LIAB_AP: 30100,
    LIAB_VAT: 30101,
    LIAB_LOAN: 30102,
    LIAB_PROFIT_TAX: 39005,
    EQUITY_CAPITAL: 30200,

    // Revenue (40000 - 49999)
    REVENUE_SALES: 40000,
    REVENUE_BEVERAGE: 40100,

    // Expenses (50000 - 59999)
    EXP_COGS: 50000,
    EXP_OPERATING: 50100,
    EXP_PURCHASES: 50200,
    EXP_PURCHASES_NON_TAXABLE: 50201,
};

export const VAT_RATE = 0.15; // Standard Ethiopian VAT

export interface VatReport {
    organizationName: string;
    tin: string;
    period: string;
    box5TaxableSales: number;
    box5Vat: number;
    box10TaxablePurchases: number;
    box10Vat: number;
    box15NetCredit: number;
    // Legacy fields for backward compatibility if needed
    baseSales: number;
    outputVat: number;
    basePurchases: number;
    inputVat: number;
    netVatPayable: number;
}

export interface IncomeStatement {
    revenue: number;
    revenueBreakdown: Record<string, number>;
    purchases: number;
    purchasesTaxable: number;
    purchasesNonTaxable: number;
    openingInventory: number;
    goodsAvailableForSale: number;
    endingInventoryValue: number;
    costOfSales: number;
    grossProfit: number;
    operatingExpenses: number;
    expenseBreakdown: Record<string, number>;
    netIncomeBeforeTax: number;
    withholdingTax2: number;
    netTaxPayable: number;
    netIncome: number;
}

export interface TrialBalanceEntry {
    code: number;
    name: string;
    debit: number;
    credit: number;
}

export interface BalanceSheet {
    assets: {
        cashAndBank: number;
        accountsReceivable: number;
        inventoryValue: number;
        fixedAssetsCost: number;
        accumulatedDepreciation: number;
        fixedAssetsNbv: number;
        totalAssets: number;
    };
    liabilities: {
        profitTaxPayable: number;
        otherPayables: number;
        loans: number;
        totalLiabilities: number;
    };
    equity: {
        capital: number;
        netIncome: number;
        totalEquity: number;
    };
    totalLiabilitiesAndEquity: number;
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

    let totalRevenue = 0;
    const revenueBreakdown: Record<string, number> = {};
    let purchasesTaxable = 0;
    let purchasesNonTaxable = 0;
    let operatingExpenses = 0;
    const expenseBreakdown: Record<string, number> = {
        'Depreciation': 0,
        'Salaries': 0,
        'Supplies': 0,
        'Pension': 0,
        'Other Operating': 0
    };

    // Aggregate by 5-digit account code and Category
    transactions.forEach(tx => {
        const code = tx.accountCode;
        if (code >= 40000 && code < 50000) {
            // Aggregated Revenue by category
            const catName = tx.category || 'Other Sales';
            revenueBreakdown[catName] = (revenueBreakdown[catName] || 0) + tx.amount;
            totalRevenue += tx.amount;
        } else if (code === COA.EXP_PURCHASES) {
            purchasesTaxable += tx.amount;
        } else if (code === COA.EXP_PURCHASES_NON_TAXABLE) {
            purchasesNonTaxable += tx.amount;
        } else if (code >= 50000 && code < 60000) {
            // Specific Expense Mapping
            if (code === 50001) expenseBreakdown['Depreciation'] += tx.amount;
            else if (code === 50002) expenseBreakdown['Salaries'] += tx.amount;
            else if (code === 50005) expenseBreakdown['Supplies'] += tx.amount;
            else if (code === 50007) expenseBreakdown['Pension'] += tx.amount;
            else if (code !== COA.EXP_PURCHASES && code !== COA.EXP_PURCHASES_NON_TAXABLE) {
                const expCat = tx.category || 'Other Operating';
                expenseBreakdown[expCat] = (expenseBreakdown[expCat] || 0) + tx.amount;
            }

            if (code !== COA.EXP_PURCHASES && code !== COA.EXP_PURCHASES_NON_TAXABLE) {
                operatingExpenses += tx.amount;
            }
        }
    });

    const revenue = totalRevenue;
    const purchases = purchasesTaxable + purchasesNonTaxable;

    // Fetch Opening Inventory from AccountBalance ledger 10102
    // If no balance exists, it defaults to 0
    const opBal = await AccountBalance.findOne({ tenant: tenantId, accountCode: 10102 });
    const openingInventory = opBal ? opBal.balance : 0;

    const endingInventoryValue = await calculateEndingInventory(tenantId);

    // COGS Breakdown: (Opening + Purchases) - Ending
    const goodsAvailableForSale = openingInventory + purchases;
    const costOfSales = goodsAvailableForSale - endingInventoryValue;
    const grossProfit = revenue - costOfSales;
    const netIncomeBeforeTax = grossProfit - operatingExpenses;

    // Taxation logic (Placeholder based on specimen)
    const withholdingTax2 = 0; // Calculated on specific trans if needed
    const netTaxPayable = 0; // Final calculated tax
    const netIncome = netIncomeBeforeTax - netTaxPayable;

    return {
        revenue,
        revenueBreakdown,
        purchases,
        purchasesTaxable,
        purchasesNonTaxable,
        openingInventory,
        goodsAvailableForSale,
        endingInventoryValue,
        costOfSales,
        grossProfit,
        operatingExpenses,
        expenseBreakdown,
        netIncomeBeforeTax,
        withholdingTax2,
        netTaxPayable,
        netIncome
    };
}

/**
 * Helper to get raw balance sheet numbers prior to calculating net income
 */
export async function generateBalanceSheet(tenantId: string): Promise<BalanceSheet> {
    await connectDB();

    const balances = await AccountBalance.find({ tenant: tenantId });
    const incomeStmt = await generateIncomeStatement(tenantId);

    let cashAndBank = 0;
    let accountsReceivable = 0;
    let fixedAssetsCost = 0;
    let accumulatedDepreciation = 0;
    let profitTaxPayable = 0;
    let otherPayables = 0;
    let loans = 0;
    let capital = 0;

    balances.forEach(b => {
        if (b.accountCode === COA.ASSET_CASH) cashAndBank += b.balance;
        if (b.accountCode === COA.ASSET_AR) accountsReceivable += b.balance;
        if (b.accountCode === COA.ASSET_FIXED_COST) fixedAssetsCost += b.balance;
        if (b.accountCode === COA.ASSET_ACCUM_DEP) accumulatedDepreciation += b.balance;
        if (b.accountCode === COA.LIAB_PROFIT_TAX) profitTaxPayable += b.balance;
        if (b.accountCode === COA.LIAB_AP) otherPayables += b.balance;
        if (b.accountCode === COA.LIAB_LOAN) loans += b.balance;
        if (b.accountCode === COA.EQUITY_CAPITAL) capital += b.balance;
    });

    const inventoryValue = incomeStmt.endingInventoryValue;
    const fixedAssetsNbv = fixedAssetsCost - accumulatedDepreciation;
    const totalAssets = cashAndBank + accountsReceivable + inventoryValue + fixedAssetsNbv;

    const totalLiabilities = profitTaxPayable + otherPayables + loans;
    const netIncome = incomeStmt.netIncome;
    const totalEquity = capital + netIncome;

    return {
        assets: {
            cashAndBank,
            accountsReceivable,
            inventoryValue,
            fixedAssetsCost,
            accumulatedDepreciation,
            fixedAssetsNbv,
            totalAssets
        },
        liabilities: {
            profitTaxPayable,
            otherPayables,
            loans,
            totalLiabilities
        },
        equity: {
            capital,
            netIncome,
            totalEquity
        },
        totalLiabilitiesAndEquity: totalLiabilities + totalEquity
    };
}

/**
 * Module C: The Balancing Engine (Validation)
 * Enforce: Assets = Liabilities + Capital + NetIncome
 */
export async function validateAccountingEquation(tenantId: string): Promise<boolean> {
    // 1. Get Balance Sheet totals (which now links to Income Statement)
    const bs = await generateBalanceSheet(tenantId);

    const totalAssets = bs.assets.totalAssets;
    const totalLiabilitiesAndEquity = bs.totalLiabilitiesAndEquity;

    const diff = Math.abs(totalAssets - totalLiabilitiesAndEquity);

    // If diff is greater than a rounding error (e.g. 0.01), it's unbalanced
    if (diff > 0.01) {
        throw new Error(`Reconciliation Error: Total Assets (${totalAssets}) does not equal Total Liabilities + Equity (${totalLiabilitiesAndEquity}). Difference: ${totalAssets - totalLiabilitiesAndEquity}`);
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

    // Mapping to formal tax form boxes (image_0.png)
    const box5TaxableSales = baseSales;
    const box5Vat = outputVat;
    const box10TaxablePurchases = basePurchases;
    const box10Vat = inputVat;
    const box15NetCredit = box5Vat - box10Vat;

    // Metadata for the formal form header
    const organizationName = "Ato Abebe Tigistu"; // In production, this would come from tenant settings
    const tin = "0000000000"; // Placeholder TIN
    const period = startDate && endDate
        ? `${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`
        : "Current Period";

    return {
        organizationName,
        tin,
        period,
        box5TaxableSales,
        box5Vat,
        box10TaxablePurchases,
        box10Vat,
        box15NetCredit,
        // Legacy fields for backward compatibility
        baseSales,
        outputVat,
        basePurchases,
        inputVat,
        netVatPayable: box15NetCredit
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

export async function generateTrialBalance(tenantId: string) {
    await connectDB();
    const balances = await AccountBalance.find({ tenant: tenantId });
    const transactions = await Transaction.find({ tenant: tenantId });

    const accountMap: Record<number, { debit: number, credit: number }> = {};

    // 1. Initialize from static balances (Opening Balances)
    balances.forEach(b => {
        if (!accountMap[b.accountCode]) accountMap[b.accountCode] = { debit: 0, credit: 0 };
        // DR: Assets (1xxxx) and Expenses (5xxxx)
        // CR: Liab/Equity (3xxxx) and Revenue (4xxxx)
        if (b.accountCode < 30000 || b.accountCode >= 50000) {
            accountMap[b.accountCode].debit += b.balance;
        } else {
            accountMap[b.accountCode].credit += b.balance;
        }
    });

    // 2. Process Transactions (Reconstruct Double-Entry Legs)
    transactions.forEach(tx => {
        const code = tx.accountCode;
        if (!code) return; // Skip legacy transactions without codes

        const amt = tx.amount;
        const vat = tx.vatAmount || 0;

        if (!accountMap[code]) accountMap[code] = { debit: 0, credit: 0 };
        if (!accountMap[COA.ASSET_CASH]) accountMap[COA.ASSET_CASH] = { debit: 0, credit: 0 };
        if (!accountMap[COA.LIAB_VAT]) accountMap[COA.LIAB_VAT] = { debit: 0, credit: 0 };

        // Sales (40xxx): CR Revenue, DR Cash, CR VAT
        if (code >= 40000 && code < 50000) {
            accountMap[code].credit += amt;
            accountMap[COA.ASSET_CASH].debit += (amt + vat);
            if (vat > 0) accountMap[COA.LIAB_VAT].credit += vat;
        }
        // Purchases/Expenses (50xxx): DR Expense, CR Cash, DR VAT (offset)
        else if (code >= 50000 && code < 60000) {
            accountMap[code].debit += amt;
            accountMap[COA.ASSET_CASH].credit += (amt + vat);
            if (vat > 0) accountMap[COA.LIAB_VAT].debit += vat;
        }
    });

    // 3. Net the balances and format
    const entries: TrialBalanceEntry[] = Object.entries(accountMap).map(([codeStr, value]) => {
        const code = Number(codeStr);
        if (isNaN(code)) return null;

        const { debit, credit } = value;
        let netDebit = 0;
        let netCredit = 0;

        if (debit >= credit) netDebit = debit - credit;
        else netCredit = credit - debit;

        return {
            code,
            name: getAccountName(code),
            debit: netDebit,
            credit: netCredit
        };
    }).filter((e): e is TrialBalanceEntry => e !== null && (e.debit > 0 || e.credit > 0))
        .sort((a, b) => a.code - b.code);

    const totalDebit = entries.reduce((sum, e) => sum + e.debit, 0);
    const totalCredit = entries.reduce((sum, e) => sum + e.credit, 0);

    return {
        entries,
        totalDebit,
        totalCredit,
        isBalanced: Math.abs(totalDebit - totalCredit) < 0.01
    };
}

function getAccountName(code: number): string {
    const names: Record<number, string> = {
        10100: 'Cash at Bank / Petty Cash',
        10101: 'Accounts Receivable',
        10102: 'Inventory Asset (Opening)',
        10200: 'Fixed Assets (Prop/Equip)',
        30100: 'Accounts Payable',
        30101: 'VAT Payable (Liabilities)',
        30102: 'Short-term Loans',
        30200: 'Capital / Owner Equity',
        40000: 'Sales Revenue (Service)',
        40100: 'Beverage Sales Revenue',
        40200: 'Other Service Revenue',
        50000: 'Cost of Goods Sold (Adjusted)',
        50100: 'General Operating Expense',
        50101: 'Utilities Expense',
        50102: 'Payroll & Salaries',
        50103: 'Marketing & Promo',
        50200: 'Taxable Purchases',
        50201: 'Non-taxable Purchases'
    };
    return names[code] || `Account ${code}`;
}

