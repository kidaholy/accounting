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

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'super_admin':
        return '#ef4444';
      case 'tenant_admin':
        return '#3b82f6';
      case 'accountant':
        return '#10b981';
      default:
        return '#94a3b8';
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar glass-panel">
        <div>
          <h2>{user?.tenantName || 'Accounting System'}</h2>
          <p className="subtitle">Cloud Accounting Platform</p>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button
            className={`nav-item ${activeTab === 'assets' ? 'active' : ''}`}
            onClick={() => setActiveTab('assets')}
          >
            Fixed Assets Schedule
          </button>

          <button
            className={`nav-item ${activeTab === 'vat' ? 'active' : ''}`}
            onClick={() => setActiveTab('vat')}
          >
            VAT Declaration
          </button>

          <button
            className={`nav-item ${activeTab === 'inventory' ? 'active' : ''}`}
            onClick={() => setActiveTab('inventory')}
          >
            Stock Inventory
          </button>

          {user.role === 'super_admin' && (
            <button
              className={`nav-item ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => setActiveTab('admin')}
            >
              Super Admin
            </button>
          )}

          {user.role === 'tenant_admin' && (
            <button
              className={`nav-item ${activeTab === 'tenant-admin' ? 'active' : ''}`}
              onClick={() => setActiveTab('tenant-admin')}
            >
              Tenant Admin
            </button>
          )}
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{user?.name}</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{user?.email}</div>
            <span style={{
              display: 'inline-block',
              marginTop: '0.5rem',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 500,
              backgroundColor: getRoleBadgeColor(user?.role),
              color: 'white'
            }}>
              {user?.role?.replace('_', ' ')}
            </span>
          </div>
          <button
            onClick={handleSignOut}
            className="btn"
            style={{
              width: '100%',
              backgroundColor: 'transparent',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)'
            }}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <div className="glass-panel" style={{ padding: '2rem', minHeight: '100%' }}>
          {activeTab === 'assets' && <FixedAssetSchedule />}
          {activeTab === 'vat' && <VatDeclaration />}
          {activeTab === 'inventory' && <StockInventory />}
          {activeTab === 'admin' && user?.role === 'super_admin' && (
            <div>
              <h1>Super Admin Dashboard</h1>
              <p>Manage tenants, subscriptions, and system settings.</p>
            </div>
          )}
          {activeTab === 'tenant-admin' && user?.role === 'tenant_admin' && (
            <div>
              <h1>Tenant Admin Dashboard</h1>
              <p>Manage users, view reports, and configure settings.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
