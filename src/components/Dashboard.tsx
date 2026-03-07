"use client";

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import FixedAssetSchedule from './FixedAssetSchedule';
import VatDeclaration from './VatDeclaration';
import StockInventory from './StockInventory';

interface User {
  name?: string | null;
  email?: string | null;
  role?: string;
  tenantName?: string;
}

interface DashboardProps {
  user: User;
}

export default function Dashboard({ user }: DashboardProps) {
  const [activeTab, setActiveTab] = useState('assets');

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  const menuItems = [
    { id: 'assets', label: 'Fixed Assets', icon: '💎' },
    { id: 'vat', label: 'VAT Declaration', icon: '📊' },
    { id: 'inventory', label: 'Stock Inventory', icon: '📦' },
  ];

  if (user.role === 'super_admin') {
    menuItems.push({ id: 'admin', label: 'Super Admin', icon: '🛡️' });
  }

  if (user.role === 'tenant_admin') {
    menuItems.push({ id: 'tenant-admin', label: 'Tenant Admin', icon: '🏢' });
  }

  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div style={{ background: 'var(--accent-primary)', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>A</div>
          <span>Accounting</span>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button
            onClick={handleSignOut}
            className="nav-item"
            style={{ color: '#f87171' }}
          >
            <span>🚪</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-wrapper">
        <header className="header">
          <div className="search-bar" style={{ flex: 1, maxWidth: 400 }}>
            <input
              type="text"
              placeholder="Search anything..."
              style={{ width: '100%', background: 'var(--bg-main)', border: '1px solid var(--border-base)', padding: '0.625rem 1rem', borderRadius: 'var(--radius-md)', outline: 'none' }}
            />
          </div>

          <div className="user-profile">
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{user?.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{user?.role?.replace('_', ' ')}</div>
            </div>
            <div className="avatar">
              {user?.name?.charAt(0) || 'U'}
            </div>
          </div>
        </header>

        <main className="content-area animate-slide-up">
          <div className="card">
            {activeTab === 'assets' && <FixedAssetSchedule />}
            {activeTab === 'vat' && <VatDeclaration />}
            {activeTab === 'inventory' && <StockInventory />}
            {activeTab === 'admin' && user?.role === 'super_admin' && (
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Super Admin Dashboard</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Manage tenants, subscriptions, and system settings.</p>
                <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                  <div className="card" style={{ background: 'var(--bg-main)' }}><h3>12</h3><p>Total Tenants</p></div>
                  <div className="card" style={{ background: 'var(--bg-main)' }}><h3>$4,250</h3><p>Monthly Revenue</p></div>
                  <div className="card" style={{ background: 'var(--bg-main)' }}><h3>2</h3><p>Pending Tickets</p></div>
                </div>
              </div>
            )}
            {activeTab === 'tenant-admin' && user?.role === 'tenant_admin' && (
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Tenant Admin Dashboard</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Manage users, view reports, and configure settings.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
