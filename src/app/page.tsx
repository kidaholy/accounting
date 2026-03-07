"use client";

import { useState } from 'react';
import FixedAssetSchedule from '@/components/FixedAssetSchedule';
import VatDeclaration from '@/components/VatDeclaration';
import StockInventory from '@/components/StockInventory';

export default function Home() {
  const [activeTab, setActiveTab] = useState('assets');

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar glass-panel">
        <div>
          <h2>Abebe Tigistu</h2>
          <p className="subtitle">Accounting System</p>
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
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <div className="glass-panel" style={{ padding: '2rem', minHeight: '100%' }}>
          {activeTab === 'assets' && <FixedAssetSchedule />}
          {activeTab === 'vat' && <VatDeclaration />}
          {activeTab === 'inventory' && <StockInventory />}
        </div>
      </main>
    </div>
  );
}
