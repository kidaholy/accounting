"use client";

import { useState, useEffect } from 'react';

export default function SmartReports() {
    const [loading, setLoading] = useState(true);
    const [reportData, setReportData] = useState<any>(null);

    useEffect(() => {
        async function fetchReports() {
            try {
                const res = await fetch('/api/reports/financials');
                const json = await res.json();
                if (json.success) {
                    setReportData(json.data);
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
    if (!reportData) return <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>Error loading data.</div>;

    const formatCurrency = (val: number) => `ETB ${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const formatPercent = (val: number) => `${val.toFixed(2)}%`;

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
                <div className="card">
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.5rem', color: '#2A4A3E', borderBottom: '1px solid #E2DFD4', paddingBottom: '0.5rem' }}>
                        Income Statement
                    </h2>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <span style={{ color: '#3D3D3D' }}>Revenue</span>
                        <span style={{ fontWeight: 600 }}>{formatCurrency(reportData.incomeStatement.revenue)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: '#7A7A7A' }}>
                        <span>Less: Cost of Sales</span>
                        <span>({formatCurrency(reportData.incomeStatement.costOfSales)})</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontWeight: 700, background: '#F3F1EA', padding: '0.5rem', borderRadius: 8 }}>
                        <span>Gross Profit</span>
                        <span>{formatCurrency(reportData.incomeStatement.grossProfit)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: '#7A7A7A' }}>
                        <span>Less: Operating Expenses</span>
                        <span>({formatCurrency(reportData.incomeStatement.operatingExpenses)})</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.125rem', color: '#2A4A3E', borderTop: '2px solid #E2DFD4', paddingTop: '1rem' }}>
                        <span>Net Income</span>
                        <span>{formatCurrency(reportData.incomeStatement.netIncome)}</span>
                    </div>
                </div>

                {/* Balance Sheet */}
                <div className="card">
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.5rem', color: '#2A4A3E', borderBottom: '1px solid #E2DFD4', paddingBottom: '0.5rem' }}>
                        Balance Sheet
                    </h2>
                    {/* Assets */}
                    <div style={{ fontWeight: 700, color: '#3D3D3D', marginBottom: '0.5rem' }}>Assets</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#7A7A7A', fontSize: '0.875rem' }}>
                        <span>Cash & Bank</span><span>{formatCurrency(reportData.balanceSheet.assets.cashAndBank)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#7A7A7A', fontSize: '0.875rem' }}>
                        <span>Accounts Receivable</span><span>{formatCurrency(reportData.balanceSheet.assets.accountsReceivable)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#7A7A7A', fontSize: '0.875rem' }}>
                        <span>Inventory</span><span>{formatCurrency(reportData.balanceSheet.assets.inventoryValue)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: '#7A7A7A', fontSize: '0.875rem' }}>
                        <span>Fixed Assets (NBV)</span><span>{formatCurrency(reportData.balanceSheet.assets.fixedAssetsNbv)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontWeight: 700, background: '#F3F1EA', padding: '0.5rem', borderRadius: 8 }}>
                        <span>Total Assets</span><span>{formatCurrency(reportData.balanceSheet.assets.totalAssets)}</span>
                    </div>

                    {/* Liabilities & Capital */}
                    <div style={{ fontWeight: 700, color: '#3D3D3D', marginBottom: '0.5rem' }}>Liabilities & Capital</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#7A7A7A', fontSize: '0.875rem' }}>
                        <span>Tax Payable (VAT)</span><span>{formatCurrency(reportData.balanceSheet.liabilities.taxPayable)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#7A7A7A', fontSize: '0.875rem' }}>
                        <span>Other Payables</span><span>{formatCurrency(reportData.balanceSheet.liabilities.otherPayables)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontWeight: 700, background: '#F3F1EA', padding: '0.5rem', borderRadius: 8 }}>
                        <span>Total Liabilities</span><span>{formatCurrency(reportData.balanceSheet.liabilities.totalLiabilities)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.125rem', color: '#CB6843', borderTop: '2px solid #E2DFD4', paddingTop: '1rem' }}>
                        <span>Owner Capital</span><span>{formatCurrency(reportData.balanceSheet.capital)}</span>
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
