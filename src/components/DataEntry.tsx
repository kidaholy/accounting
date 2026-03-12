"use client";

import { useState, useEffect } from 'react';
import { Plus, Settings, Trash2, X } from 'lucide-react';

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

    // Category Management State
    const [isManagingCats, setIsManagingCats] = useState(false);
    const [isAddingCat, setIsAddingCat] = useState(false);
    const [newCatName, setNewCatName] = useState('');
    const [newCatVatApplicable, setNewCatVatApplicable] = useState(true);

    const [formData, setFormData] = useState({
        type: fixedType || 'sale',
        amount: '',
        vatAmount: '',
        category: fixedCategory || '',
        description: '',
        date: new Date().toISOString().split('T')[0], // Default to today
        qty: 1,
        unitPrice: 0,
        isVatEnabled: true // Toggle for this specific transaction
    });
    const [vatRate, setVatRate] = useState(15);

    const fetchData = async () => {
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

            // Fetch VAT Rate
            const vatRes = await fetch('/api/settings/vat');
            const vatJson = await vatRes.json();
            if (vatJson.success) setVatRate(vatJson.vatRate);

            // Set initial category if available and not fixed
            if (!fixedCategory && catJson.success && catJson.data.length > 0) {
                const filtered = catJson.data.filter((c: any) => c.type === (fixedType || formData.type));
                if (filtered.length > 0 && !formData.category) {
                    setFormData(prev => ({ ...prev, category: filtered[0].name }));
                }
            }
        } catch (err) {
            console.error('Failed to fetch categories/products/inventory:', err);
        }
    };

    useEffect(() => {
        fetchData();
    }, [fixedType, fixedCategory]);

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCatName) return;
        try {
            const res = await fetch('/api/setup/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newCatName,
                    type: fixedType || formData.type,
                    hasVat: newCatVatApplicable
                })
            });
            if (res.ok) {
                setNewCatName('');
                setIsAddingCat(false);
                await fetchData();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteCategory = async (id: string) => {
        if (!confirm('Are you sure you want to delete this category?')) return;
        try {
            const res = await fetch(`/api/setup/categories?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                await fetchData();
            }
        } catch (err) {
            console.error(err);
        }
    };

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
        return mapping[categoryName] || (formData.type === 'sale' ? 40000 : (formData.type === 'purchase' ? 50200 : 50100));
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
                    vatAmount: formData.isVatEnabled ? (formData.vatAmount ? Number(formData.vatAmount) : 0) : 0,
                    category: formData.category,
                    accountCode: getAccountCode(formData.category),
                    description: formData.description,
                    quantity: Number(formData.qty),
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
        setFormData({
            ...formData,
            type: newType,
            category: firstCat ? firstCat.name : '',
            qty: 1,
            unitPrice: 0,
            amount: '',
            vatAmount: ''
        });
    };

    // Auto-calculate amount when qty or unitPrice changes
    useEffect(() => {
        if (formData.qty && formData.unitPrice) {
            const total = formData.qty * formData.unitPrice;
            const vat = formData.isVatEnabled ? total * (vatRate / 100) : 0;
            setFormData(prev => ({
                ...prev,
                amount: total.toFixed(2),
                vatAmount: vat.toFixed(2)
            }));
        }
    }, [formData.qty, formData.unitPrice, vatRate, formData.isVatEnabled]);

    // Also auto-recalculate VAT if the total amount is edited manually
    useEffect(() => {
        const amountNum = parseFloat(formData.amount);
        if (!isNaN(amountNum)) {
            const vat = formData.isVatEnabled ? amountNum * (vatRate / 100) : 0;
            setFormData(prev => ({
                ...prev,
                vatAmount: vat.toFixed(2)
            }));
        }
    }, [formData.amount, vatRate, formData.isVatEnabled]);

    useEffect(() => {
        if (formData.category && categories.length > 0) {
            const cat = categories.find(c => c.name === formData.category && c.type === formData.type);
            // Default to true if not found or not specified, but stay false if explicitly false
            const shouldBeEnabled = cat ? cat.hasVat !== false : true;
            if (formData.isVatEnabled !== shouldBeEnabled) {
                setFormData(prev => ({ ...prev, isVatEnabled: shouldBeEnabled }));
            }
        }
    }, [formData.category, formData.type, categories]);

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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#3D3D3D' }}>Category</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                                type="button"
                                onClick={() => setIsAddingCat(true)}
                                style={{ fontSize: '0.75rem', color: '#2A4A3E', background: 'rgba(42,74,62,0.1)', border: 'none', padding: '0.2rem 0.5rem', borderRadius: 4, cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                            >
                                <Plus size={12} /> Add
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsManagingCats(true)}
                                style={{ fontSize: '0.75rem', color: '#7A7A7A', background: '#F3F1EA', border: 'none', padding: '0.2rem 0.5rem', borderRadius: 4, cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                            >
                                <Settings size={12} /> Manage
                            </button>
                        </div>
                    </div>
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
                        {categories.filter(c => c.type === formData.type).length === 0 && (
                            <option disabled value="">No categories found. Click 'Add' to create one.</option>
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
                                    // Try to find matching product for category automation
                                    const matchingProd = products.find(p => p.name === invItem.name);
                                    let autoCat = formData.category;
                                    if (matchingProd) {
                                        const prodCat = categories.find(c => c._id === matchingProd.category);
                                        if (prodCat) autoCat = prodCat.name;
                                    }

                                    setFormData({
                                        ...formData,
                                        description: invItem.name,
                                        unitPrice: invItem.unit_cost || 0,
                                        qty: 1,
                                        category: autoCat
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
                                <>
                                    {/* Group items by category */}
                                    {Object.entries(
                                        inventoryItems.reduce((acc: any, item: any) => {
                                            const cat = item.category || 'Uncategorized';
                                            if (!acc[cat]) acc[cat] = [];
                                            acc[cat].push(item);
                                            return acc;
                                        }, {})
                                    ).map(([category, items]: [string, any]) => (
                                        <optgroup key={category} label={`Stock: ${category}`}>
                                            {items.map((item: any) => (
                                                <option key={item.id} value={item.id}>{item.name} ({item.quantity} {item.unit} available)</option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </>
                            )}
                        </select>
                    </div>
                )}

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#3D3D3D', marginBottom: '0.5rem' }}>Quantity</label>
                        <input
                            type="number"
                            required
                            min="1"
                            value={formData.qty}
                            onChange={(e) => setFormData({ ...formData, qty: parseFloat(e.target.value) || 0 })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: 8, border: '1.5px solid #E2DFD4', outline: 'none', background: '#F9F8F6' }}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#3D3D3D', marginBottom: '0.5rem' }}>Unit Price (ETB)</label>
                        <input
                            type="number"
                            required
                            min="0"
                            value={formData.unitPrice}
                            onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: 8, border: '1.5px solid #E2DFD4', outline: 'none', background: '#F9F8F6' }}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#3D3D3D', marginBottom: '0.5rem' }}>Total Amount (ETB)</label>
                        <input
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: 8, border: '1.5px solid #E2DFD4', outline: 'none', background: '#F9F8F6', fontWeight: 700 }}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#3D3D3D', marginBottom: '0.5rem' }}>VAT Amount (ETB)</label>
                        <input
                            type="number"
                            readOnly
                            value={formData.vatAmount}
                            placeholder={formData.isVatEnabled ? `${vatRate}% (Auto)` : '0.00 (Disabled)'}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: 8,
                                border: '1.5px solid #E2DFD4',
                                outline: 'none',
                                background: formData.isVatEnabled ? '#F3F4F1' : '#F9F8F6',
                                color: formData.isVatEnabled ? '#1A1A1A' : '#A8A8A8',
                                cursor: 'not-allowed',
                                fontWeight: 700
                            }}
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

            {/* Add Category UI */}
            {isAddingCat && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="animate-slide-up" style={{ background: 'white', borderRadius: 16, width: '100%', maxWidth: 400, padding: '1.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 800, marginBottom: '1rem' }}>Add New Category</h3>
                        <form onSubmit={handleAddCategory} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <input
                                placeholder="Category Name (e.g. Pharma, Cleaning)"
                                value={newCatName}
                                onChange={(e) => setNewCatName(e.target.value)}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: 8, border: '1.5px solid #E2DFD4', outline: 'none' }}
                                required
                                autoFocus
                            />
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem', fontWeight: 600, color: '#3D3D3D', cursor: 'pointer', background: '#F9F8F6', padding: '0.75rem', borderRadius: 8, border: '1px solid #E2DFD4' }}>
                                <input
                                    type="checkbox"
                                    checked={newCatVatApplicable}
                                    onChange={(e) => setNewCatVatApplicable(e.target.checked)}
                                    style={{ width: 18, height: 18, cursor: 'pointer' }}
                                />
                                VAT Applicable for this Category
                            </label>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setIsAddingCat(false)} className="btn-secondary" style={{ padding: '0.5rem 1rem' }}>Cancel</button>
                                <button type="submit" className="btn" style={{ padding: '0.5rem 1rem' }}>Save Category</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Manage Categories Modal */}
            {isManagingCats && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="animate-slide-up" style={{ background: 'white', borderRadius: 16, width: '100%', maxWidth: 500, padding: '1.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 800 }}>Manage Categories</h3>
                            <button onClick={() => setIsManagingCats(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#7A7A7A' }}><X size={24} /></button>
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {categories.filter(c => c.type === (fixedType || formData.type)).map(cat => (
                                <div key={cat._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#F9F8F6', borderRadius: 8, border: '1px solid #E2DFD4' }}>
                                    <div>
                                        <div style={{ fontWeight: 700 }}>{cat.name}</div>
                                        <div style={{ fontSize: '0.7rem', color: cat.hasVat !== false ? '#166534' : '#991B1B', fontWeight: 800 }}>
                                            {cat.hasVat !== false ? '✓ VAT APPLICABLE' : '✕ VAT EXEMPT'}
                                        </div>
                                    </div>
                                    <button onClick={() => handleDeleteCategory(cat._id)} style={{ color: '#D94F3D', background: 'transparent', border: 'none', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                </div>
                            ))}
                            {categories.filter(c => c.type === (fixedType || formData.type)).length === 0 && (
                                <p style={{ textAlign: 'center', color: '#7A7A7A', padding: '1rem' }}>No custom categories yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
