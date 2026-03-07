"use client";

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { Shield, TrendingUp, FileEdit, Briefcase, FileText, Package, Building } from 'lucide-react';
import FixedAssetSchedule from './FixedAssetSchedule';
import VatDeclaration from './VatDeclaration';
import StockInventory from './StockInventory';
import SmartReports from './SmartReports';
import DataEntry from './DataEntry';
import CategoryManagement from './CategoryManagement';

interface User {
  name?: string | null;
  email?: string | null;
  role?: string;
}

interface DashboardProps {
  user: User;
}

export default function Dashboard({ user }: DashboardProps) {
  const [activeTab, setActiveTab] = useState(user.role === 'super_admin' ? 'admin' : 'reports');

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  let menuItems: { id: string, label: string, icon: React.ReactNode }[] = [];

  if (user.role === 'super_admin') {
    menuItems = [
      { id: 'admin', label: 'Administration', icon: <Shield size={18} strokeWidth={2.5} /> }
    ];
  } else {
    menuItems = [
      { id: 'reports', label: 'Audited Statements', icon: <TrendingUp size={18} strokeWidth={2.5} /> },
      { id: 'vat', label: 'VAT Compliance', icon: <FileText size={18} strokeWidth={2.5} /> },
      { id: 'data-entry', label: 'General Ledger', icon: <FileEdit size={18} strokeWidth={2.5} /> },
      { id: 'setup', label: 'Product Setup', icon: <Shield size={18} strokeWidth={2.5} /> },
      { id: 'assets', label: 'Fixed Assets', icon: <Briefcase size={18} strokeWidth={2.5} /> },
      { id: 'inventory', label: 'Stock Inventory', icon: <Package size={18} strokeWidth={2.5} /> },
    ];
    if (user.role === 'tenant_admin') {
      menuItems.push({ id: 'tenant-admin', label: 'Tenant Admin', icon: <Building size={18} strokeWidth={2.5} /> });
    }
  }

  const tabTitles: Record<string, string> = {
    reports: 'Audited Financial Statements',
    vat: 'VAT Returns & Compliance',
    'data-entry': 'General Ledger Transactions',
    setup: 'Product & Category Setup',
    assets: 'Fixed Asset Schedule',
    inventory: 'Stock Inventory',
    admin: 'Administration',
    'tenant-admin': 'Tenant Administration',
  };

  return (
    <div className="app-layout">
      {/* ─── SIDEBAR ─── */}
      <aside className="sidebar">
        {/* Logo */}
        <div className="sidebar-logo">
          <img
            src="/images/hisabe logo.jpg"
            alt="Hisabe Logo"
            style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
          />
          <span>Hisabe</span>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#A0A0A0', marginBottom: '0.5rem', padding: '0 1rem' }}>
            Main Menu
          </div>
          {menuItems.map(item => (
            <button
              key={item.id}
              className={`nav-item${activeTab === item.id ? ' active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: activeTab === item.id ? 1 : 0.6 }}>{item.icon}</div>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          {/* User info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', padding: '0.75rem 1rem', background: '#F3F1EA', borderRadius: 10 }}>
            <div style={{ width: 36, height: 36, background: '#CB6843', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '0.875rem', flexShrink: 0 }}>
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: '#1A1A1A', fontWeight: 700, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
              <div style={{ color: '#7A7A7A', fontSize: '0.75rem', textTransform: 'capitalize' }}>{user?.role?.replace(/_/g, ' ')}</div>
            </div>
          </div>
          <button className="nav-item" onClick={handleSignOut} style={{ color: '#f87171' }}>
            <span>🚪</span> Sign Out
          </button>
        </div>
      </aside>

      {/* ─── MAIN WRAPPER ─── */}
      <div className="main-wrapper">
        {/* Header */}
        <header className="header">
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1A1A1A', letterSpacing: '-0.02em' }}>
              {tabTitles[activeTab] || 'Dashboard'}
            </h1>
            <p style={{ fontSize: '0.8125rem', color: '#7A7A7A', marginTop: 1 }}>
              {new Date().toLocaleDateString('en-ET', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="user-profile">
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#A8A8A8', fontSize: '0.875rem' }}>🔍</span>
              <input
                type="text"
                placeholder="Search..."
                style={{
                  padding: '0.5625rem 1rem 0.5625rem 2.25rem',
                  background: '#F3F1EA',
                  border: '1.5px solid #E2DFD4',
                  borderRadius: 8,
                  outline: 'none',
                  fontSize: '0.875rem',
                  width: 220,
                  fontFamily: 'inherit',
                }}
              />
            </div>

            {/* User avatar */}
            <div className="avatar" style={{ cursor: 'pointer' }}>
              {user?.name?.charAt(0) || 'U'}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="content-area animate-slide-up">
          {activeTab === 'reports' && <SmartReports />}
          {activeTab === 'data-entry' && <DataEntry />}
          {activeTab === 'assets' && <FixedAssetSchedule />}
          {activeTab === 'vat' && <VatDeclaration />}
          {activeTab === 'inventory' && <StockInventory />}
          {activeTab === 'setup' && <CategoryManagement />}
          {activeTab === 'admin' && user?.role === 'super_admin' && (
            <div className="card" style={{ padding: '4rem 3rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
              <Shield size={64} color="#3B82F6" />
              <div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1A1A1A', marginBottom: '0.5rem' }}>Super Admin Panel</h2>
                <p style={{ color: '#7A7A7A', maxWidth: 400, margin: '0 auto' }}>Manage tenants, users, and system-wide configuration from the central management suite.</p>
              </div>
              <Link
                href="/super-admin"
                style={{
                  background: '#2A4A3E',
                  color: 'white',
                  padding: '1rem 2rem',
                  borderRadius: 12,
                  fontWeight: 700,
                  textDecoration: 'none',
                  boxShadow: '0 4px 12px rgba(42,74,62,0.2)'
                }}
              >
                Go to Management Suite
              </Link>
            </div>
          )}
          {activeTab === 'tenant-admin' && user?.role === 'tenant_admin' && (
            <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏢</div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1A1A1A', marginBottom: '0.5rem' }}>Tenant Admin Panel</h2>
              <p style={{ color: '#7A7A7A' }}>Manage your organization's settings and team members.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
