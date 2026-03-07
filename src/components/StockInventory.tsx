"use client";

import React, { useState, useMemo, useEffect } from 'react';

interface InventoryItem {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  unit_cost: number;
  isNew?: boolean;
}

const StockInventory = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/inventory')
      .then(res => res.json())
      .then(data => {
        setItems(data);
        setLoading(false);
      })
      .catch(err => console.error('Failed to fetch inventory:', err));
  }, []);

  const updateItem = async (id: string, field: keyof InventoryItem, value: string | number) => {
    // Optimistic UI update
    const updatedItems = items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    );
    setItems(updatedItems);

    const itemToUpdate = updatedItems.find(i => i.id === id);
    if (!itemToUpdate) return;

    try {
      if (itemToUpdate.isNew) return; // Wait until saved properly to update
      await fetch(`/api/inventory/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemToUpdate)
      });
    } catch (err) {
      console.error('Failed to update item:', err);
    }
  };

  const addItem = async () => {
    const tempId = `temp-${Date.now()}`;
    const newItemTemp: InventoryItem = { id: tempId, name: '', unit: '', quantity: 0, unit_cost: 0, isNew: true };
    setItems([...items, newItemTemp]);

    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Send a default name to bypass mongoose requirements, user immediately edits it
        body: JSON.stringify({ name: 'New Item', unit: '', quantity: 0, unit_cost: 0 })
      });
      const savedItem = await res.json();
      setItems(prev => prev.map(item => item.id === tempId ? { ...savedItem, isNew: false } : item));
    } catch (err) {
      console.error('Failed to add item:', err);
      setItems(prev => prev.filter(item => item.id !== tempId));
    }
  };

  const removeItem = async (id: string) => {
    const previousItems = [...items];
    setItems(items.filter(item => item.id !== id));

    try {
      await fetch(`/api/inventory/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete item:', err);
      // Revert if API fails
      setItems(previousItems);
    }
  };

  const totalCost = useMemo(() => {
    return items.reduce((acc, item) => acc + ((parseFloat(String(item.quantity)) || 0) * (parseFloat(String(item.unit_cost)) || 0)), 0);
  }, [items]);

  const format = (val: number) => new Intl.NumberFormat('en-ET', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);

  if (loading) return <div className="animate-fade-in" style={{ padding: '2rem' }}>Loading...</div>;

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Abebe Tigistu Butcher / Siga Bet</h1>
          <h2>Stock Inventory List</h2>
          <p className="subtitle" style={{ margin: 0 }}>As of Sene 30/2017 E.C.</p>
        </div>
        <button className="btn btn-primary" onClick={addItem}>
          + Add Item
        </button>
      </div>

      <div className="data-table-wrapper" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
        <table style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse', position: 'relative' }}>
          <thead style={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: 'var(--bg-secondary)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <tr>
              <th style={{ width: '50px', textAlign: 'center' }}>No</th>
              <th style={{ width: '250px' }}>Description</th>
              <th style={{ width: '100px' }}>Unit</th>
              <th style={{ width: '120px', textAlign: 'right' }}>Ending Inventory</th>
              <th style={{ width: '120px', textAlign: 'right' }}>Unit Cost</th>
              <th style={{ width: '120px', textAlign: 'right' }}>Total Cost</th>
              <th style={{ width: '50px', textAlign: 'center' }}></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              const itemTotal = (parseFloat(String(item.quantity)) || 0) * (parseFloat(String(item.unit_cost)) || 0);
              
              return (
                <tr key={item.id} style={{ backgroundColor: 'var(--bg-panel)' }}>
                  <td style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>{index + 1}</td>
                  <td style={{ padding: '0.5rem' }}>
                    <input 
                      type="text" 
                      className="form-input" 
                      style={{ width: '100%', padding: '0.5rem' }}
                      value={item.name} 
                      onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                      placeholder="Item name"
                    />
                  </td>
                  <td style={{ padding: '0.5rem' }}>
                    <input 
                      type="text" 
                      className="form-input" 
                      style={{ width: '100%', padding: '0.5rem' }}
                      value={item.unit} 
                      onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                      placeholder="e.g. cart"
                    />
                  </td>
                  <td style={{ padding: '0.5rem' }}>
                    <input 
                      type="number" 
                      className="form-input text-right" 
                      style={{ width: '100%', padding: '0.5rem' }}
                      value={item.quantity || ''} 
                      onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                    />
                  </td>
                  <td style={{ padding: '0.5rem' }}>
                    <input 
                      type="number" 
                      className="form-input text-right" 
                      style={{ width: '100%', padding: '0.5rem' }}
                      value={item.unit_cost || ''} 
                      onChange={(e) => updateItem(item.id, 'unit_cost', e.target.value)}
                    />
                  </td>
                  <td className="text-right" style={{ padding: '1rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                    {format(itemTotal)}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button 
                      onClick={() => removeItem(item.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '1.25rem' }}
                      title="Remove Item"
                    >
                      &times;
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot style={{ position: 'sticky', bottom: 0, zIndex: 1, backgroundColor: 'var(--bg-secondary)', boxShadow: '0 -2px 4px rgba(0,0,0,0.1)' }}>
            <tr className="totals-row">
              <td colSpan={5} style={{ padding: '1rem', textAlign: 'right', color: 'var(--text-secondary)' }}>TOTAL</td>
              <td className="text-right" style={{ padding: '1rem', fontSize: '1.25rem' }}>{format(totalCost)}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default StockInventory;
