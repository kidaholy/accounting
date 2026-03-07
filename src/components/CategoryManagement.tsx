"use client";

import { useState, useEffect } from 'react';
import { Plus, Trash2, Tag, ShoppingBag } from 'lucide-react';

export default function CategoryManagement() {
    const [categories, setCategories] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [newCategory, setNewCategory] = useState({ name: '', type: 'sale', accountCode: '' });
    const [newProduct, setNewProduct] = useState({ name: '', category: '', unit: '', type: 'sale' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [catRes, prodRes] = await Promise.all([
                fetch('/api/setup/categories'),
                fetch('/api/setup/products')
            ]);
            const catJson = await catRes.json();
            const prodJson = await prodRes.json();
            if (catJson.success) setCategories(catJson.data);
            if (prodJson.success) setProducts(prodJson.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/setup/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newCategory,
                    accountCode: newCategory.accountCode ? Number(newCategory.accountCode) : undefined
                })
            });
            if (res.ok) {
                setNewCategory({ name: '', type: 'sale', accountCode: '' });
                fetchData();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/setup/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newProduct)
            });
            if (res.ok) {
                setNewProduct({ name: '', category: '', unit: '', type: 'sale' });
                fetchData();
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading setup...</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

                {/* Category Management */}
                <div className="card">
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2A4A3E', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Tag size={20} /> Manage Categories
                    </h2>

                    <form onSubmit={handleAddCategory} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <input
                                placeholder="Category Name (e.g. Medicine)"
                                value={newCategory.name}
                                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                style={{ flex: 2, padding: '0.75rem', borderRadius: 8, border: '1.5px solid #E2DFD4', outline: 'none' }}
                                required
                            />
                            <select
                                value={newCategory.type}
                                onChange={(e) => setNewCategory({ ...newCategory, type: e.target.value })}
                                style={{ flex: 1, padding: '0.75rem', borderRadius: 8, border: '1.5px solid #E2DFD4', background: '#F9F8F6' }}
                            >
                                <option value="sale">Sale</option>
                                <option value="purchase">Purchase</option>
                                <option value="expense">Expense</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <input
                                type="number"
                                placeholder="Account Code (Optional)"
                                value={newCategory.accountCode}
                                onChange={(e) => setNewCategory({ ...newCategory, accountCode: e.target.value })}
                                style={{ flex: 2, padding: '0.75rem', borderRadius: 8, border: '1.5px solid #E2DFD4', outline: 'none' }}
                            />
                            <button type="submit" className="btn" style={{ flex: 1, padding: '0.75rem' }}>
                                Add Category
                            </button>
                        </div>
                    </form>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {categories.map(cat => (
                            <div key={cat._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#F9F8F6', borderRadius: 8, border: '1px solid #E2DFD4' }}>
                                <div>
                                    <span style={{ fontWeight: 700 }}>{cat.name}</span>
                                    <span style={{ marginLeft: '1rem', fontSize: '0.75rem', color: '#7A7A7A', textTransform: 'uppercase' }}>{cat.type}</span>
                                </div>
                                <span style={{ fontSize: '0.75rem', color: '#CB6843', fontWeight: 700 }}>{cat.accountCode || 'Auto'}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Product Management */}
                <div className="card">
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2A4A3E', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ShoppingBag size={20} /> Manage Products
                    </h2>

                    <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <input
                                placeholder="Product/Service Name"
                                value={newProduct.name}
                                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                style={{ flex: 2, padding: '0.75rem', borderRadius: 8, border: '1.5px solid #E2DFD4', outline: 'none' }}
                                required
                            />
                            <select
                                value={newProduct.category}
                                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                                style={{ flex: 1, padding: '0.75rem', borderRadius: 8, border: '1.5px solid #E2DFD4', background: '#F9F8F6' }}
                                required
                            >
                                <option value="">Select Category</option>
                                {categories.map(c => (
                                    <option key={c._id} value={c._id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <input
                                placeholder="Unit (e.g. PCS, Box)"
                                value={newProduct.unit}
                                onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                                style={{ flex: 1, padding: '0.75rem', borderRadius: 8, border: '1.5px solid #E2DFD4', outline: 'none' }}
                            />
                            <button type="submit" className="btn" style={{ flex: 1, padding: '0.75rem' }}>
                                Add Product
                            </button>
                        </div>
                    </form>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {products.map(prod => (
                            <div key={prod._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#F9F8F6', borderRadius: 8, border: '1px solid #E2DFD4' }}>
                                <div>
                                    <span style={{ fontWeight: 700 }}>{prod.name}</span>
                                    <span style={{ marginLeft: '1rem', fontSize: '0.75rem', color: '#7A7A7A' }}>{prod.category?.name}</span>
                                </div>
                                <span style={{ fontSize: '0.75rem', color: '#7A7A7A' }}>{prod.unit || '-'}</span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
