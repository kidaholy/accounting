"use client";

import React, { useState, useEffect } from 'react';

export default function VatDeclaration() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [reconciliationError, setReconciliationError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVat() {
      try {
        const res = await fetch('/api/reports/financials');
        const json = await res.json();

        if (res.status === 400 && json.error?.includes('Reconciliation Error')) {
          setReconciliationError(json.error);
        } else if (json.success) {
          setData(json.data.vatDeclaration);
        }
      } catch (err) {
        console.error('Failed to fetch VAT:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchVat();
  }, []);

  const handleExportPDF = async () => {
    if (!data) return;
    setExporting(true);
    try {
      // First, we need to generate/save the report to get a reportId
      const genRes = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType: 'vat_declaration',
          period: {
            startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // Standard month range
            endDate: new Date()
          }
        })
      });
      const genJson = await genRes.json();

      if (genJson.success && genJson.data.reportId) {
        // Correct path based on directory structure: /api/reports/[id]/pdf
        window.open(`/api/reports/${genJson.data.reportId}/pdf`, '_blank');
      } else {
        alert('Failed to generate report for export');
      }
    } catch (err) {
      console.error('Export failed:', err);
      alert('Error during export');
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <div className="animate-slide-up" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Calculating VAT data...</div>;

  if (reconciliationError) {
    return (
      <div className="animate-slide-up" style={{ padding: '3rem 2rem', maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚖️</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#EF4444', marginBottom: '1rem' }}>VAT Declaration Locked</h2>
        <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '1.5rem', borderRadius: 12, border: '1px solid #FCA5A5', fontSize: '0.9375rem', lineHeight: 1.6, textAlign: 'left' }}>
          <p style={{ fontWeight: 700, marginBottom: '0.5rem' }}>System Halt: {reconciliationError}</p>
          <p>In accordance with strict Ethiopian accounting standards, VAT declarations cannot be generated while the books are unbalanced. The accounting equation (Assets = Liabilities + Equity + Net Income) must perfectly match.</p>
          <p style={{ marginTop: '0.75rem', fontWeight: 600 }}>Resolve the journal entry imbalances in Data Entry before proceeding with tax filings.</p>
        </div>
      </div>
    );
  }

  if (!data) return <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>Error loading data.</div>;

  const format = (val: number) => new Intl.NumberFormat('en-ET', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);

  return (
    <div className="animate-slide-up">
      <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#CB6843', marginBottom: '0.5rem' }}>📊 Tax Compliance • 2017 E.C.</div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#1A1A1A', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Value Added Tax (VAT) Return</h1>
          <p style={{ color: '#7A7A7A', fontSize: '0.9375rem' }}>Automated from General Ledger: <span style={{ background: 'rgba(42,74,62,0.1)', color: '#2A4A3E', padding: '0.125rem 0.75rem', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700 }}>15% VAT Standard</span></p>
        </div>
        <button
          onClick={handleExportPDF}
          disabled={exporting}
          style={{
            background: '#2A4A3E',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: 10,
            fontWeight: 700,
            border: 'none',
            cursor: exporting ? 'not-allowed' : 'pointer',
            opacity: exporting ? 0.7 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 12px rgba(42,74,62,0.2)'
          }}
        >
          {exporting ? 'Generating...' : '📥 Export to PDF'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
        <div style={{ background: 'white', border: '1.5px solid #E2DFD4', borderRadius: 14, padding: '1.75rem', borderTop: '4px solid #2A4A3E' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1A1A1A' }}>
            <span>⬆️</span> Output VAT (Sales)
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#7A7A7A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Base Sales (40000s series)</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#A8A8A8', fontSize: '0.8125rem', fontWeight: 700 }}>ETB</span>
                <input
                  type="text"
                  readOnly
                  style={{ width: '100%', padding: '0.8125rem 1rem 0.8125rem 3.5rem', borderRadius: 10, border: '1.5px solid #E2DFD4', background: '#F9F9F9', outline: 'none', fontWeight: 700, fontFamily: 'inherit', fontSize: '0.9375rem', color: '#7A7A7A' }}
                  value={format(data.baseSales)}
                />
              </div>
            </div>
          </div>

          <div style={{ marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid #E2DFD4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#7A7A7A' }}>Calculated Output VAT @ 15%</span>
            <span style={{ fontSize: '1.625rem', fontWeight: 800, color: '#2A4A3E' }}>{format(data.outputVat)}</span>
          </div>
        </div>

        <div style={{ background: 'white', border: '1.5px solid #E2DFD4', borderRadius: 14, padding: '1.75rem', borderTop: '4px solid #CB6843' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1A1A1A' }}>
            <span>⬇️</span> Input VAT (Purchases)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#7A7A7A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Base Purchases (50200 Series)</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#A8A8A8', fontSize: '0.8125rem', fontWeight: 700 }}>ETB</span>
                <input type="text" readOnly
                  style={{ width: '100%', padding: '0.8125rem 1rem 0.8125rem 3.5rem', borderRadius: 10, border: '1.5px solid #E2DFD4', background: '#F9F9F9', outline: 'none', fontWeight: 700, fontFamily: 'inherit', fontSize: '0.9375rem', color: '#7A7A7A' }}
                  value={format(data.basePurchases)} />
              </div>
            </div>
          </div>
          <div style={{ marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid #E2DFD4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#7A7A7A' }}>Calculated Input VAT @ 15%</span>
            <span style={{ fontSize: '1.625rem', fontWeight: 800, color: '#CB6843' }}>{format(data.inputVat)}</span>
          </div>
        </div>
      </div>

      <div style={{ background: '#2A4A3E', borderRadius: 16, color: 'white', textAlign: 'center', padding: '3rem', border: 'none', marginTop: '0.5rem' }}>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: '0.75rem', marginBottom: '1rem' }}>Final Tax Liability</p>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'rgba(255,255,255,0.8)', marginBottom: '0.75rem' }}>VAT Due to Authorities</h3>
        <div style={{ fontSize: '4rem', fontWeight: 900, color: '#CB6843', letterSpacing: '-0.03em', lineHeight: 1 }}>
          {format(data.netVatPayable)}
        </div>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.875rem', marginTop: '1rem' }}>Strictly Verified & Reconciled (ETB) — @15% Standard Rate</p>
      </div>
    </div>
  );
}
