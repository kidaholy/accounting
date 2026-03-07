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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)', fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          <span>📊</span> Tax Compliance
        </div>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>VAT Declaration</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Standard Rate: <span className="badge badge-blue">15% VAT</span></p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
        <div className="card" style={{ borderTop: '4px solid var(--accent-primary)' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: 'var(--accent-primary)' }}>⬆️</span> Output VAT (Sales)
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Taxable Sales / Supplies</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.875rem' }}>ETB</span>
                <input
                  name="taxable_sales"
                  type="number"
                  style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 3rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-base)', background: 'var(--bg-main)', outline: 'none', fontWeight: 600 }}
                  value={data.taxable_sales || ''}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Total Output VAT</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{format(outputVat)}</span>
          </div>
        </div>

        <div className="card" style={{ borderTop: '4px solid #10b981' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: '#10b981' }}>⬇️</span> Input VAT (Purchases)
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Local Purchases (Total)</label>
              <input
                name="local_purchases"
                type="number"
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-base)', background: 'var(--bg-main)', outline: 'none', fontWeight: 600 }}
                value={data.local_purchases || ''}
                onChange={handleChange}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Capital Assets Purchase</label>
              <input
                name="capital_assets"
                type="number"
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-base)', background: 'var(--bg-main)', outline: 'none', fontWeight: 600 }}
                value={data.capital_assets || ''}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Total Input VAT</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{format(totalInputVat)}</span>
          </div>
        </div>
      </div>

      <div className="card" style={{ background: 'var(--sidebar-bg)', color: 'white', textAlign: 'center', padding: '3rem', border: 'none' }}>
        <p style={{ color: 'var(--sidebar-text)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.75rem', marginBottom: '1rem' }}>Final Tax Liability</p>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>VAT Due to Authorities</h3>
        <div style={{ fontSize: '4rem', fontWeight: 900, color: '#4ade80', letterSpacing: '-0.02em' }}>
          {format(vatDue)}
        </div>
        <p style={{ color: 'var(--sidebar-text)', fontSize: '0.875rem', marginTop: '1rem' }}>Computation based on Ethiopian Tax Regulations (ETB)</p>
      </div>
    </div>
  );
};

export default VatDeclaration;
