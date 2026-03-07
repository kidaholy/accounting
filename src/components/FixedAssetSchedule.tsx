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

  if (loading) return <div className="animate-fade-in" style={{ padding: '2rem' }}>Loading...</div>;

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Abebe Tigistu</h1>
          <h2>Schedule of Fixed Assets</h2>
          <p className="subtitle" style={{ margin: 0 }}>As of Sene 30/2017 E.C.</p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', overflowX: 'auto' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>1. Cost</h3>
        <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>Asset</th>
              <th style={{ textAlign: 'right', padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>01/11/2016 E.C. (Start)</th>
              <th style={{ textAlign: 'right', padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>Addition</th>
              <th style={{ textAlign: 'right', padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>30/10/2017 E.C. (Ending)</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset) => (
              <tr key={asset.id}>
                <td style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border)' }}>{asset.name}</td>
                <td style={{ padding: '0.5rem', borderBottom: '1px solid var(--glass-border)' }}>
                  <input 
                    type="number" 
                    className="form-input text-right" 
                    style={{ width: '100%', padding: '0.5rem' }}
                    value={asset.cost_beginning || ''} 
                    onChange={(e) => updateAsset(asset.id, 'cost_beginning', e.target.value)}
                  />
                </td>
                <td style={{ padding: '0.5rem', borderBottom: '1px solid var(--glass-border)' }}>
                  <input 
                    type="number" 
                    className="form-input text-right" 
                    style={{ width: '100%', padding: '0.5rem' }}
                    value={asset.addition || ''} 
                    onChange={(e) => updateAsset(asset.id, 'addition', e.target.value)}
                  />
                </td>
                <td className="text-right" style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)' }}>
                  {formatCurrency((asset.cost_beginning || 0) + (asset.addition || 0))}
                </td>
              </tr>
            ))}
            <tr className="totals-row">
              <td style={{ padding: '1rem' }}>TOTAL COST</td>
              <td className="text-right" style={{ padding: '1rem' }}>{formatCurrency(totals.cost_beginning)}</td>
              <td className="text-right" style={{ padding: '1rem' }}>{formatCurrency(totals.addition)}</td>
              <td className="text-right" style={{ padding: '1rem' }}>{formatCurrency(totals.costEnding)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', overflowX: 'auto' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>2. Depreciation</h3>
        <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>Asset (Straight Line)</th>
              <th style={{ textAlign: 'right', padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>01/11/2016 E.C. (Start)</th>
              <th style={{ textAlign: 'right', padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>Addition</th>
              <th style={{ textAlign: 'right', padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>30/10/2017 E.C. (Ending)</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset) => (
              <tr key={asset.id}>
                <td style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border)' }}>{asset.name} {(asset.dep_rate || 0.2) * 100}%</td>
                <td style={{ padding: '0.5rem', borderBottom: '1px solid var(--glass-border)' }}>
                  <input 
                    type="number" 
                    className="form-input text-right" 
                    style={{ width: '100%', padding: '0.5rem' }}
                    value={asset.dep_beginning || ''} 
                    onChange={(e) => updateAsset(asset.id, 'dep_beginning', e.target.value)}
                  />
                </td>
                <td style={{ padding: '0.5rem', borderBottom: '1px solid var(--glass-border)' }}>
                  <input 
                    type="number" 
                    className="form-input text-right" 
                    style={{ width: '100%', padding: '0.5rem' }}
                    value={asset.dep_addition || ''} 
                    onChange={(e) => updateAsset(asset.id, 'dep_addition', e.target.value)}
                  />
                </td>
                <td className="text-right" style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)' }}>
                  {formatCurrency((asset.dep_beginning || 0) + (asset.dep_addition || 0))}
                </td>
              </tr>
            ))}
            <tr className="totals-row">
              <td style={{ padding: '1rem' }}>TOTAL DEPRECIATION</td>
              <td className="text-right" style={{ padding: '1rem' }}>{formatCurrency(totals.dep_beginning)}</td>
              <td className="text-right" style={{ padding: '1rem' }}>{formatCurrency(totals.dep_addition)}</td>
              <td className="text-right" style={{ padding: '1rem' }}>{formatCurrency(totals.depEnding)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="summary-card highlight" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Net Book Value</h3>
          <p className="subtitle" style={{ margin: 0, marginTop: '0.25rem' }}>Ending Cost - Ending Depreciation</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="summary-value" style={{ margin: 0 }}>{formatCurrency(totals.nbvEnding)}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Started at: {formatCurrency(totals.nbvBeginning)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FixedAssetSchedule;
