"use client";

import React, { useState, useMemo, useEffect } from 'react';

interface InventoryItem {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  unit_cost: number;
  category?: string;
  isNew?: boolean;
}

const StockInventory = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [vatRate, setVatRate] = useState(15);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isAdding, setIsAdding] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [addingLoading, setAddingLoading] = useState(false);

  const [newItemForm, setNewItemForm] = useState({
    name: '',
    unit: 'pcs',
    quantity: 0,
    unit_cost: 0,
    category: ''
  });

  const [newCategoryForm, setNewCategoryForm] = useState({
    name: '',
    type: 'sale',
    hasVat: true
  });

  const fetchData = async () => {
    try {
      const [invData, catData] = await Promise.all([
        fetch('/api/inventory').then(res => res.json()),
        fetch('/api/setup/categories').then(res => res.json())
      ]);
      setItems(invData);
      if (catData.success) {
        setCategories(catData.data);
      }

      // Fetch VAT Rate
      const vatRes = await fetch('/api/settings/vat');
      const vatJson = await vatRes.json();
      if (vatJson.success) setVatRate(vatJson.vatRate);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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
      const res = await fetch(`/api/inventory/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemToUpdate)
      });
      if (!res.ok) throw new Error('Failed to update item via API');
    } catch (err) {
      console.error('Failed to update item:', err);
    }
  };

  const handleOpenAddModal = () => {
    setNewItemForm({ name: '', unit: 'pcs', quantity: 0, unit_cost: 0, category: '' });
    setIsAdding(true);
  };

  const handleOpenCategoryModal = () => {
    setNewCategoryForm({ name: '', type: 'sale', hasVat: true });
    setIsAddingCategory(true);
  };

  const submitNewItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemForm.name) return;

    setAddingLoading(true);
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newItemTemp: InventoryItem = {
      id: tempId,
      name: newItemForm.name,
      unit: newItemForm.unit,
      quantity: typeof newItemForm.quantity === 'string' ? parseFloat(newItemForm.quantity) : newItemForm.quantity,
      unit_cost: typeof newItemForm.unit_cost === 'string' ? parseFloat(newItemForm.unit_cost) : newItemForm.unit_cost,
      category: newItemForm.category,
      isNew: true
    };

    // Use functional state update to prevent array overwrites during rapid double clicks
    setItems(prev => [...prev, newItemTemp]);
    setIsAdding(false); // Close modal immediately for optimistic feel

    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItemForm)
      });
      if (!res.ok) throw new Error('API failed to create item');
      const savedItem = await res.json();
      setItems(prev => prev.map(item => item.id === tempId ? { ...item, ...savedItem, isNew: false } : item));
    } catch (err) {
      console.error('Failed to add item:', err);
      // Revert optimistic update
      setItems(prev => prev.filter(item => item.id !== tempId));
    } finally {
      setAddingLoading(false);
    }
  };

  const submitNewCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryForm.name) return;

    setAddingLoading(true);
    try {
      const res = await fetch('/api/setup/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategoryForm)
      });
      if (res.ok) {
        await fetchData();
        setIsAddingCategory(false);
      }
    } catch (err) {
      console.error('Failed to add category:', err);
    } finally {
      setAddingLoading(false);
    }
  }

  const removeItem = async (id: string) => {
    const previousItems = [...items];
    setItems(items.filter(item => item.id !== id));

    try {
      const res = await fetch(`/api/inventory/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete item via API');
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
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#CB6843', marginBottom: '0.5rem' }}>📦 Inventory</div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#1A1A1A', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Stock Management</h1>
          <p style={{ color: '#7A7A7A', fontSize: '0.9375rem' }}>Manage products and track real-time stock levels.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            style={{ background: 'white', color: '#2A4A3E', padding: '0.75rem 1.5rem', borderRadius: 10, border: '1.5px solid #2A4A3E', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'inherit', fontSize: '0.9375rem' }}
            onClick={handleOpenCategoryModal}
          >
            <span>+</span> Add Category
          </button>
          <button
            style={{ background: '#2A4A3E', color: 'white', padding: '0.75rem 1.5rem', borderRadius: 10, border: 'none', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'inherit', fontSize: '0.9375rem', boxShadow: '0 4px 12px rgba(42,74,62,0.25)' }}
            onClick={handleOpenAddModal}
          >
            <span>+</span> Add Product
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div style={{ background: 'rgba(42,74,62,0.08)', borderRadius: 14, padding: '1.5rem', borderLeft: '4px solid #2A4A3E' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#2A4A3E', marginBottom: '0.5rem' }}>Total Items</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1A1A1A' }}>{items.length}</div>
        </div>
        <div style={{ background: '#2A4A3E', borderRadius: 14, padding: '1.5rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem' }}>Total Inventory Value</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#CB6843' }}>{format(totalCost)} <span style={{ fontSize: '1rem', fontWeight: 600 }}>ETB</span></div>
        </div>
      </div>

      <div className="table-container">
        <table className="modern-table">
          <thead>
            <tr>
              <th style={{ width: '60px' }}>No.</th>
              <th>Description</th>
              <th style={{ width: '150px' }}>Category</th>
              <th style={{ width: '100px' }}>Unit</th>
              <th style={{ textAlign: 'right', width: '120px' }}>Quantity</th>
              <th style={{ textAlign: 'right', width: '120px' }}>Unit Cost</th>
              <th style={{ textAlign: 'right', width: '150px' }}>Subtotal</th>
              <th style={{ width: '80px', textAlign: 'center' }}>VAT</th>
              <th style={{ width: '80px', textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              const itemTotal = (parseFloat(String(item.quantity)) || 0) * (parseFloat(String(item.unit_cost)) || 0);

              return (
                <tr key={item.id}>
                  <td style={{ color: '#A8A8A8', fontWeight: 700, fontSize: '0.8125rem' }}>#{index + 1}</td>
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
                    <select
                      style={{ width: '100%', border: 'none', background: 'transparent', padding: '0.25rem', color: 'var(--text-secondary)', outline: 'none', fontWeight: 600 }}
                      value={item.category || ''}
                      onChange={(e) => updateItem(item.id, 'category', e.target.value)}
                    >
                      <option value="">Uncategorized</option>
                      {categories.map(cat => (
                        <option key={cat._id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
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
                  <td style={{ textAlign: 'right', fontWeight: 800, color: '#2A4A3E' }}>
                    {format(itemTotal)}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {(() => {
                      const cat = categories.find(c => c.name === item.category);
                      const hasVat = cat ? cat.hasVat !== false : true;
                      return (
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          padding: '0.2rem 0.4rem',
                          borderRadius: 4,
                          background: hasVat ? 'rgba(42,74,62,0.1)' : 'rgba(217,79,61,0.1)',
                          color: hasVat ? '#2A4A3E' : '#D94F3D'
                        }}>
                          {hasVat ? `${vatRate}%` : 'EXEMPT'}
                        </span>
                      );
                    })()}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      onClick={() => removeItem(item.id)}
                      style={{ padding: '0.375rem 0.75rem', color: '#D94F3D', background: 'rgba(217,79,61,0.08)', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.875rem', fontFamily: 'inherit', fontWeight: 700 }}
                      title="Delete Product"
                      disabled={item.isNew}
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              );
            })}
            {items.length === 0 && (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#7A7A7A' }}>No items in inventory. Click "Add Product" to begin.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '1.5rem', textAlign: 'right', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
        * All costs are inclusive of applicable taxes.
      </div>

      {/* Add Product Modal */}
      {isAdding && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="animate-slide-up" style={{
            background: 'white', borderRadius: 16, width: '100%', maxWidth: 500,
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
          }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #E2DFD4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1A1A1A' }}>Add New Product</h2>
              <button onClick={() => setIsAdding(false)} style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#A8A8A8' }}>×</button>
            </div>

            <form onSubmit={submitNewItem} style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 700, color: '#3D3D3D' }}>Product Name</label>
                  <input
                    type="text"
                    required
                    style={{ padding: '0.75rem', borderRadius: 8, border: '1.5px solid #E2DFD4', outline: 'none', fontFamily: 'inherit', width: '100%' }}
                    value={newItemForm.name}
                    onChange={e => setNewItemForm({ ...newItemForm, name: e.target.value })}
                    placeholder="e.g. Acme Widgets"
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 700, color: '#3D3D3D' }}>Category</label>
                  <select
                    style={{ padding: '0.75rem', borderRadius: 8, border: '1.5px solid #E2DFD4', outline: 'none', fontFamily: 'inherit', width: '100%' }}
                    value={newItemForm.category}
                    onChange={e => setNewItemForm({ ...newItemForm, category: e.target.value })}
                  >
                    <option value="">Select Category...</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 700, color: '#3D3D3D' }}>Unit of Measurement</label>
                  <input
                    type="text"
                    style={{ padding: '0.75rem', borderRadius: 8, border: '1.5px solid #E2DFD4', outline: 'none', fontFamily: 'inherit', width: '100%' }}
                    value={newItemForm.unit}
                    onChange={e => setNewItemForm({ ...newItemForm, unit: e.target.value })}
                    placeholder="e.g. pcs, kg, box"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 700, color: '#3D3D3D' }}>Initial Quantity</label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      style={{ padding: '0.75rem', borderRadius: 8, border: '1.5px solid #E2DFD4', outline: 'none', fontFamily: 'inherit', width: '100%' }}
                      value={newItemForm.quantity || ''}
                      onChange={e => setNewItemForm({ ...newItemForm, quantity: parseFloat(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 700, color: '#3D3D3D' }}>Unit Cost (ETB)</label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      style={{ padding: '0.75rem', borderRadius: 8, border: '1.5px solid #E2DFD4', outline: 'none', fontFamily: 'inherit', width: '100%' }}
                      value={newItemForm.unit_cost || ''}
                      onChange={e => setNewItemForm({ ...newItemForm, unit_cost: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  style={{ padding: '0.75rem 1.5rem', borderRadius: 8, border: '1.5px solid #E2DFD4', background: 'transparent', fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingLoading}
                  style={{ padding: '0.75rem 1.5rem', borderRadius: 8, border: 'none', background: '#2A4A3E', color: 'white', fontWeight: 700, cursor: addingLoading ? 'not-allowed' : 'pointer', opacity: addingLoading ? 0.7 : 1 }}
                >
                  {addingLoading ? 'Adding...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Add Category Modal */}
      {isAddingCategory && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001
        }}>
          <div className="animate-slide-up" style={{
            background: 'white', borderRadius: 16, width: '100%', maxWidth: 400,
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
          }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #E2DFD4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1A1A1A' }}>Add New Category</h2>
              <button onClick={() => setIsAddingCategory(false)} style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#A8A8A8' }}>×</button>
            </div>

            <form onSubmit={submitNewCategory} style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 700, color: '#3D3D3D' }}>Category Name</label>
                  <input
                    type="text"
                    required
                    style={{ padding: '0.75rem', borderRadius: 8, border: '1.5px solid #E2DFD4', outline: 'none', fontFamily: 'inherit', width: '100%' }}
                    value={newCategoryForm.name}
                    onChange={e => setNewCategoryForm({ ...newCategoryForm, name: e.target.value })}
                    placeholder="e.g. Beverages, Stationery"
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#F9F8F6', padding: '0.75rem', borderRadius: 8, border: '1px solid #E2DFD4' }}>
                  <input
                    type="checkbox"
                    id="catHasVat"
                    style={{ width: 18, height: 18, cursor: 'pointer' }}
                    checked={newCategoryForm.hasVat}
                    onChange={e => setNewCategoryForm({ ...newCategoryForm, hasVat: e.target.checked })}
                  />
                  <label htmlFor="catHasVat" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#3D3D3D', cursor: 'pointer' }}>
                    VAT Applicable for this Category
                  </label>
                </div>
              </div>

              <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setIsAddingCategory(false)}
                  style={{ padding: '0.75rem 1.5rem', borderRadius: 8, border: '1.5px solid #E2DFD4', background: 'transparent', fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingLoading}
                  style={{ padding: '0.75rem 1.5rem', borderRadius: 8, border: 'none', background: '#2A4A3E', color: 'white', fontWeight: 700, cursor: addingLoading ? 'not-allowed' : 'pointer', opacity: addingLoading ? 0.7 : 1 }}
                >
                  {addingLoading ? 'Adding...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockInventory;
