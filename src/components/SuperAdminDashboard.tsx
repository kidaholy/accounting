'use client';

import React, { useState, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import {
    Users,
    Building2,
    ShieldCheck,
    CreditCard,
    LogOut,
    Search,
    Plus,
    MoreVertical,
    ChevronRight,
    UserCheck,
    UserX,
    Settings,
    AlertCircle
} from 'lucide-react';

interface Stats {
    totalTenants: number;
    activeTenants: number;
    totalUsers: number;
    activeUsers: number;
    recentTenants: any[];
}

export default function SuperAdminDashboard({ user }: { user: any }) {
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState<Stats | null>(null);
    const [tenants, setTenants] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'overview') {
                const res = await fetch('/api/admin/stats');
                const data = await res.json();
                setStats(data);
            } else if (activeTab === 'tenants') {
                const res = await fetch('/api/admin/tenants');
                const data = await res.json();
                setTenants(data);
            } else if (activeTab === 'users') {
                const res = await fetch('/api/admin/users');
                const data = await res.json();
                setUsers(data);
            }
        } catch (err) {
            setError('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = () => signOut({ callbackUrl: '/login' });

    const menuItems = [
        { id: 'overview', label: 'Overview', icon: <ChevronRight size={18} /> },
        { id: 'tenants', label: 'Tenants', icon: <Building2 size={18} /> },
        { id: 'users', label: 'Users', icon: <Users size={18} /> },
        { id: 'pricing', label: 'Pricing', icon: <CreditCard size={18} /> },
    ];

    return (
        <div className="dashboard-container" style={{ display: 'flex', minHeight: '100vh', background: '#F3F1EA' }}>
            {/* Sidebar */}
            <aside style={{ width: 280, background: '#2A4A3E', color: 'white', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem' }}>
                    <img src="/images/hisabe logo.jpg" alt="Logo" style={{ width: 40, height: 40, borderRadius: 10, objectFit: 'cover' }} />
                    <span style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em' }}>Hisabe Admin</span>
                </div>

                <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.75rem',
                                padding: '0.875rem 1.25rem', borderRadius: 12,
                                background: activeTab === item.id ? '#CB6843' : 'transparent',
                                color: 'white', border: 'none', cursor: 'pointer',
                                fontWeight: 600, fontSize: '0.9375rem', transition: 'all 0.2s',
                                textAlign: 'left'
                            }}
                        >
                            {item.icon}
                            {item.label}
                        </button>
                    ))}
                </nav>

                <button
                    onClick={handleSignOut}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        padding: '1rem 1.25rem', color: 'rgba(255,255,255,0.6)',
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        fontSize: '0.875rem', fontWeight: 600
                    }}
                >
                    <LogOut size={18} />
                    Sign Out
                </button>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '2.5rem 3rem', overflowY: 'auto' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1A1A1A', letterSpacing: '-0.03em' }}>
                            {menuItems.find(i => i.id === activeTab)?.label}
                        </h1>
                        <p style={{ color: '#7A7A7A', fontSize: '0.9375rem', marginTop: '0.25rem' }}>System-wide management and control center.</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ padding: '0.5rem 1rem', background: 'white', border: '1.5px solid #E2DFD4', borderRadius: 10, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: 8, height: 8, background: '#22C55E', borderRadius: '50%' }} />
                            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#1A1A1A' }}>System Online</span>
                        </div>
                        <Link href="/dashboard" style={{ textDecoration: 'none' }}>
                            <div style={{ width: 44, height: 44, background: '#2A4A3E', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                                SA
                            </div>
                        </Link>
                    </div>
                </header>

                {activeTab === 'overview' && stats && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
                            <StatCard label="Total Tenants" value={stats.totalTenants} icon={<Building2 />} color="#2A4A3E" />
                            <StatCard label="Active Tenants" value={stats.activeTenants} icon={<ShieldCheck />} color="#22C55E" />
                            <StatCard label="Total Users" value={stats.totalUsers} icon={<Users />} color="#CB6843" />
                            <StatCard label="Active Users" value={stats.activeUsers} icon={<UserCheck />} color="#3B82F6" />
                        </div>

                        <div style={{ background: 'white', padding: '2rem', borderRadius: 20, border: '1.5px solid #E2DFD4' }}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>Recent Tenant Onboarding</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {stats.recentTenants.map((t: any) => (
                                    <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1.5px solid #F3F1EA', borderRadius: 12 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ width: 40, height: 40, background: '#F3F1EA', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2A4A3E' }}>
                                                <Building2 size={20} />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{t.name}</div>
                                                <div style={{ fontSize: '0.8125rem', color: '#7A7A7A' }}>{t.email}</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#7A7A7A' }}>Plan</div>
                                                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#CB6843' }}>{t.plan.toUpperCase()}</div>
                                            </div>
                                            <div style={{
                                                padding: '0.375rem 0.75rem', borderRadius: 20,
                                                background: t.status === 'active' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                                                color: t.status === 'active' ? '#22C55E' : '#EF4444',
                                                fontSize: '0.75rem', fontWeight: 700
                                            }}>
                                                {t.status.toUpperCase()}
                                            </div>
                                            <button style={{ background: 'transparent', border: 'none', color: '#7A7A7A' }}><MoreVertical size={18} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'tenants' && (
                    <div style={{ background: 'white', border: '1.5px solid #E2DFD4', borderRadius: 20, overflow: 'hidden' }}>
                        <div style={{ padding: '1.5rem 2rem', borderBottom: '1.5px solid #F3F1EA', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ position: 'relative', width: 320 }}>
                                <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#7A7A7A' }} />
                                <input
                                    placeholder="Search tenants..."
                                    style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: 10, border: '1.5px solid #E2DFD4', outline: 'none' }}
                                />
                            </div>
                            <button style={{ background: '#2A4A3E', color: 'white', border: 'none', padding: '0.75rem 1.25rem', borderRadius: 10, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <Plus size={18} /> Add Tenant
                            </button>
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#F9F8F4', textAlign: 'left' }}>
                                    <th style={{ padding: '1rem 2rem', fontSize: '0.75rem', fontWeight: 700, color: '#7A7A7A', textTransform: 'uppercase' }}>Tenant Name</th>
                                    <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 700, color: '#7A7A7A', textTransform: 'uppercase' }}>Subscription</th>
                                    <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 700, color: '#7A7A7A', textTransform: 'uppercase' }}>Status</th>
                                    <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 700, color: '#7A7A7A', textTransform: 'uppercase' }}>Created</th>
                                    <th style={{ padding: '1rem 2rem', fontSize: '0.75rem', fontWeight: 700, color: '#7A7A7A', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tenants.map(t => (
                                    <tr key={t._id} style={{ borderBottom: '1.5px solid #F3F1EA' }}>
                                        <td style={{ padding: '1.25rem 2rem' }}>
                                            <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{t.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#7A7A7A' }}>{t.email}</div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontSize: '0.8125rem', fontWeight: 700 }}>{t.subscriptionPlan?.toUpperCase()}</div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                padding: '0.25rem 0.625rem', borderRadius: 20, fontSize: '0.6875rem', fontWeight: 800,
                                                background: t.subscriptionStatus === 'active' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                                                color: t.subscriptionStatus === 'active' ? '#22C55E' : '#EF4444',
                                            }}>
                                                {t.subscriptionStatus?.toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#7A7A7A' }}>
                                            {new Date(t.createdAt).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: '1.25rem 2rem', textAlign: 'right' }}>
                                            <button style={{ color: '#7A7A7A', background: 'transparent', border: 'none' }}><MoreVertical size={18} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div style={{ background: 'white', border: '1.5px solid #E2DFD4', borderRadius: 20, overflow: 'hidden' }}>
                        <div style={{ padding: '1.5rem 2rem', borderBottom: '1.5px solid #F3F1EA' }}>
                            <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#1A1A1A' }}>System Users</h2>
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#F9F8F4', textAlign: 'left' }}>
                                    <th style={{ padding: '1rem 2rem', fontSize: '0.75rem', fontWeight: 700, color: '#7A7A7A', textTransform: 'uppercase' }}>User</th>
                                    <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 700, color: '#7A7A7A', textTransform: 'uppercase' }}>Tenant</th>
                                    <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 700, color: '#7A7A7A', textTransform: 'uppercase' }}>Role</th>
                                    <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 700, color: '#7A7A7A', textTransform: 'uppercase' }}>Status</th>
                                    <th style={{ padding: '1rem 2rem', fontSize: '0.75rem', fontWeight: 700, color: '#7A7A7A', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u._id} style={{ borderBottom: '1.5px solid #F3F1EA' }}>
                                        <td style={{ padding: '1.25rem 2rem' }}>
                                            <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{u.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#7A7A7A' }}>{u.email}</div>
                                        </td>
                                        <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#1A1A1A' }}>
                                            {u.tenant?.name || 'SYSTEM (Super Admin)'}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#CB6843' }}>{u.role?.toUpperCase()}</span>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                padding: '0.25rem 0.625rem', borderRadius: 20, fontSize: '0.6875rem', fontWeight: 800,
                                                background: u.isActive ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                                                color: u.isActive ? '#22C55E' : '#EF4444',
                                            }}>
                                                {u.isActive ? 'ACTIVE' : 'INACTIVE'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1.25rem 2rem', textAlign: 'right' }}>
                                            <button style={{ color: '#7A7A7A', background: 'transparent', border: 'none' }}><MoreVertical size={18} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'pricing' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
                        {['Free', 'Basic', 'Professional', 'Enterprise'].map(plan => (
                            <div key={plan} style={{ background: 'white', padding: '2rem', borderRadius: 20, border: '1.5px solid #E2DFD4', position: 'relative' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#CB6843', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem' }}>Tier</div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1A1A1A', marginBottom: '0.5rem' }}>{plan}</h3>
                                <div style={{ color: '#7A7A7A', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Standard {plan} Plan features.</div>
                                <button style={{ width: '100%', padding: '0.75rem', borderRadius: 10, background: '#F3F1EA', border: 'none', fontWeight: 700, fontSize: '0.875rem', color: '#1A1A1A' }}>
                                    Edit Details
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {loading && <div style={{ textAlign: 'center', padding: '5rem' }}>Loading system data...</div>}
                {error && <div style={{ textAlign: 'center', padding: '5rem', color: '#EF4444' }}>{error}</div>}
            </main>
        </div>
    );
}

function StatCard({ label, value, icon, color }: any) {
    return (
        <div style={{ background: 'white', padding: '1.75rem', borderRadius: 20, border: '1.5px solid #E2DFD4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#7A7A7A', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>{label}</div>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#1A1A1A', letterSpacing: '-0.04em' }}>{value}</div>
            </div>
            <div style={{ width: 48, height: 48, background: `${color}10`, color: color, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {React.cloneElement(icon, { size: 24 })}
            </div>
        </div>
    );
}
