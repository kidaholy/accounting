"use client";

import { useState } from 'react';

export default function DataEntry() {
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    const [formData, setFormData] = useState({
        type: 'sale',
        amount: '',
        vatAmount: '',
        category: 'Food Sales',
        description: ''
    });

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
                    description: formData.description,
                    date: new Date()
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
        const newType = e.target.value;
        let defaultCat = 'Food Sales';
        if (newType === 'purchase') defaultCat = 'Raw Materials';
        if (newType === 'expense') defaultCat = 'Rent';

        setFormData({ ...formData, type: newType, category: defaultCat });
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

                <div>
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

                <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#3D3D3D', marginBottom: '0.5rem' }}>Category</label>
                    <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: 8, border: '1.5px solid #E2DFD4', background: '#F9F8F6', outline: 'none' }}
                    >
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
                    </select>
                </div>

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
