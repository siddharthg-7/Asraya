import React, { useState, useEffect } from 'react';
import { AppHeader, ActiveView } from './components/layout/AppHeader';
import { Footer } from './components/layout/Footer';
import { LandingHero } from './components/features/landing/LandingHero';
import { PrivacyComparisonVisualizer } from './components/features/landing/PrivacyComparisonVisualizer';
import { WalletDashboard } from './components/features/wallet/WalletDashboard';
import { VerifierConsole } from './components/features/verifier/VerifierConsole';
import { ConsentModal } from './components/features/wallet/ConsentModal';
import { ProofGenerationView } from './components/features/wallet/ProofGenerationView';
import { RequestDetailView } from './components/features/wallet/RequestDetailView';
import { VerificationResultView } from './components/features/wallet/VerificationResultView';
import { ErrorStateView } from './components/feedback/ErrorStateView';
import { InteractiveDemoWizard } from './components/features/demo/InteractiveDemoWizard';

import {
  VerificationRequest,
  CredentialClaim,
  AuditReceipt,
  VerificationResult,
  VerifierAuditRecord,
  BoundedPredicate,
  ProtocolErrorType,
} from './types/protocol';

import { requestService } from './services/api/requestService';
import { credentialService } from './services/api/credentialService';
import { consentService } from './services/api/consentService';
import { receiptService } from './services/api/receiptService';

// Path & URL Routing Helpers
const getViewFromPath = (path: string): ActiveView => {
  const cleanPath = path.toLowerCase().replace(/\/$/, '');
  if (cleanPath.includes('wallet') || cleanPath.includes('citizen')) return 'wallet';
  if (cleanPath.includes('verifier') || cleanPath.includes('console')) return 'verifier';
  if (cleanPath.includes('demo') || cleanPath.includes('judge')) return 'demo';
  return 'landing';
};

const getPathFromView = (view: ActiveView): string => {
  switch (view) {
    case 'wallet': return '/citizen-wallet';
    case 'verifier': return '/verifier-console';
    case 'demo': return '/live-judge-demo';
    case 'landing': default: return '/';
  }
};

