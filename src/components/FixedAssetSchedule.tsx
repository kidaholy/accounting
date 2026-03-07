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

  if (loading) return <div className="animate-slide-up" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading schedule...</div>;

  return (
    <div className="animate-slide-up">
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)', fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          <span>📋</span> Schedule
        </div>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Fixed Assets Schedule</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Abebe Tigistu - Period ending Sene 30, 2017 E.C.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="card" style={{ background: 'var(--accent-soft)', border: 'none' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--accent-primary)', fontWeight: 600, marginBottom: '0.5rem' }}>Total Cost</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{formatCurrency(totals.costEnding)}</div>
        </div>
        <div className="card" style={{ background: '#ecfdf5', border: 'none' }}>
          <div style={{ fontSize: '0.875rem', color: '#059669', fontWeight: 600, marginBottom: '0.5rem' }}>Total Depreciation</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{formatCurrency(totals.depEnding)}</div>
        </div>
        <div className="card" style={{ background: '#fffbeb', border: 'none', gridColumn: 'span 2' }}>
          <div style={{ fontSize: '0.875rem', color: '#d97706', fontWeight: 600, marginBottom: '0.5rem' }}>Net Book Value</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{formatCurrency(totals.nbvEnding)}</div>
        </div>
      </div>

      <div style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>1. Cost Analysis</h3>
          <button className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>Export PDF</button>
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
                  <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--accent-primary)' }}>
                    {formatCurrency((asset.cost_beginning || 0) + (asset.addition || 0))}
                  </td>
                </tr>
              ))}
              <tr style={{ background: 'var(--bg-main)', borderTop: '2px solid var(--border-base)' }}>
                <td style={{ fontWeight: 800 }}>TOTAL COST</td>
                <td style={{ textAlign: 'right', fontWeight: 800 }}>{formatCurrency(totals.cost_beginning)}</td>
                <td style={{ textAlign: 'right', fontWeight: 800 }}>{formatCurrency(totals.addition)}</td>
                <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--accent-primary)' }}>{formatCurrency(totals.costEnding)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginBottom: '3rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.25rem' }}>2. Depreciation Schedule</h3>
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
                    <span className="badge badge-blue" style={{ marginLeft: '0.75rem' }}>{(asset.dep_rate || 0.2) * 100}%</span>
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
                  <td style={{ textAlign: 'right', fontWeight: 700, color: '#10b981' }}>
                    {formatCurrency((asset.dep_beginning || 0) + (asset.dep_addition || 0))}
                  </td>
                </tr>
              ))}
              <tr style={{ background: 'var(--bg-main)', borderTop: '2px solid var(--border-base)' }}>
                <td style={{ fontWeight: 800 }}>TOTAL DEPRECIATION</td>
                <td style={{ textAlign: 'right', fontWeight: 800 }}>{formatCurrency(totals.dep_beginning)}</td>
                <td style={{ textAlign: 'right', fontWeight: 800 }}>{formatCurrency(totals.dep_addition)}</td>
                <td style={{ textAlign: 'right', fontWeight: 800, color: '#10b981' }}>{formatCurrency(totals.depEnding)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FixedAssetSchedule;
