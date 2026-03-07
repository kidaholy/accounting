"use client";

import React, { useState, useEffect } from 'react';

interface VatData {
  id: string;
  taxable_sales: number;
  local_purchases: number;
  capital_assets: number;
  month_year: string;
}

const VatDeclaration = () => {
  const [data, setData] = useState<VatData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/vat')
      .then(res => res.json())
      .then(fetchedData => {
        setData(fetchedData);
        setLoading(false);
      })
      .catch(err => console.error('Failed to fetch VAT:', err));
  }, []);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value) || 0;

    if (!data) return;

    // Optimistic UI update
    const updatedData = { ...data, [name]: numValue };
    setData(updatedData);

    try {
      await fetch(`/api/vat/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
    } catch (err) {
      console.error('Failed to update VAT:', err);
    }
  };

  if (loading || !data) return <div className="animate-slide-up" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Calculating VAT data...</div>;

  const outputVat = data.taxable_sales * 0.15;
  const inputVat = data.local_purchases * 0.15;
  const capitalVat = data.capital_assets * 0.15;
  const totalInputVat = inputVat + capitalVat;
  const vatDue = outputVat - totalInputVat;

  const format = (val: number) => new Intl.NumberFormat('en-ET', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);

  return (
    <div className="animate-slide-up">
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#CB6843', marginBottom: '0.5rem' }}>📊 Tax Compliance</div>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#1A1A1A', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>VAT Declaration</h1>
        <p style={{ color: '#7A7A7A', fontSize: '0.9375rem' }}>Standard Rate: <span style={{ background: 'rgba(42,74,62,0.1)', color: '#2A4A3E', padding: '0.125rem 0.75rem', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700 }}>15% VAT</span></p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
        <div style={{ background: 'white', border: '1.5px solid #E2DFD4', borderRadius: 14, padding: '1.75rem', borderTop: '4px solid #2A4A3E' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1A1A1A' }}>
            <span>⬆️</span> Output VAT (Sales)
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#7A7A7A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Taxable Sales / Supplies</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#A8A8A8', fontSize: '0.8125rem', fontWeight: 700 }}>ETB</span>
                <input
                  name="taxable_sales"
                  type="number"
                  style={{ width: '100%', padding: '0.8125rem 1rem 0.8125rem 3.5rem', borderRadius: 10, border: '1.5px solid #E2DFD4', background: '#F3F1EA', outline: 'none', fontWeight: 700, fontFamily: 'inherit', fontSize: '0.9375rem' }}
                  value={data.taxable_sales || ''}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div style={{ marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid #E2DFD4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#7A7A7A' }}>Total Output VAT</span>
            <span style={{ fontSize: '1.625rem', fontWeight: 800, color: '#2A4A3E' }}>{format(outputVat)}</span>
          </div>
        </div>

        <div style={{ background: 'white', border: '1.5px solid #E2DFD4', borderRadius: 14, padding: '1.75rem', borderTop: '4px solid #CB6843' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1A1A1A' }}>
            <span>⬇️</span> Input VAT (Purchases)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#7A7A7A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Local Purchases (Total)</label>
              <input name="local_purchases" type="number"
                style={{ width: '100%', padding: '0.8125rem 1rem', borderRadius: 10, border: '1.5px solid #E2DFD4', background: '#F3F1EA', outline: 'none', fontWeight: 700, fontFamily: 'inherit', fontSize: '0.9375rem' }}
                value={data.local_purchases || ''} onChange={handleChange} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#7A7A7A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Capital Assets Purchase</label>
              <input name="capital_assets" type="number"
                style={{ width: '100%', padding: '0.8125rem 1rem', borderRadius: 10, border: '1.5px solid #E2DFD4', background: '#F3F1EA', outline: 'none', fontWeight: 700, fontFamily: 'inherit', fontSize: '0.9375rem' }}
                value={data.capital_assets || ''} onChange={handleChange} />
            </div>
          </div>
          <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #E2DFD4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#7A7A7A' }}>Total Input VAT</span>
            <span style={{ fontSize: '1.625rem', fontWeight: 800, color: '#CB6843' }}>{format(totalInputVat)}</span>
          </div>
        </div>
      </div>

      <div style={{ background: '#2A4A3E', borderRadius: 16, color: 'white', textAlign: 'center', padding: '3rem', border: 'none', marginTop: '0.5rem' }}>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: '0.75rem', marginBottom: '1rem' }}>Final Tax Liability</p>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'rgba(255,255,255,0.8)', marginBottom: '0.75rem' }}>VAT Due to Authorities</h3>
        <div style={{ fontSize: '4rem', fontWeight: 900, color: '#CB6843', letterSpacing: '-0.03em', lineHeight: 1 }}>
          {format(vatDue)}
        </div>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.875rem', marginTop: '1rem' }}>Ethiopian Tax Regulations (ETB) — @15% Standard Rate</p>
      </div>
    </div>
  );
};

export default VatDeclaration;
