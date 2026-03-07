"use client";

import { useState, useEffect } from 'react';

interface DataEntryProps {
    fixedType?: 'sale' | 'purchase' | 'expense';
    fixedCategory?: string;
}

export default function DataEntry({ fixedType, fixedCategory }: DataEntryProps = {}) {
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [categories, setCategories] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [inventoryItems, setInventoryItems] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        type: fixedType || 'sale',
        amount: '',
        vatAmount: '',
        category: fixedCategory || '',
        description: '',
        date: new Date().toISOString().split('T')[0] // Default to today
    });

    useEffect(() => {
        async function fetchData() {
            try {
                const [catRes, prodRes, invRes] = await Promise.all([
                    fetch('/api/setup/categories'),
                    fetch('/api/setup/products'),
                    fetch('/api/inventory')
                ]);
                const catJson = await catRes.json();
                const prodJson = await prodRes.json();
                const invJson = await invRes.json();

                if (catJson.success) setCategories(catJson.data);
                if (prodJson.success) setProducts(prodJson.data);
                if (Array.isArray(invJson)) setInventoryItems(invJson);

                // Set initial category if available
                if (catJson.success && catJson.data.length > 0) {
                    const firstSafe = catJson.data.find((c: any) => c.type === 'sale');
                    if (firstSafe) setFormData(prev => ({ ...prev, category: firstSafe.name }));
                }
            } catch (err) {
                console.error('Failed to fetch categories/products/inventory:', err);
            }
        }
        fetchData();
    }, []);

    const getAccountCode = (categoryName: string): number => {
        const cat = categories.find(c => c.name === categoryName);
        if (cat && cat.accountCode) return cat.accountCode;

        // Fallback to existing logic for legacy/default mapping
        const mapping: Record<string, number> = {
            'Food Sales': 40000,
            'Beverage Sales': 40100,
            'Other Service': 40200,
            'Raw Materials': 50200,
            'Non-taxable Material': 50201,
            'Inventory': 50200,
            'Packaging': 50200,
            'Rent': 50100,
            'Utilities': 50101,
            'Payroll': 50102,
            'Marketing': 50103,
        };
        return mapping[categoryName] || (formData.type === 'sale' ? 40000 : 50100);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSuccessMsg('');

        try {
            const res = await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: formData.type,
                    amount: Number(formData.amount),
                    vatAmount: formData.vatAmount ? Number(formData.vatAmount) : 0,
                    category: formData.category,
                    accountCode: getAccountCode(formData.category),
                    description: formData.description,
                    date: new Date(formData.date)
                })
            });

            if (res.ok) {
                setSuccessMsg('Transaction recorded successfully!');
                setFormData({ ...formData, amount: '', vatAmount: '', description: '' });
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to record transaction');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newType = e.target.value as 'sale' | 'purchase' | 'expense';
        const firstCat = categories.find(c => c.type === newType);
        setFormData({ ...formData, type: newType, category: firstCat ? firstCat.name : '' });
    };

    return (
        <div className="card" style={{ maxWidth: 600, margin: '0 auto', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1A1A1A', marginBottom: '1.5rem' }}>
                Record New Transaction
            </h2>

            {successMsg && (
                <div style={{ padding: '1rem', background: '#D1FAE5', color: '#065F46', borderRadius: 8, marginBottom: '1.5rem', fontWeight: 600 }}>
                    ✓ {successMsg}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#3D3D3D', marginBottom: '0.5rem' }}>Date</label>
                        <input
                            type="date"
                            required
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: 8, border: '1.5px solid #E2DFD4', outline: 'none', background: '#F9F8F6' }}
                        />
                    </div>
                    {!fixedType && (
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#3D3D3D', marginBottom: '0.5rem' }}>Transaction Type</label>
                            <select
                                value={formData.type}
                                onChange={handleTypeChange}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: 8, border: '1.5px solid #E2DFD4', background: '#F9F8F6', outline: 'none' }}
                            >
                                <option value="sale">Sale / Revenue</option>
                                <option value="purchase">Purchase (Inventory/Assets)</option>
                                <option value="expense">Operating Expense</option>
                            </select>
                        </div>
                    )}
                </div>

                <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#3D3D3D', marginBottom: '0.5rem' }}>Category</label>
                    <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: 8, border: '1.5px solid #E2DFD4', background: '#F9F8F6', outline: 'none' }}
                        required
                    >
                        <option value="">Select Category</option>
                        {categories.filter(c => c.type === formData.type).map(cat => (
                            <option key={cat._id} value={cat.name}>{cat.name}</option>
                        ))}
                        {/* Fallback legacy defaults if no dynamic categories exist yet */}
                        {categories.filter(c => c.type === formData.type).length === 0 && (
                            <>
                                {formData.type === 'sale' && (
                                    <>
                                        <option value="Food Sales">Food Sales</option>
                                        <option value="Beverage Sales">Beverage Sales</option>
                                        <option value="Other Service">Other Service Revenue</option>
                                    </>
                                )}
                                {formData.type === 'purchase' && (
                                    <>
                                        <option value="Raw Materials">Raw Materials (Meat, Veg)</option>
                                        <option value="Non-taxable Material">Non-taxable Material (Water, etc.)</option>
                                        <option value="Inventory">Inventory (Bottled Drinks)</option>
                                        <option value="Packaging">Packaging Supplies</option>
                                    </>
                                )}
                                {formData.type === 'expense' && (
                                    <>
                                        <option value="Rent">Rent</option>
                                        <option value="Utilities">Utilities (Water & Electricity)</option>
                                        <option value="Payroll">Payroll / Salaries</option>
                                        <option value="Marketing">Marketing</option>
                                    </>
                                )}
                            </>
                        )}
                    </select>
                </div>

                {(products.filter(p => p.type === formData.type).length > 0 || (formData.type === 'sale' && inventoryItems.length > 0)) && (
                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#3D3D3D', marginBottom: '0.5rem' }}>Select Item (Standard or Inventory)</label>
                        <select
                            onChange={(e) => {
                                const val = e.target.value;
                                if (!val) return;

                                // Check if it's an inventory item
                                const invItem = inventoryItems.find(i => i.id === val || i.name === val);
                                if (invItem) {
                                    setFormData({
                                        ...formData,
                                        description: invItem.name,
                                        amount: invItem.unit_cost ? invItem.unit_cost.toString() : formData.amount
                                    });
                                } else {
                                    setFormData({ ...formData, description: val });
                                }
                            }}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: 8, border: '1.5px solid #E2DFD4', background: '#F9F8F6', outline: 'none' }}
                        >
                            <option value="">Select Product...</option>
                            {/* Standard Products */}
                            <optgroup label="Standard Products">
                                {products.filter(p => p.type === formData.type).map(prod => (
                                    <option key={prod._id} value={prod.name}>{prod.name}</option>
                                ))}
                            </optgroup>
                            {/* Inventory Items (for Sales) */}
                            {formData.type === 'sale' && inventoryItems.length > 0 && (
                                <optgroup label="Items from Stock Management">
                                    {inventoryItems.map(item => (
                                        <option key={item.id} value={item.id}>{item.name} ({item.quantity} {item.unit} available)</option>
                                    ))}
                                </optgroup>
                            )}
                        </select>
                    </div>
                )}

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#3D3D3D', marginBottom: '0.5rem' }}>Amount (ETB)</label>
                        <input
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            placeholder="e.g. 5000"
                            style={{ width: '100%', padding: '0.75rem', borderRadius: 8, border: '1.5px solid #E2DFD4', outline: 'none' }}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#3D3D3D', marginBottom: '0.5rem' }}>VAT Amount (ETB)</label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.vatAmount}
                            onChange={(e) => setFormData({ ...formData, vatAmount: e.target.value })}
                            placeholder="15% if applicable"
                            style={{ width: '100%', padding: '0.75rem', borderRadius: 8, border: '1.5px solid #E2DFD4', outline: 'none' }}
                        />
                    </div>
                </div>

                <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#3D3D3D', marginBottom: '0.5rem' }}>Description / Note</label>
                    <input
                        type="text"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="e.g. Weekly meat supply from Supplier X"
                        style={{ width: '100%', padding: '0.75rem', borderRadius: 8, border: '1.5px solid #E2DFD4', outline: 'none' }}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="btn"
                    style={{ width: '100%', padding: '1rem', marginTop: '1rem', fontSize: '1rem', display: 'flex', justifyContent: 'center' }}
                >
                    {loading ? 'Processing...' : 'Record Transaction'}
                </button>
            </form>
        </div>
    );
}
