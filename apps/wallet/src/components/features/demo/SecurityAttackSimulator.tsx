import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, AlertCircle, RefreshCw, Lock, Terminal } from 'lucide-react';

interface SecurityLog {
  id: string;
  timestamp: string;
  attackName: string;
  targetTier: string;
  status: 'DEFENDED' | 'REJECTED' | 'ATTACK_SIMULATED';
  detail: string;
  protocolDefense: string;
}

export const SecurityAttackSimulator: React.FC = () => {
  const [logs, setLogs] = useState<SecurityLog[]>([
    {
      id: 'log-1',
      timestamp: new Date().toLocaleTimeString(),
      attackName: 'Nonce Replay Defense',
      targetTier: 'Tier 4 Transport Pipeline',
      status: 'DEFENDED',
      detail: 'Replay attempt detected for Nonce 0x8f9a2b7c4d1e902a.',
      protocolDefense:
        'Nonce bloom filter invalidated duplicate transport request. Proof rejected in 0.8ms.',
    },
  ]);

  const [activeAttack, setActiveAttack] = useState<string | null>(null);

  const triggerAttackScenario = (
    scenarioKey: string,
    attackName: string,
    targetTier: string,
    detail: string,
    protocolDefense: string,
  ) => {
    setActiveAttack(scenarioKey);

    setTimeout(() => {
      const newLog: SecurityLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        attackName,
        targetTier,
        status: 'DEFENDED',
        detail,
        protocolDefense,
      };

      setLogs((prev) => [newLog, ...prev]);
      setActiveAttack(null);
    }, 700);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
              <span>Security Threat & Replay Defense Simulator</span>
              <span className="px-2 py-0.5 bg-slate-800 text-rose-400 border border-rose-500/30 rounded text-xs font-mono font-medium">
                THREAT MODEL TESTER
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Interactive attack vector trigger suite to test ĀŚRAYA protocol resilience against
              tampering, replay, and over-disclosure
            </p>
          </div>
        </div>

        <button
          onClick={() => setLogs([])}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg flex items-center space-x-1 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Clear Logs</span>
        </button>
      </div>

      {/* Attack Scenario Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Scenario 1: Replay Attack */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-100 flex items-center space-x-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>1. Nonce Replay Attack</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">Tier 4</span>
            </div>
            <p className="text-xs text-slate-400">
              Inject spent proof payload with a previously used cryptographic nonce.
            </p>
          </div>

          <button
            onClick={() =>
              triggerAttackScenario(
                'replay',
                'Spent Nonce Replay Attack',
                'Tier 4 Ephemeral Transport',
                'Attacker re-sent previous valid proof payload with spent nonce 0x8f9a2b7c.',
                'REPLAY DEFENSE PASSED: Verifier single-use nonce register rejected payload.',
              )
            }
            disabled={activeAttack === 'replay'}
            className="w-full py-2 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-300 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center space-x-1.5"
          >
            {activeAttack === 'replay' ? (
              <span className="animate-pulse">Injecting Replay Attack...</span>
            ) : (
              <span>Simulate Replay Attack</span>
            )}
          </button>
        </div>

        {/* Scenario 2: Proof Bit-Flip Tamper */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-100 flex items-center space-x-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                <span>2. Signature Payload Tamper</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">Tier 2</span>
            </div>
            <p className="text-xs text-slate-400">
              Mutate bytes in BBS+ signature payload to pass false attribute predicate.
            </p>
          </div>

          <button
            onClick={() =>
              triggerAttackScenario(
                'tamper',
                'Cryptographic Proof Bit-Flip',
                'Tier 2 Minimization Engine',
                'Attacker modified 4 bytes in G1 proof point to fake income eligibility.',
                'VERIFICATION FAILED: Elliptic curve pairing evaluation returned FALSE.',
              )
            }
            disabled={activeAttack === 'tamper'}
            className="w-full py-2 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-rose-300 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center space-x-1.5"
          >
            {activeAttack === 'tamper' ? (
              <span className="animate-pulse">Injecting Byte Tamper...</span>
            ) : (
              <span>Simulate Proof Bit-Flip</span>
            )}
          </button>
        </div>

        {/* Scenario 3: Expired Contract */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-100 flex items-center space-x-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
                <span>3. Expired Contract Attempt</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">Tier 3</span>
            </div>
            <p className="text-xs text-slate-400">
              Submit proof for a request contract whose expiry timestamp has lapsed.
            </p>
          </div>

          <button
            onClick={() =>
              triggerAttackScenario(
                'expired',
                'Expired Purpose Contract',
                'Tier 3 Bounded Protocol',
                'Citizen wallet received contract request expired 2 hours ago.',
                'CONTRACT EXPIRED: Wallet rejected proof generation request at boundary.',
              )
            }
            disabled={activeAttack === 'expired'}
            className="w-full py-2 bg-indigo-500/10 border border-indigo-500/30 hover:bg-indigo-500/20 text-indigo-300 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center space-x-1.5"
          >
            {activeAttack === 'expired' ? (
              <span className="animate-pulse">Testing Expired Contract...</span>
            ) : (
              <span>Simulate Expired Request</span>
            )}
          </button>
        </div>
      </div>

      {/* Real-time Defense Terminal Logs */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden font-mono text-xs">
        <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-slate-300">
          <span className="flex items-center space-x-2 font-semibold">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>Protocol Defense Execution Log</span>
          </span>
          <span className="text-[11px] text-slate-500">{logs.length} events logged</span>
        </div>

        <div className="p-4 space-y-3 max-h-60 overflow-y-auto">
          {logs.map((log) => (
            <div
              key={log.id}
              className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 space-y-1.5"
            >
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center space-x-2">
                  <span className="text-slate-500">[{log.timestamp}]</span>
                  <span className="text-rose-400 font-bold">{log.attackName}</span>
                  <span className="text-slate-500">→</span>
                  <span className="text-indigo-400 font-medium">{log.targetTier}</span>
                </div>
                <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full font-bold flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>{log.status}</span>
                </span>
              </div>
              <p className="text-slate-300 text-xs">{log.detail}</p>
              <p className="text-emerald-400 text-xs font-sans font-medium bg-emerald-950/30 p-2 rounded border border-emerald-500/20">
                🛡️ {log.protocolDefense}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
