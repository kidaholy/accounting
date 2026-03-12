"use client";

import { useState, useEffect } from 'react';
import { Calendar, Tag, Filter, Search, Download, Trash2 } from 'lucide-react';

export default function TransactionList() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'sale' | 'purchase' | 'expense'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/transactions');
            const json = await res.json();
            if (json.success) {
                setTransactions(json.data);
            }
        } catch (err) {
            console.error('Failed to fetch transactions:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this transaction?')) return;
        try {
            const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
            if (res.ok) {
                await fetchTransactions();
            } else {
                alert('Failed to delete transaction');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const filteredTransactions = transactions.filter(tx => {
        const matchesFilter = filter === 'all' || tx.type === filter;
        const matchesSearch = tx.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tx.category?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB' }).format(val);

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString('en-ET', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'sale': return '#2A4A3E';
            case 'purchase': return '#CB6843';
            case 'expense': return '#D94F3D';
            default: return '#7A7A7A';
        }
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading transactions...</div>;

    return (
        <div className="animate-slide-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
                <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#2A4A3E', marginBottom: '0.5rem' }}>🧾 Records</div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#1A1A1A', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Transaction History</h1>
                    <p style={{ color: '#7A7A7A', fontSize: '0.9375rem' }}>View and manage your previous sales, purchases, and expenses.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ position: 'relative' }}>
                        <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#A8A8A8' }} size={16} />
                        <input
                            type="text"
                            placeholder="Search records..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ padding: '0.625rem 1rem 0.625rem 2.25rem', borderRadius: 10, border: '1.5px solid #E2DFD4', outline: 'none', background: '#F9F8F6', width: 250, fontFamily: 'inherit' }}
                        />
                    </div>
                </div>
            </div>

            <div style={{ marginBottom: '2rem', display: 'flex', gap: '0.75rem' }}>
                <button
                    onClick={() => setFilter('all')}
                    style={{ padding: '0.5rem 1.25rem', borderRadius: 8, border: 'none', background: filter === 'all' ? '#2A4A3E' : '#E2DFD4', color: filter === 'all' ? 'white' : '#1A1A1A', fontWeight: 700, cursor: 'pointer' }}
                >
                    All
                </button>
                <button
                    onClick={() => setFilter('sale')}
                    style={{ padding: '0.5rem 1.25rem', borderRadius: 8, border: 'none', background: filter === 'sale' ? '#2A4A3E' : '#E2DFD4', color: filter === 'sale' ? 'white' : '#1A1A1A', fontWeight: 700, cursor: 'pointer' }}
                >
                    Sales
                </button>
                <button
                    onClick={() => setFilter('purchase')}
                    style={{ padding: '0.5rem 1.25rem', borderRadius: 8, border: 'none', background: filter === 'purchase' ? '#CB6843' : '#E2DFD4', color: filter === 'purchase' ? 'white' : '#1A1A1A', fontWeight: 700, cursor: 'pointer' }}
                >
                    Purchases
                </button>
                <button
                    onClick={() => setFilter('expense')}
                    style={{ padding: '0.5rem 1.25rem', borderRadius: 8, border: 'none', background: filter === 'expense' ? '#D94F3D' : '#E2DFD4', color: filter === 'expense' ? 'white' : '#1A1A1A', fontWeight: 700, cursor: 'pointer' }}
                >
                    Expenses
                </button>
            </div>

            <div className="table-container shadow-sm">
                <table className="modern-table">
                    <thead>
                        <tr>
                            <th style={{ width: '120px' }}>Date</th>
                            <th>Category</th>
                            <th>Description</th>
                            <th style={{ width: '100px', textAlign: 'center' }}>Type</th>
                            <th style={{ textAlign: 'right', width: '150px' }}>Amount</th>
                            <th style={{ textAlign: 'right', width: '140px' }}>VAT Status</th>
                            <th style={{ width: '80px', textAlign: 'center' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTransactions.map(tx => (
                            <tr key={tx._id}>
                                <td style={{ fontWeight: 600, color: '#555' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Calendar size={14} color="#A8A8A8" />
                                        {formatDate(tx.date)}
                                    </div>
                                </td>
                                <td>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: '#1A1A1A' }}>
                                        <Tag size={14} color="#CB6843" />
                                        {tx.category}
                                    </span>
                                </td>
                                <td style={{ color: '#7A7A7A', fontSize: '0.875rem' }}>{tx.description || '-'}</td>
                                <td style={{ textAlign: 'center' }}>
                                    <span style={{ padding: '0.25rem 0.625rem', borderRadius: 6, background: `${getTypeColor(tx.type)}15`, color: getTypeColor(tx.type), fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        {tx.type}
                                    </span>
                                </td>
                                <td style={{ textAlign: 'right', fontWeight: 800, color: '#1A1A1A' }}>{formatCurrency(tx.amount)}</td>
                                <td style={{ textAlign: 'right' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.2rem' }}>
                                        <span style={{
                                            fontSize: '0.65rem',
                                            fontWeight: 900,
                                            padding: '0.15rem 0.4rem',
                                            borderRadius: 4,
                                            background: tx.vatAmount > 0 ? 'rgba(42,74,62,0.1)' : 'rgba(168,168,168,0.1)',
                                            color: tx.vatAmount > 0 ? '#2A4A3E' : '#7A7A7A',
                                            textTransform: 'uppercase'
                                        }}>
                                            {tx.vatAmount > 0 ? 'VAT applied' : 'No VAT'}
                                        </span>
                                        {tx.vatAmount > 0 && <span style={{ fontSize: '0.875rem', color: '#1A1A1A', fontWeight: 600 }}>{formatCurrency(tx.vatAmount)}</span>}
                                    </div>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <button
                                        onClick={() => handleDelete(tx._id)}
                                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#A8A8A8', padding: '0.25rem' }}
                                        title="Delete Record"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredTransactions.length === 0 && (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#A8A8A8' }}>
                                    No transaction records found matching your filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
