"use client";

import React, { useState, useMemo, useEffect } from 'react';

interface Asset {
  id: string;
  name: string;
  cost_beginning: number;
  addition: number;
  dep_rate: number;
  dep_beginning: number;
  dep_addition: number;
}

interface Totals {
  cost_beginning: number;
  addition: number;
  costEnding: number;
  dep_beginning: number;
  dep_addition: number;
  depEnding: number;
  nbvBeginning: number;
  nbvEnding: number;
}

const FixedAssetSchedule = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/assets')
      .then(res => res.json())
      .then(data => {
        setAssets(data);
        setLoading(false);
      })
      .catch(err => console.error('Failed to fetch assets:', err));
  }, []);

  const updateAsset = async (id: string, field: keyof Asset, value: string) => {
    const numValue = parseFloat(value) || 0;

    // Optimistic UI update
    const updatedAssets = assets.map(asset =>
      asset.id === id ? { ...asset, [field]: numValue } : asset
    );
    setAssets(updatedAssets);

    const assetToUpdate = updatedAssets.find(a => a.id === id);
    if (!assetToUpdate) return;

    try {
      await fetch(`/api/assets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assetToUpdate)
      });
    } catch (err) {
      console.error('Failed to update asset:', err);
    }
  };

  const totals = useMemo<Totals>(() => {
    return assets.reduce((acc, asset) => {
      const costEnding = (asset.cost_beginning || 0) + (asset.addition || 0);
      const depEnding = (asset.dep_beginning || 0) + (asset.dep_addition || 0);

      return {
        cost_beginning: acc.cost_beginning + (asset.cost_beginning || 0),
        addition: acc.addition + (asset.addition || 0),
        costEnding: acc.costEnding + costEnding,
        dep_beginning: acc.dep_beginning + (asset.dep_beginning || 0),
        dep_addition: acc.dep_addition + (asset.dep_addition || 0),
        depEnding: acc.depEnding + depEnding,
        nbvBeginning: acc.nbvBeginning + ((asset.cost_beginning || 0) - (asset.dep_beginning || 0)),
        nbvEnding: acc.nbvEnding + (costEnding - depEnding)
      };
    }, {
      cost_beginning: 0, addition: 0, costEnding: 0,
      dep_beginning: 0, dep_addition: 0, depEnding: 0,
      nbvBeginning: 0, nbvEnding: 0
    });
  }, [assets]);

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-ET', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: '#7A7A7A', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Loading schedule…</div>;

  return (
    <div className="animate-slide-up">
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#CB6843', marginBottom: '0.5rem' }}>📋 Schedule</div>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#1A1A1A', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Fixed Assets Schedule</h1>
        <p style={{ color: '#7A7A7A', fontSize: '0.9375rem' }}>Period ending Sene 30, 2017 E.C.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div style={{ background: 'rgba(42,74,62,0.08)', borderRadius: 14, padding: '1.5rem', borderLeft: '4px solid #2A4A3E' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#2A4A3E', marginBottom: '0.5rem' }}>Total Cost</div>
          <div style={{ fontSize: '1.625rem', fontWeight: 800, color: '#1A1A1A' }}>{formatCurrency(totals.costEnding)}</div>
        </div>
        <div style={{ background: 'rgba(203,104,67,0.08)', borderRadius: 14, padding: '1.5rem', borderLeft: '4px solid #CB6843' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#CB6843', marginBottom: '0.5rem' }}>Total Depreciation</div>
          <div style={{ fontSize: '1.625rem', fontWeight: 800, color: '#1A1A1A' }}>{formatCurrency(totals.depEnding)}</div>
        </div>
        <div style={{ background: '#2A4A3E', borderRadius: 14, padding: '1.5rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem' }}>Net Book Value</div>
          <div style={{ fontSize: '1.625rem', fontWeight: 800, color: '#CB6843' }}>{formatCurrency(totals.nbvEnding)}</div>
        </div>
      </div>

      <div style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#1A1A1A' }}>1. Cost Analysis</h3>
          <button className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Export PDF</button>
        </div>
        <div className="table-container">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Asset Description</th>
                <th style={{ textAlign: 'right' }}>Start (01/11/16)</th>
                <th style={{ textAlign: 'right' }}>Additions</th>
                <th style={{ textAlign: 'right' }}>Ending (30/10/17)</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => (
                <tr key={asset.id}>
                  <td style={{ fontWeight: 600 }}>{asset.name}</td>
                  <td style={{ textAlign: 'right' }}>
                    <input
                      type="number"
                      className="form-input"
                      style={{ width: '120px', textAlign: 'right', border: 'none', background: 'transparent', padding: '0.25rem', borderBottom: '1px dashed var(--border-base)' }}
                      value={asset.cost_beginning || ''}
                      onChange={(e) => updateAsset(asset.id, 'cost_beginning', e.target.value)}
                    />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <input
                      type="number"
                      className="form-input"
                      style={{ width: '120px', textAlign: 'right', border: 'none', background: 'transparent', padding: '0.25rem', borderBottom: '1px dashed var(--border-base)' }}
                      value={asset.addition || ''}
                      onChange={(e) => updateAsset(asset.id, 'addition', e.target.value)}
                    />
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: '#2A4A3E' }}>
                    {formatCurrency((asset.cost_beginning || 0) + (asset.addition || 0))}
                  </td>
                </tr>
              ))}
              <tr style={{ background: '#F3F1EA', borderTop: '2px solid #E2DFD4' }}>
                <td style={{ fontWeight: 800, color: '#1A1A1A' }}>TOTAL COST</td>
                <td style={{ textAlign: 'right', fontWeight: 800 }}>{formatCurrency(totals.cost_beginning)}</td>
                <td style={{ textAlign: 'right', fontWeight: 800 }}>{formatCurrency(totals.addition)}</td>
                <td style={{ textAlign: 'right', fontWeight: 800, color: '#2A4A3E' }}>{formatCurrency(totals.costEnding)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginBottom: '3rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#1A1A1A', marginBottom: '1.25rem' }}>2. Depreciation Schedule</h3>
        <div className="table-container">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Asset Category (Rate)</th>
                <th style={{ textAlign: 'right' }}>Accum. Dep (Start)</th>
                <th style={{ textAlign: 'right' }}>Current Year Dep</th>
                <th style={{ textAlign: 'right' }}>Accum. Dep (End)</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => (
                <tr key={asset.id}>
                  <td style={{ fontWeight: 600 }}>
                    {asset.name}
                    <span style={{ marginLeft: '0.75rem', background: 'rgba(42,74,62,0.1)', color: '#2A4A3E', padding: '0.125rem 0.5rem', borderRadius: 999, fontSize: '0.7rem', fontWeight: 700 }}>{(asset.dep_rate || 0.2) * 100}%</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <input
                      type="number"
                      className="form-input"
                      style={{ width: '120px', textAlign: 'right', border: 'none', background: 'transparent', padding: '0.25rem', borderBottom: '1px dashed var(--border-base)' }}
                      value={asset.dep_beginning || ''}
                      onChange={(e) => updateAsset(asset.id, 'dep_beginning', e.target.value)}
                    />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <input
                      type="number"
                      className="form-input"
                      style={{ width: '120px', textAlign: 'right', border: 'none', background: 'transparent', padding: '0.25rem', borderBottom: '1px dashed var(--border-base)' }}
                      value={asset.dep_addition || ''}
                      onChange={(e) => updateAsset(asset.id, 'dep_addition', e.target.value)}
                    />
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: '#CB6843' }}>
                    {formatCurrency((asset.dep_beginning || 0) + (asset.dep_addition || 0))}
                  </td>
                </tr>
              ))}
              <tr style={{ background: '#F3F1EA', borderTop: '2px solid #E2DFD4' }}>
                <td style={{ fontWeight: 800, color: '#1A1A1A' }}>TOTAL DEPRECIATION</td>
                <td style={{ textAlign: 'right', fontWeight: 800 }}>{formatCurrency(totals.dep_beginning)}</td>
                <td style={{ textAlign: 'right', fontWeight: 800 }}>{formatCurrency(totals.dep_addition)}</td>
                <td style={{ textAlign: 'right', fontWeight: 800, color: '#CB6843' }}>{formatCurrency(totals.depEnding)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FixedAssetSchedule;
