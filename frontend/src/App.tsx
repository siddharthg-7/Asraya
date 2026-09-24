/**
 * @fileoverview Main Application Component
 * Pramāṇa Protocol - Phase 1 Foundation
 */

import React, { useState } from 'react';
import { Header } from './components/Header.js';
import { HomePage } from './pages/HomePage.js';
import { WalletPage } from './pages/WalletPage.js';
import { VerifierPage } from './pages/VerifierPage.js';
import { ReceiptViewer } from './features/receipts/ReceiptViewer.js';
import { ActiveTab } from './types/ui.js';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');

  return (
    <div>
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="container">
        {activeTab === 'overview' && <HomePage />}
        {activeTab === 'wallet' && <WalletPage />}
        {activeTab === 'verifier' && <VerifierPage />}
        {activeTab === 'receipts' && (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <h2>Citizen & Verifier Audit Receipts</h2>
            <ReceiptViewer receipts={[]} />
          </div>
        )}
      </main>
    </div>
  );
};
