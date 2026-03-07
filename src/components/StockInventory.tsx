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
        body: JSON.stringify({ name: 'New Item', unit: 'pcs', quantity: 0, unit_cost: 0 })
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
      setItems(previousItems);
    }
  };

  const totalCost = useMemo(() => {
    return items.reduce((acc, item) => acc + ((parseFloat(String(item.quantity)) || 0) * (parseFloat(String(item.unit_cost)) || 0)), 0);
  }, [items]);

  const format = (val: number) => new Intl.NumberFormat('en-ET', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);

  if (loading) return <div className="animate-slide-up" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading inventory...</div>;

  return (
    <div className="animate-slide-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b', fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            <span>📦</span> Inventory
          </div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Stock Management</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Manage products and track real-time stock levels.</p>
        </div>
        <button className="btn btn-primary" onClick={addItem}>
          <span>+</span> Add New Product
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.5rem' }}>Total Items</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{items.length}</div>
        </div>
        <div className="card" style={{ borderLeft: '4px solid var(--accent-primary)', gridColumn: 'span 2' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.5rem' }}>Total Inventory Value</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-primary)' }}>{format(totalCost)} ETB</div>
        </div>
      </div>

      <div className="table-container">
        <table className="modern-table">
          <thead>
            <tr>
              <th style={{ width: '80px' }}>No.</th>
              <th>Description</th>
              <th style={{ width: '120px' }}>Unit</th>
              <th style={{ textAlign: 'right', width: '150px' }}>Quantity</th>
              <th style={{ textAlign: 'right', width: '150px' }}>Unit Cost</th>
              <th style={{ textAlign: 'right', width: '180px' }}>Subtotal</th>
              <th style={{ width: '80px', textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              const itemTotal = (parseFloat(String(item.quantity)) || 0) * (parseFloat(String(item.unit_cost)) || 0);

              return (
                <tr key={item.id}>
                  <td style={{ color: 'var(--text-muted)', fontWeight: 600 }}>#{index + 1}</td>
                  <td>
                    <input
                      type="text"
                      style={{ width: '100%', border: 'none', background: 'transparent', padding: '0.25rem', fontWeight: 700, outline: 'none', color: 'var(--text-primary)' }}
                      value={item.name}
                      onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                      placeholder="Item name..."
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      style={{ width: '100%', border: 'none', background: 'transparent', padding: '0.25rem', color: 'var(--text-secondary)', outline: 'none' }}
                      value={item.unit}
                      onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                      placeholder="e.g kg"
                    />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <input
                      type="number"
                      style={{ width: '80px', textAlign: 'right', border: 'none', background: 'transparent', padding: '0.25rem', fontWeight: 600, outline: 'none' }}
                      value={item.quantity || ''}
                      onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                    />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <input
                      type="number"
                      style={{ width: '100px', textAlign: 'right', border: 'none', background: 'transparent', padding: '0.25rem', fontWeight: 600, outline: 'none' }}
                      value={item.unit_cost || ''}
                      onChange={(e) => updateItem(item.id, 'unit_cost', e.target.value)}
                    />
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--accent-primary)' }}>
                    {format(itemTotal)}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="btn"
                      style={{ padding: '0.5rem', color: 'var(--danger)', background: 'transparent' }}
                      title="Delete Product"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '1.5rem', textAlign: 'right', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
        * All costs are inclusive of applicable taxes.
      </div>
    </div>
  );
};

export default StockInventory;
