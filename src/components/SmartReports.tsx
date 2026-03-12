"use client";

import { useState, useEffect } from 'react';

export default function SmartReports() {
    const [loading, setLoading] = useState(true);
    const [reportData, setReportData] = useState<any>(null);
    const [reconciliationError, setReconciliationError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchReports() {
            try {
                const res = await fetch('/api/reports/financials');
                const json = await res.json();
                if (res.status === 400 && json.error?.includes('Reconciliation Error')) {
                    setReconciliationError(json.error);
                } else if (json.success) {
                    setReportData(json.data);
                } else {
                    console.error('API Error:', json.error);
                }
            } catch (error) {
                console.error('Failed to fetch reports:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchReports();
    }, []);

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading smart reports...</div>;

    if (reconciliationError) {
        return (
            <div className="animate-slide-up" style={{ padding: '3rem 2rem', maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚖️</div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#EF4444', marginBottom: '1rem' }}>Accounting Imbalance Detected</h2>
                <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '1.5rem', borderRadius: 12, border: '1px solid #FCA5A5', fontSize: '0.9375rem', lineHeight: 1.6, textAlign: 'left' }}>
                    <p style={{ fontWeight: 700, marginBottom: '0.5rem' }}>System Halt: {reconciliationError}</p>
                    <p>According to Ethiopian accounting standards, the fundamental accounting equation (Assets = Liabilities + Equity + Net Income) must strictly balance before generating financial reports and VAT declarations.</p>
                    <p style={{ marginTop: '0.75rem', fontWeight: 600 }}>Please review your journal entries and ensure double-entry accounting is maintained.</p>
                </div>
            </div>
        );
    }

    if (!reportData) return <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>Error loading data.</div>;

    const formatCurrency = (val: any) => {
        if (val === null || val === undefined || isNaN(Number(val))) return 'ETB 0.00';
        return `ETB ${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };
    const formatPercent = (val: any) => {
        if (val === null || val === undefined || isNaN(Number(val))) return '0.00%';
        return `${Number(val).toFixed(2)}%`;
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Overview Cards */}
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                <div className="card" style={{ flex: 1, minWidth: 200, borderTop: '4px solid #CB6843' }}>
                    <div style={{ fontSize: '0.875rem', color: '#7A7A7A', fontWeight: 600 }}>Total Revenue</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1A1A1A', marginTop: '0.5rem' }}>
                        {formatCurrency(reportData.incomeStatement.revenue)}
                    </div>
                </div>
                <div className="card" style={{ flex: 1, minWidth: 200, borderTop: '4px solid #2A4A3E' }}>
                    <div style={{ fontSize: '0.875rem', color: '#7A7A7A', fontWeight: 600 }}>Net Income</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1A1A1A', marginTop: '0.5rem' }}>
                        {formatCurrency(reportData.incomeStatement.netIncome)}
                    </div>
                </div>
                <div className="card" style={{ flex: 1, minWidth: 200, borderTop: '4px solid #F59E0B' }}>
                    <div style={{ fontSize: '0.875rem', color: '#7A7A7A', fontWeight: 600 }}>VAT Payable</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1A1A1A', marginTop: '0.5rem' }}>
                        {formatCurrency(reportData.vatDeclaration.netVatPayable)}
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Income Statement */}
                <div className="card" style={{ transition: 'all 0.3s ease', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', gridColumn: 'span 2' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem', color: '#2A4A3E', borderBottom: '2px solid #E2DFD4', paddingBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>📊</span> Detailed Income Statement
                    </h2>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        {/* Revenue Section */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#7A7A7A', letterSpacing: '0.05em' }}>Revenue Breakdown</div>
                            {Object.entries(reportData.incomeStatement.revenueBreakdown || {}).length > 0 ? (
                                Object.entries(reportData.incomeStatement.revenueBreakdown).map(([category, amount]: [string, any]) => (
                                    <div key={category} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', padding: '0.25rem 0' }}>
                                        <span style={{ color: '#555' }}>{category}</span>
                                        <span style={{ fontWeight: 600 }}>{formatCurrency(amount)}</span>
                                    </div>
                                ))
                            ) : (
                                <div style={{ fontSize: '0.875rem', color: '#999', fontStyle: 'italic', padding: '0.5rem 0' }}>No revenue recorded in this period</div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderTop: '1px solid #E2DFD4', marginTop: '0.5rem' }}>
                                <span style={{ fontWeight: 800, color: '#2A4A3E' }}>Total Revenues (R)</span>
                                <span style={{ fontWeight: 800, fontSize: '1.125rem' }}>{formatCurrency(reportData.incomeStatement.revenue)}</span>
                            </div>

                            {/* Cost of Sales (Condensed view here) */}
                            <div style={{ background: '#F9F8F6', borderRadius: 12, padding: '1rem', border: '1.5px solid #E2DFD4', marginTop: '1rem' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#7A7A7A', marginBottom: '0.75rem' }}>Cost of Sales Summary</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.4rem' }}>
                                    <span>Goods Avail. for Sale</span><span>{formatCurrency(reportData.incomeStatement.goodsAvailableForSale)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.4rem' }}>
                                    <span>Less: Ending Stock</span><span>({formatCurrency(reportData.incomeStatement.endingInventoryValue)})</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '2px solid #E2DFD4', fontWeight: 800, color: '#CB6843' }}>
                                    <span>Total COGS (CS)</span><span>({formatCurrency(reportData.incomeStatement.costOfSales)})</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: '#2A4A3E', color: 'white', borderRadius: 10, fontWeight: 700, marginTop: '1rem' }}>
                                <span>Gross Profit</span>
                                <span>{formatCurrency(reportData.incomeStatement.grossProfit)}</span>
                            </div>
                        </div>

                        {/* Expenses & Taxes Section */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#7A7A7A', letterSpacing: '0.05em' }}>Operating Expenses</div>
                            {Object.entries(reportData.incomeStatement.expenseBreakdown).map(([name, amount]: [string, any]) => (
                                <div key={name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                    <span style={{ color: '#555' }}>{name}</span>
                                    <span style={{ color: amount > 0 ? '#EF4444' : '#7A7A7A' }}>{amount > 0 ? `(${formatCurrency(amount).replace('ETB ', '')})` : '—'}</span>
                                </div>
                            ))}
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderTop: '1px solid #E2DFD4', marginTop: '0.5rem', fontWeight: 700 }}>
                                <span style={{ color: '#2A4A3E' }}>Total Expenses (E)</span>
                                <span style={{ color: '#EF4444' }}>({formatCurrency(reportData.incomeStatement.operatingExpenses)})</span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'rgba(203, 104, 67, 0.05)', color: '#CB6843', borderRadius: 10, fontWeight: 700, marginTop: '1rem', border: '1px dashed #CB6843' }}>
                                <span>Net Income (Pre-Tax)</span>
                                <span>{formatCurrency(reportData.incomeStatement.netIncomeBeforeTax)}</span>
                            </div>

                            {/* Taxes Section */}
                            <div style={{ marginTop: '1rem', borderTop: '2px solid #E2DFD4', paddingTop: '1rem' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#7A7A7A', marginBottom: '0.75rem' }}>Taxation (image_6 Specimen)</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.4rem' }}>
                                    <span>Withholding Tax (2%)</span><span>({formatCurrency(reportData.incomeStatement.withholdingTax2)})</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.4rem' }}>
                                    <span>Net Tax Payable</span><span>({formatCurrency(reportData.incomeStatement.netTaxPayable)})</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1.25rem 1rem', background: '#CB6843', color: 'white', borderRadius: 12, marginTop: '1rem', boxShadow: '0 4px 15px rgba(203, 104, 67, 0.3)' }}>
                                <span style={{ fontWeight: 800, fontSize: '1.25rem' }}>Net Income after Tax</span>
                                <span style={{ fontWeight: 800, fontSize: '1.25rem' }}>{formatCurrency(reportData.incomeStatement.netIncome)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Balance Sheet */}
                <div className="card" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.05)', gridColumn: 'span 2' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem', color: '#2A4A3E', borderBottom: '2px solid #E2DFD4', paddingBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>⚖️</span> Audited Balance Sheet
                    </h2>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        {/* ASSETS COLUMN */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#7A7A7A', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>Current Assets</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', padding: '0.4rem 0' }}>
                                    <span style={{ color: '#555' }}>(10100) Cash on hand / Bank</span>
                                    <span style={{ fontWeight: 600 }}>{formatCurrency(reportData.balanceSheet.assets.cashAndBank)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', padding: '0.4rem 0' }}>
                                    <span style={{ color: '#555' }}>(10101) Trade & Other Receivables</span>
                                    <span style={{ fontWeight: 600 }}>{formatCurrency(reportData.balanceSheet.assets.accountsReceivable)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', padding: '0.4rem 0' }}>
                                    <span style={{ color: '#2A4A3E', fontWeight: 600 }}>(10102) Inventory (Ending Stock)</span>
                                    <span style={{ fontWeight: 700 }}>{formatCurrency(reportData.balanceSheet.assets.inventoryValue)}</span>
                                </div>
                            </div>

                            <div style={{ borderTop: '1px solid #E2DFD4', paddingTop: '1rem' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#7A7A7A', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>Property & Equipment</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', padding: '0.4rem 0' }}>
                                    <span style={{ color: '#555' }}>(15100) Equipment Cost</span>
                                    <span style={{ fontWeight: 600 }}>{formatCurrency(reportData.balanceSheet.assets.fixedAssetsCost)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', padding: '0.4rem 0' }}>
                                    <span style={{ color: '#555' }}>(17200) Accum. Depreciation</span>
                                    <span style={{ fontWeight: 600, color: '#EF4444' }}>({formatCurrency(reportData.balanceSheet.assets.accumulatedDepreciation).replace('ETB ', '')})</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', padding: '0.5rem', background: '#F9F8F6', borderRadius: 6, marginTop: '0.5rem', fontWeight: 700 }}>
                                    <span>Net Fixed Assets</span>
                                    <span>{formatCurrency(reportData.balanceSheet.assets.fixedAssetsNbv)}</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1.25rem 1rem', background: '#2A4A3E', color: 'white', borderRadius: 12, marginTop: 'auto' }}>
                                <span style={{ fontWeight: 800, fontSize: '1.125rem' }}>TOTAL ASSETS</span>
                                <span style={{ fontWeight: 800, fontSize: '1.125rem' }}>{formatCurrency(reportData.balanceSheet.assets.totalAssets)}</span>
                            </div>
                        </div>

                        {/* LIABILITIES & EQUITY COLUMN */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#7A7A7A', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>Liabilities</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', padding: '0.4rem 0' }}>
                                    <span style={{ color: '#555' }}>(39005) Profit Tax Payable</span>
                                    <span style={{ fontWeight: 600 }}>{formatCurrency(reportData.balanceSheet.liabilities.profitTaxPayable)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', padding: '0.4rem 0' }}>
                                    <span style={{ color: '#555' }}>Other Payables</span>
                                    <span style={{ fontWeight: 600 }}>{formatCurrency(reportData.balanceSheet.liabilities.otherPayables)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', padding: '0.4rem 0' }}>
                                    <span style={{ color: '#555' }}>Loans/Borrowings</span>
                                    <span style={{ fontWeight: 600 }}>{formatCurrency(reportData.balanceSheet.liabilities.loans)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', borderTop: '1px solid #E2DFD4', marginTop: '0.5rem', fontWeight: 700, color: '#7A7A7A' }}>
                                    <span>Total Liabilities</span>
                                    <span>{formatCurrency(reportData.balanceSheet.liabilities.totalLiabilities)}</span>
                                </div>
                            </div>

                            <div style={{ borderTop: '2px solid #E2DFD4', paddingTop: '1rem', flexGrow: 1 }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#7A7A7A', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>Capital & Equity</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', padding: '0.4rem 0' }}>
                                    <span style={{ color: '#555' }}>Business Capital</span>
                                    <span style={{ fontWeight: 600 }}>{formatCurrency(reportData.balanceSheet.equity.capital)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', padding: '0.4rem 0' }}>
                                    <span style={{ color: '#2A4A3E', fontWeight: 600 }}>Net Income (After Tax)</span>
                                    <span style={{ fontWeight: 700, color: '#2A4A3E' }}>{formatCurrency(reportData.balanceSheet.equity.netIncome)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'rgba(42, 74, 62, 0.05)', color: '#2A4A3E', borderRadius: 10, fontWeight: 700, marginTop: '1rem', border: '1px dashed #2A4A3E' }}>
                                    <span>Total Equity</span>
                                    <span>{formatCurrency(reportData.balanceSheet.equity.totalEquity)}</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1.25rem 1rem', background: '#CB6843', color: 'white', borderRadius: 12 }}>
                                <span style={{ fontWeight: 800, fontSize: '1.125rem' }}>TOTAL LIAB. & EQUITY</span>
                                <span style={{ fontWeight: 800, fontSize: '1.125rem' }}>{formatCurrency(reportData.balanceSheet.totalLiabilitiesAndEquity)}</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#F0FDF4', padding: '0.75rem 1.5rem', borderRadius: 50, border: '1px solid #BBF7D0', color: '#166534', fontWeight: 700, fontSize: '0.8125rem' }}>
                            <span style={{ fontSize: '1.25rem' }}>✨</span>
                            <span>Formula Check: Assets = Liabilities + Equity</span>
                            <span style={{ background: '#166534', color: 'white', padding: '0.2rem 0.6rem', borderRadius: 10, fontSize: '0.75rem' }}>BALANCED</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Trial Balance (Master Summary Sheet) */}
            <div className="card" style={{ borderLeft: '6px solid #2A4A3E' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem', color: '#2A4A3E', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span>📜</span> General Ledger Trial Balance
                </h2>
                <p style={{ fontSize: '0.8125rem', color: '#7A7A7A', marginBottom: '1.5rem' }}>
                    Master summary confirming that all ledger accounts are aligned and ready for statement preparation.
                </p>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '2px solid #E2DFD4', color: '#7A7A7A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 700 }}>Code</th>
                                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 700 }}>Account Name</th>
                                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 700, textAlign: 'right' }}>Debit (ETB)</th>
                                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 700, textAlign: 'right' }}>Credit (ETB)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportData.trialBalance.entries.map((entry: any) => (
                                <tr key={entry.code} style={{ borderBottom: '1px solid #F3F1EA' }}>
                                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600, color: '#CB6843' }}>{entry.code}</td>
                                    <td style={{ padding: '0.75rem 0.5rem', color: '#3D3D3D' }}>{entry.name}</td>
                                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontWeight: 500 }}>
                                        {entry.debit > 0 ? Number(entry.debit).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '—'}
                                    </td>
                                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontWeight: 500 }}>
                                        {entry.credit > 0 ? Number(entry.credit).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr style={{ background: '#F9F8F6', fontWeight: 800, color: '#2A4A3E' }}>
                                <td colSpan={2} style={{ padding: '1rem 0.5rem', textAlign: 'right', textTransform: 'uppercase' }}>Total Trial Balance</td>
                                <td style={{ padding: '1rem 0.5rem', textAlign: 'right', borderTop: '2px double #2A4A3E' }}>
                                    {Number(reportData.trialBalance.totalDebit || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </td>
                                <td style={{ padding: '1rem 0.5rem', textAlign: 'right', borderTop: '2px double #2A4A3E' }}>
                                    {Number(reportData.trialBalance.totalCredit || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                    {reportData.trialBalance.isBalanced ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#166534', background: '#DCFCE7', padding: '0.5rem 1rem', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, border: '1px solid #BBF7D0' }}>
                            <span style={{ fontSize: '1rem' }}>✅</span> Master Ledger Balanced
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#991B1B', background: '#FEE2E2', padding: '0.5rem 1rem', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, border: '1px solid #FCA5A5' }}>
                            <span style={{ fontSize: '1rem' }}>⚠️</span> Ledger Imbalance Detected
                        </div>
                    )}
                </div>
            </div>

            {/* Official VAT Return (image_0.png style) */}
            <div className="card" style={{ border: '2px solid #333', padding: '2rem', background: 'white' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem', borderBottom: '2px solid #333', paddingBottom: '1rem' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Value Added Tax (VAT) Return</h1>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', fontSize: '0.875rem', fontWeight: 700 }}>
                        <span>ORGANIZATION: {reportData.vatDeclaration.organizationName}</span>
                        <span>TIN: {reportData.vatDeclaration.tin}</span>
                        <span>PERIOD: {reportData.vatDeclaration.period}</span>
                    </div>
                </div>

                <div style={{ border: '1px solid #333' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr', background: '#eee', fontWeight: 800, borderBottom: '1px solid #333', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                        <div style={{ padding: '0.5rem', borderRight: '1px solid #333' }}>Description of Taxable Activity</div>
                        <div style={{ padding: '0.5rem', borderRight: '1px solid #333', textAlign: 'center' }}>Base Amount (ETB)</div>
                        <div style={{ padding: '0.5rem', textAlign: 'center' }}>VAT Amount (15%)</div>
                    </div>

                    {/* Box 5: Taxable Sales */}
                    <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr', borderBottom: '1px solid #333', fontSize: '0.875rem' }}>
                        <div style={{ padding: '0.75rem', borderRight: '1px solid #333', display: 'flex', gap: '1rem' }}>
                            <span style={{ fontWeight: 800 }}>[Box 5]</span>
                            <span>Standard Taxable Sales & Services</span>
                        </div>
                        <div style={{ padding: '0.75rem', borderRight: '1px solid #333', textAlign: 'right', fontWeight: 600 }}>
                            {Number(reportData.vatDeclaration.box5TaxableSales || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                        <div style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 700 }}>
                            {Number(reportData.vatDeclaration.box5Vat || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                    </div>

                    {/* Box 10: Taxable Purchases */}
                    <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr', borderBottom: '2px solid #333', fontSize: '0.875rem' }}>
                        <div style={{ padding: '0.75rem', borderRight: '1px solid #333', display: 'flex', gap: '1rem' }}>
                            <span style={{ fontWeight: 800 }}>[Box 10]</span>
                            <span>Standard Taxable Purchases (Local & Import)</span>
                        </div>
                        <div style={{ padding: '0.75rem', borderRight: '1px solid #333', textAlign: 'right', fontWeight: 600 }}>
                            {Number(reportData.vatDeclaration.box10TaxablePurchases || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                        <div style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 700, color: '#EF4444' }}>
                            ({Number(reportData.vatDeclaration.box10Vat || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })})
                        </div>
                    </div>

                    {/* Summary Result */}
                    <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr', fontSize: '1rem', background: '#F9F8F6' }}>
                        <div style={{ padding: '1rem', borderRight: '1px solid #333', display: 'flex', gap: '1rem', fontWeight: 900, textTransform: 'uppercase' }}>
                            <span>[Box 15]</span>
                            <span>Net-credit (or Payable) to the Filer</span>
                        </div>
                        <div style={{ padding: '1rem', borderRight: '1px solid #333', background: '#ddd' }}></div>
                        <div style={{ padding: '1rem', textAlign: 'right', fontWeight: 900, color: reportData.vatDeclaration.box15NetCredit >= 0 ? '#166534' : '#EF4444', textDecoration: 'underline double' }}>
                            {formatCurrency(reportData.vatDeclaration.box15NetCredit)}
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>
                    <div style={{ borderTop: '1px solid #333', paddingTop: '0.5rem', width: '200px', textAlign: 'center' }}>
                        Accountant Name / Stamp
                    </div>
                    <div style={{ borderTop: '1px solid #333', paddingTop: '0.5rem', width: '200px', textAlign: 'center' }}>
                        Tax Authority Received Date
                    </div>
                </div>
            </div>

            {/* Ratios & Insights */}
            <div className="card" style={{ background: '#2A4A3E', color: 'white' }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.5rem', color: '#F3F1EA', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                    Smart Business Insights & Ratios
                </h2>
                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Gross Margin</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#CB6843' }}>{formatPercent(reportData.financialRatios.grossProfitMargin)}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Net Margin</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#CB6843' }}>{formatPercent(reportData.financialRatios.netProfitMargin)}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Return on Assets</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white' }}>{formatPercent(reportData.financialRatios.returnOnAssets)}</div>
                    </div>
                </div>
                <p style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
                    💡 <strong>Recommendation:</strong> Based on the standard accounting equation (Assets = Liabilities + Equity), ensure all manual transactions are correctly reconciled. High gross margins indicate strong pricing power against suppliers, but keep an eye on operating expenses to maintain a healthy net margin.
                </p>
            </div>
        </div>
    );
}
