"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Trash2, X } from 'lucide-react';

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
  const [isAddingAsset, setIsAddingAsset] = useState(false);
  const [newAsset, setNewAsset] = useState({
    name: '',
    cost_beginning: 0,
    addition: 0,
    dep_rate: 0.20,
    dep_beginning: 0,
    dep_addition: 0
  });

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = () => {
    fetch('/api/assets')
      .then(res => res.json())
      .then(data => {
        setAssets(data);
        setLoading(false);
      })
      .catch(err => console.error('Failed to fetch assets:', err));
  };

  const addAsset = async () => {
    if (!newAsset.name) {
      alert('Please enter asset name');
      return;
    }

    try {
      const res = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAsset)
      });

      if (res.ok) {
        const created = await res.json();
        setAssets([...assets, created]);
        setNewAsset({
          name: '',
          cost_beginning: 0,
          addition: 0,
          dep_rate: 0.20,
          dep_beginning: 0,
          dep_addition: 0
        });
        setIsAddingAsset(false);
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to add asset');
      }
    } catch (err) {
      console.error('Failed to add asset:', err);
      alert('Failed to add asset');
    }
  };

  const deleteAsset = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const res = await fetch(`/api/assets/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setAssets(assets.filter(a => a.id !== id));
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to delete asset');
      }
    } catch (err) {
      console.error('Failed to delete asset:', err);
      alert('Failed to delete asset');
    }
  };

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
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={() => setIsAddingAsset(true)}
              className="btn" 
              style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Plus size={16} /> Add Asset
            </button>
            <button className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Export PDF</button>
          </div>
        </div>
        <div className="table-container">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Asset Description</th>
                <th style={{ textAlign: 'right' }}>Start (01/11/16)</th>
                <th style={{ textAlign: 'right' }}>Additions</th>
                <th style={{ textAlign: 'right' }}>Ending (30/10/17)</th>
                <th style={{ textAlign: 'center', width: '80px' }}>Actions</th>
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
                  <td style={{ textAlign: 'center' }}>
                    <button
                      onClick={() => deleteAsset(asset.id, asset.name)}
                      style={{ 
                        background: 'transparent', 
                        border: 'none', 
                        color: '#D94F3D', 
                        cursor: 'pointer',
                        padding: '0.25rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Delete asset"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              <tr style={{ background: '#F3F1EA', borderTop: '2px solid #E2DFD4' }}>
                <td style={{ fontWeight: 800, color: '#1A1A1A' }}>TOTAL COST</td>
                <td style={{ textAlign: 'right', fontWeight: 800 }}>{formatCurrency(totals.cost_beginning)}</td>
                <td style={{ textAlign: 'right', fontWeight: 800 }}>{formatCurrency(totals.addition)}</td>
                <td style={{ textAlign: 'right', fontWeight: 800, color: '#2A4A3E' }}>{formatCurrency(totals.costEnding)}</td>
                <td></td>
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
                <th style={{ textAlign: 'center', width: '80px' }}>Actions</th>
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
                  <td style={{ textAlign: 'center' }}>
                    <button
                      onClick={() => deleteAsset(asset.id, asset.name)}
                      style={{ 
                        background: 'transparent', 
                        border: 'none', 
                        color: '#D94F3D', 
                        cursor: 'pointer',
                        padding: '0.25rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Delete asset"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              <tr style={{ background: '#F3F1EA', borderTop: '2px solid #E2DFD4' }}>
                <td style={{ fontWeight: 800, color: '#1A1A1A' }}>TOTAL DEPRECIATION</td>
                <td style={{ textAlign: 'right', fontWeight: 800 }}>{formatCurrency(totals.dep_beginning)}</td>
                <td style={{ textAlign: 'right', fontWeight: 800 }}>{formatCurrency(totals.dep_addition)}</td>
                <td style={{ textAlign: 'right', fontWeight: 800, color: '#CB6843' }}>{formatCurrency(totals.depEnding)}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Asset Modal */}
      {isAddingAsset && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="animate-slide-up" style={{ background: 'white', borderRadius: 16, width: '100%', maxWidth: 600, padding: '2rem', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Add New Fixed Asset</h3>
              <button onClick={() => setIsAddingAsset(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#7A7A7A' }}>
                <X size={24} />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#3D3D3D', marginBottom: '0.5rem' }}>Asset Name</label>
                <input
                  type="text"
                  placeholder="e.g., Building, Furniture, Equipment"
                  value={newAsset.name}
                  onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 8, border: '1.5px solid #E2DFD4', outline: 'none' }}
                  autoFocus
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#3D3D3D', marginBottom: '0.5rem' }}>Beginning Cost (ETB)</label>
                  <input
                    type="number"
                    value={newAsset.cost_beginning || ''}
                    onChange={(e) => setNewAsset({ ...newAsset, cost_beginning: parseFloat(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 8, border: '1.5px solid #E2DFD4', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#3D3D3D', marginBottom: '0.5rem' }}>Addition (ETB)</label>
                  <input
                    type="number"
                    value={newAsset.addition || ''}
                    onChange={(e) => setNewAsset({ ...newAsset, addition: parseFloat(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 8, border: '1.5px solid #E2DFD4', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#3D3D3D', marginBottom: '0.5rem' }}>Depreciation Rate</label>
                <select
                  value={newAsset.dep_rate}
                  onChange={(e) => setNewAsset({ ...newAsset, dep_rate: parseFloat(e.target.value) })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 8, border: '1.5px solid #E2DFD4', outline: 'none', background: 'white' }}
                >
                  <option value={0.05}>5% - Buildings</option>
                  <option value={0.10}>10% - Furniture & Fixtures</option>
                  <option value={0.15}>15% - Vehicles</option>
                  <option value={0.20}>20% - Equipment (Default)</option>
                  <option value={0.25}>25% - Computers & Electronics</option>
                  <option value={0.30}>30% - Software</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#3D3D3D', marginBottom: '0.5rem' }}>Beginning Depreciation (ETB)</label>
                  <input
                    type="number"
                    value={newAsset.dep_beginning || ''}
                    onChange={(e) => setNewAsset({ ...newAsset, dep_beginning: parseFloat(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 8, border: '1.5px solid #E2DFD4', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#3D3D3D', marginBottom: '0.5rem' }}>Current Year Depreciation (ETB)</label>
                  <input
                    type="number"
                    value={newAsset.dep_addition || ''}
                    onChange={(e) => setNewAsset({ ...newAsset, dep_addition: parseFloat(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 8, border: '1.5px solid #E2DFD4', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button 
                  onClick={() => setIsAddingAsset(false)} 
                  className="btn-secondary" 
                  style={{ padding: '0.75rem 1.5rem' }}
                >
                  Cancel
                </button>
                <button 
                  onClick={addAsset} 
                  className="btn" 
                  style={{ padding: '0.75rem 1.5rem' }}
                >
                  Add Asset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FixedAssetSchedule;
