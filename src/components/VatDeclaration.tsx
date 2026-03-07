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

  if (loading || !data) return <div className="animate-fade-in" style={{ padding: '2rem' }}>Loading...</div>;

  const outputVat = data.taxable_sales * 0.15;
  const inputVat = data.local_purchases * 0.15;
  // Capital asset input vat logic based on the image: 48690.60 * 15% = 7303.59. Let&apos;s use 15%.
  const capitalVat = data.capital_assets * 0.15; 
 
  
  const totalInputVat = inputVat + capitalVat;
  const vatDue = outputVat - totalInputVat;

  const format = (val: number) => new Intl.NumberFormat('en-ET', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>VAT Declaration</h1>
        <h2>Abebe Tigistu</h2>
        <p className="subtitle" style={{ margin: 0 }}>Values are computed at 15% standard VAT rate</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            Output VAT (Sales)
          </h3>
          <div className="form-group">
            <label className="form-label">Taxable Sales / Supplies (Total Amount)</label>
            <input 
              name="taxable_sales"
              type="number" 
              className="form-input" 
              value={data.taxable_sales || ''} 
              onChange={handleChange}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Total Output VAT (15%):</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>{format(outputVat)}</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            Input VAT (Purchases)
          </h3>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Local Purchases (Total Amount)</label>
            <input 
              name="local_purchases"
              type="number" 
              className="form-input" 
              value={data.local_purchases || ''} 
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Capital Assets Purchase (Total Amount)</label>
            <input 
              name="capital_assets"
              type="number" 
              className="form-input" 
              value={data.capital_assets || ''} 
              onChange={handleChange}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Total Input VAT (15%):</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>{format(totalInputVat)}</span>
          </div>
        </div>
      </div>

      <div className="summary-card highlight" style={{ textAlign: 'center' }}>
        <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>VAT Due for Month</h3>
        <p className="subtitle" style={{ margin: 0 }}>Output VAT - Total Input VAT</p>
        <div className="summary-value" style={{ fontSize: '3rem', marginTop: '1rem' }}>
          {format(vatDue)}
        </div>
      </div>
    </div>
  );
};

export default VatDeclaration;