export const App: React.FC = () => {
  const [activeView, setActiveViewInternal] = useState<ActiveView>(() =>
    getViewFromPath(window.location.pathname)
  );

  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [credentials, setCredentials] = useState<CredentialClaim[]>([]);
  const [receipts, setReceipts] = useState<AuditReceipt[]>([]);
  const [auditRecords, setAuditRecords] = useState<VerifierAuditRecord[]>([]);

  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [isConsentModalOpen, setIsConsentModalOpen] = useState<boolean>(false);
  const [proofGeneratingRequestId, setProofGeneratingRequestId] = useState<string | null>(null);
  const [activeResult, setActiveResult] = useState<{
    result: VerificationResult;
    receipt: AuditReceipt | null;
  } | null>(null);
  const [activeError, setActiveError] = useState<ProtocolErrorType | null>(null);

  // Synchronize view state with browser URL
  const setActiveView = (view: ActiveView) => {
    setActiveViewInternal(view);
    setActiveResult(null);
    setActiveError(null);
    setSelectedRequest(null);
    const targetPath = getPathFromView(view);
    if (window.location.pathname !== targetPath) {
      window.history.pushState({ view }, '', targetPath);
    }
  };

  // Handle browser Back / Forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const currentView = getViewFromPath(window.location.pathname);
      setActiveViewInternal(currentView);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Load initial modular service data
  useEffect(() => {
    const fetchData = async () => {
      const pendingReqs = await requestService.getPendingRequests();
      const userCreds = await credentialService.getCredentials();
      const userReceipts = await receiptService.getReceipts();
      const audits = await receiptService.getVerifierAuditLogs();

      setRequests(pendingReqs);
      setCredentials(userCreds);
      setReceipts(userReceipts);
      setAuditRecords(audits);
    };

    fetchData();
  }, []);

  const handleReviewRequest = (req: VerificationRequest) => {
    setSelectedRequest(req);
    setIsConsentModalOpen(true);
  };

  const handleApproveConsent = async (requestId: string) => {
    setIsConsentModalOpen(false);
    setSelectedRequest(null);
    setProofGeneratingRequestId(requestId);

    try {
      await consentService.approveConsent(requestId);
    } catch (err) {
      console.error(err);
      setActiveError('PROOF_GENERATION_FAILED');
      setProofGeneratingRequestId(null);
    }
  };

  const handleProofComplete = async () => {
    const reqId = proofGeneratingRequestId;
    setProofGeneratingRequestId(null);

    if (reqId) {
      const updatedReqs = await requestService.getPendingRequests();
      const updatedReceipts = await receiptService.getReceipts();
      const updatedAudits = await receiptService.getVerifierAuditLogs();

      setRequests(updatedReqs);
      setReceipts(updatedReceipts);
      setAuditRecords(updatedAudits);

      const matchedReceipt = updatedReceipts[0] || null;

      // Generate verification result screen state
      setActiveResult({
        result: {
          id: `res-${Date.now()}`,
          requestId: reqId,
          verifierName: 'Municipal EV Subsidy Office',
          verifierDid: 'did:asraya:verifier:municipal-ev-dept',
          verifiedAt: new Date().toISOString(),
          isSuccess: true,
          tierUsed: 'TIER_A_BBS_PLUS',
          predicateResults: [
            { predicateId: 'pred-1', field: 'isValidPermit', label: 'Valid Commercial EV Permit', satisfied: true },
            { predicateId: 'pred-2', field: 'annualIncomeInINR', label: 'Annual Income Threshold', satisfied: true },
            { predicateId: 'pred-3', field: 'state', label: 'Eligible State Jurisdiction', satisfied: true },
          ],
          nonce: '0x8f9a2b7c4d1e902a3f5b7c8d9e0f1a2b',
          receiptHash: matchedReceipt?.receiptHash || '0xa49f7e82b1c3d5e6f7a8b9c0d1e2...',
          isSimulatedDemo: true,
        },
        receipt: matchedReceipt,
      });
    }
  };

  const handleDeclineConsent = async (requestId: string) => {
    setIsConsentModalOpen(false);
    setSelectedRequest(null);
    await consentService.declineConsent(requestId);

    const updatedReqs = await requestService.getPendingRequests();
    const updatedAudits = await receiptService.getVerifierAuditLogs();
    setRequests(updatedReqs);
    setAuditRecords(updatedAudits);

    setActiveError('CONSENT_DECLINED');
  };

  const handleCreateVerifierRequest = async (params: {
    verifierName: string;
    purpose: string;
    purposeCode: string;
    predicates: Omit<BoundedPredicate, 'id'>[];
  }) => {
    const newReq = await requestService.createRequest(params);
    const updatedReqs = await requestService.getPendingRequests();
    setRequests(updatedReqs);
    // Switch view to wallet so citizen sees the incoming request
    setActiveView('wallet');
    setSelectedRequest(newReq);
  };

  const pendingCount = requests.filter((r) => r.status === 'PENDING').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <AppHeader
        activeView={activeView}
        setActiveView={setActiveView}
        pendingRequestsCount={pendingCount}
      />

      <main className="flex-1">
        {/* LANDING VIEW */}
        {activeView === 'landing' && (
          <div>
            <LandingHero onNavigate={setActiveView} />
            <PrivacyComparisonVisualizer />
          </div>
        )}

        {/* CITIZEN WALLET VIEW */}
        {activeView === 'wallet' && (
          <div>
            {activeError ? (
              <ErrorStateView
                type={activeError}
                onBackToWallet={() => setActiveError(null)}
                onRecovery={() => setActiveError(null)}
              />
            ) : activeResult ? (
              <VerificationResultView
                result={activeResult.result}
                receipt={activeResult.receipt}
                onBackToWallet={() => setActiveResult(null)}
              />
            ) : proofGeneratingRequestId ? (
              <ProofGenerationView
                requestId={proofGeneratingRequestId}
                onComplete={handleProofComplete}
                onError={() => {
                  setProofGeneratingRequestId(null);
                  setActiveError('PROOF_GENERATION_FAILED');
                }}
              />
            ) : selectedRequest ? (
              <RequestDetailView
                request={selectedRequest}
                onApprove={handleApproveConsent}
                onDecline={handleDeclineConsent}
                onBack={() => setSelectedRequest(null)}
              />
            ) : (
              <WalletDashboard
                requests={requests}
                credentials={credentials}
                receipts={receipts}
                onReviewRequest={handleReviewRequest}
              />
            )}
          </div>
        )}

        {/* VERIFIER CONSOLE VIEW */}
        {activeView === 'verifier' && (
          <VerifierConsole
            requests={requests}
            auditRecords={auditRecords}
            lastResult={activeResult?.result || null}
            onCreateRequest={handleCreateVerifierRequest}
            onSwitchToCitizenWallet={() => setActiveView('wallet')}
          />
        )}

        {/* LIVE JUDGE DEMO WIZARD VIEW */}
        {activeView === 'demo' && <InteractiveDemoWizard />}
      </main>

      {/* CONSENT MODAL DIALOG */}
      <ConsentModal
        request={selectedRequest}
        isOpen={isConsentModalOpen}
        onClose={() => setIsConsentModalOpen(false)}
        onApprove={handleApproveConsent}
        onDecline={handleDeclineConsent}
      />

      <Footer />
    </div>
  );
};

export default App;
