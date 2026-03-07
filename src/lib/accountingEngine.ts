import connectDB from './db';
import { Transaction, AccountBalance, StockInventory, FixedAsset } from './models';

// Interface definitions for reports
export interface VatReport {
    totalSales: number;
    outputVat: number;
    inputVat: number;
    netVatPayable: number;
}

export interface IncomeStatement {
    revenue: number;
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
        totalLiabilities: number;
    };
    capital: number;
}

export interface FinancialRatios {
    grossProfitMargin: number; // percentage
    netProfitMargin: number; // percentage
    returnOnAssets: number; // percentage
    debtRatio: number; // percentage
}

/**
 * 1. Calculate VAT Declaration
 */
export async function generateVatReport(tenantId: string, startDate?: Date, endDate?: Date): Promise<VatReport> {
    await connectDB();

    const query: any = { tenant: tenantId };
    if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = startDate;
        if (endDate) query.date.$lte = endDate;
    }

    const transactions = await Transaction.find(query);

    let totalSales = 0;
    let outputVat = 0;
    let inputVat = 0;

    transactions.forEach(tx => {
        if (tx.type === 'sale') {
            totalSales += tx.amount;
            outputVat += tx.vatAmount;
        } else if (tx.type === 'purchase' || tx.type === 'expense') {
            // Assuming all valid purchases/expenses have input VAT recorded
            inputVat += tx.vatAmount;
        }
    });

    return {
        totalSales,
        outputVat,
        inputVat,
        netVatPayable: outputVat - inputVat
    };
}

/**
 * 2. Generate Income Statement
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
    let costOfSales = 0;
    let operatingExpenses = 0;

    transactions.forEach(tx => {
        if (tx.type === 'sale') {
            revenue += tx.amount;
        } else if (tx.type === 'purchase' && (tx.category === 'Raw Materials' || tx.category === 'Inventory' || tx.category === 'COGS')) {
            costOfSales += tx.amount;
        } else if (tx.type === 'expense') {
            operatingExpenses += tx.amount;
        }
    });

    const grossProfit = revenue - costOfSales;
    const netIncome = grossProfit - operatingExpenses;

    return {
        revenue,
        costOfSales,
        grossProfit,
        operatingExpenses,
        netIncome
    };
}

/**
 * 3. Generate Balance Sheet
 */
export async function generateBalanceSheet(tenantId: string): Promise<BalanceSheet> {
    await connectDB();

    // 1. Fetch static account balances
    const balances = await AccountBalance.find({ tenant: tenantId });
    let cashAndBank = 0;
    let accountsReceivable = 0;
    let otherPayables = 0;
    let capital = 0;

    balances.forEach(b => {
        if (b.name === 'Cash') cashAndBank += b.balance;
        if (b.name === 'Accounts Receivable') accountsReceivable += b.balance;
        if (b.name === 'Accounts Payable' || b.name === 'Loans') otherPayables += b.balance;
        if (b.name === 'Owner Capital' || b.name === 'Retained Earnings') capital += b.balance;
    });

    // 2. Compute dynamic inventory value (Qty * Cost)
    const inventory = await StockInventory.find({ tenant: tenantId });
    const inventoryValue = inventory.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0);

    // 3. Compute dynamic Net Book Value of Fixed Assets
    const assets = await FixedAsset.find({ tenant: tenantId });
    const fixedAssetsNbv = assets.reduce((sum, item) => {
        const cost = item.cost_beginning + item.addition;
        const dep = item.dep_beginning + item.dep_addition;
        return sum + (cost - dep);
    }, 0);

    // 4. Get current VAT liability
    const vatReport = await generateVatReport(tenantId);
    const taxPayable = vatReport.netVatPayable > 0 ? vatReport.netVatPayable : 0;

    return {
        assets: {
            cashAndBank,
            accountsReceivable,
            inventoryValue,
            fixedAssetsNbv,
            totalAssets: cashAndBank + accountsReceivable + inventoryValue + fixedAssetsNbv
        },
        liabilities: {
            taxPayable,
            otherPayables,
            totalLiabilities: taxPayable + otherPayables
        },
        capital
    };
}

/**
 * 4. Generate Financial Ratios
 */
export async function generateFinancialRatios(tenantId: string, startDate?: Date, endDate?: Date): Promise<FinancialRatios> {
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
