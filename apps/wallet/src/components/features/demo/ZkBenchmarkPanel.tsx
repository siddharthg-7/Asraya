import React, { useState } from 'react';
import { Cpu, Zap, ShieldCheck, Play, CheckCircle2, FileCode, HardDrive } from 'lucide-react';
import { ProofEngineTier } from '../../../types/protocol';

export const ZkBenchmarkPanel: React.FC = () => {
  const [selectedEngine, setSelectedEngine] = useState<ProofEngineTier>('TIER_A_BBS_PLUS');
  const [proverProfile, setProverProfile] = useState<'MOBILE_ARM64' | 'DESKTOP_WASM' | 'CLOUD_PROVER'>('DESKTOP_WASM');
  const [isRunningTest, setIsRunningTest] = useState<boolean>(false);
  const [lastTestRun, setLastTestRun] = useState<{
    genTimeMs: number;
    verifyTimeMs: number;
    proofSize: number;
    constraints: number;
    memoryMb: number;
    timestamp: string;
  } | null>({
    genTimeMs: 14.2,
    verifyTimeMs: 1.8,
    proofSize: 192,
    constraints: 0,
    memoryMb: 12.4,
    timestamp: 'Just now',
  });

  const handleRunBenchmark = () => {
    setIsRunningTest(true);
    setLastTestRun(null);

    setTimeout(() => {
      const isBbs = selectedEngine === 'TIER_A_BBS_PLUS';
      const profileMultiplier =
        proverProfile === 'MOBILE_ARM64' ? 1.8 : proverProfile === 'CLOUD_PROVER' ? 0.4 : 1.0;

      setLastTestRun({
        genTimeMs: Number(((isBbs ? 14 : 340) * profileMultiplier).toFixed(1)),
        verifyTimeMs: Number(((isBbs ? 1.8 : 3.2) * profileMultiplier).toFixed(1)),
        proofSize: isBbs ? 192 : 48,
        constraints: isBbs ? 0 : 14280,
        memoryMb: Number(((isBbs ? 12.4 : 48.6) * profileMultiplier).toFixed(1)),
        timestamp: new Date().toLocaleTimeString(),
      });
      setIsRunningTest(false);
    }, 900);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl backdrop-blur-sm">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
              <span>Cryptographic Proof Engine Benchmarks</span>
              <span className="px-2 py-0.5 bg-slate-800 text-purple-400 border border-purple-500/30 rounded text-xs font-mono font-medium">
                TIER-1 & 2 ENGINE
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Live performance metrics comparing BBS+ Selective Disclosure Signature Proofs vs Groth16 ZK Circuits
            </p>
          </div>
        </div>

        <button
          onClick={handleRunBenchmark}
          disabled={isRunningTest}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-purple-900/30 flex items-center justify-center space-x-2 disabled:opacity-50 transition-all"
        >
          {isRunningTest ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Running Circuit Benchmarks...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Run Live Benchmark</span>
            </>
          )}
        </button>
      </div>

      {/* Control Selector Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Engine Tier Choice */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Cryptographic Engine Primitive
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setSelectedEngine('TIER_A_BBS_PLUS')}
              className={`p-3 rounded-xl border text-left transition-all ${
                selectedEngine === 'TIER_A_BBS_PLUS'
                  ? 'bg-cyan-950/60 border-cyan-500 text-cyan-200'
                  : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="font-bold text-xs flex items-center justify-between">
                <span>BBS+ Signatures</span>
                {selectedEngine === 'TIER_A_BBS_PLUS' && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
              </div>
              <p className="text-[11px] opacity-75 mt-1">Selective Disclosure (Primary)</p>
            </button>

            <button
              onClick={() => setSelectedEngine('TIER_B_GROTH16')}
              className={`p-3 rounded-xl border text-left transition-all ${
                selectedEngine === 'TIER_B_GROTH16'
                  ? 'bg-purple-950/60 border-purple-500 text-purple-200'
                  : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="font-bold text-xs flex items-center justify-between">
                <span>Groth16 SNARK</span>
                {selectedEngine === 'TIER_B_GROTH16' && <CheckCircle2 className="w-4 h-4 text-purple-400" />}
              </div>
              <p className="text-[11px] opacity-75 mt-1">Zero-Knowledge Fallback</p>
            </button>
          </div>
        </div>

        {/* Prover Environment */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Prover Execution Target Profile
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'MOBILE_ARM64', label: 'Mobile (ARM64)', desc: 'Client Wallet' },
              { id: 'DESKTOP_WASM', label: 'WebAssembly', desc: 'Browser Engine' },
              { id: 'CLOUD_PROVER', label: 'Cloud Prover', desc: 'Delegated ZK' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setProverProfile(p.id as unknown as 'MOBILE_ARM64' | 'DESKTOP_WASM' | 'CLOUD_PROVER')}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  proverProfile === (p.id as unknown as string)
                    ? 'bg-indigo-950/60 border-indigo-500 text-indigo-200'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-xs">{p.label}</div>
                <p className="text-[10px] opacity-70 mt-0.5">{p.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Benchmark Metrics Cards */}
      {lastTestRun ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-1">
            <span className="text-xs text-slate-400 flex items-center space-x-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Proof Gen Latency</span>
            </span>
            <div className="text-2xl font-bold font-mono text-slate-100">{lastTestRun.genTimeMs} ms</div>
            <span className="text-[10px] text-emerald-400 font-medium">Sub-second generation</span>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-1">
            <span className="text-xs text-slate-400 flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Verification Time</span>
            </span>
            <div className="text-2xl font-bold font-mono text-cyan-300">{lastTestRun.verifyTimeMs} ms</div>
            <span className="text-[10px] text-slate-400">Verifier side computation</span>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-1">
            <span className="text-xs text-slate-400 flex items-center space-x-1.5">
              <FileCode className="w-3.5 h-3.5 text-indigo-400" />
              <span>Proof Size</span>
            </span>
            <div className="text-2xl font-bold font-mono text-indigo-300">{lastTestRun.proofSize} Bytes</div>
            <span className="text-[10px] text-slate-400">Minimal QR/Transport payload</span>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-1">
            <span className="text-xs text-slate-400 flex items-center space-x-1.5">
              <HardDrive className="w-3.5 h-3.5 text-purple-400" />
              <span>Prover Memory</span>
            </span>
            <div className="text-2xl font-bold font-mono text-purple-300">{lastTestRun.memoryMb} MB</div>
            <span className="text-[10px] text-slate-400">Peak WASM heap RAM</span>
          </div>
        </div>
      ) : (
        <div className="p-8 bg-slate-950 border border-slate-800 rounded-xl text-center space-y-2">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-mono">Executing cryptographic pairings & constraint solver...</p>
        </div>
      )}

      {/* Technical Comparison Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 font-semibold text-xs text-slate-300 flex items-center justify-between">
          <span>Cryptographic Engine Properties</span>
          <span className="text-[11px] text-slate-500 font-mono">MOCK - DEMO BENCHMARK VALUES</span>
        </div>
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
            <tr>
              <th className="px-4 py-2 font-medium">Metric</th>
              <th className="px-4 py-2 font-medium text-cyan-400">BBS+ Multi-Message Signatures</th>
              <th className="px-4 py-2 font-medium text-purple-400">Groth16 Zero-Knowledge SNARK</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            <tr>
              <td className="px-4 py-2.5 text-slate-400">Primary Capability</td>
              <td className="px-4 py-2.5">Selective Attribute Disclosure</td>
              <td className="px-4 py-2.5">Bounded Range / Predicate Proofs</td>
            </tr>
            <tr>
              <td className="px-4 py-2.5 text-slate-400">Disclosed Attributes</td>
              <td className="px-4 py-2.5">Selected subsets of trusted claims</td>
              <td className="px-4 py-2.5">ZERO attributes (1-bit boolean proof)</td>
            </tr>
            <tr>
              <td className="px-4 py-2.5 text-slate-400">Setup Dependency</td>
              <td className="px-4 py-2.5 text-emerald-400">Transparent (No Trusted Setup)</td>
              <td className="px-4 py-2.5 text-amber-400">Per-Circuit Powers of Tau CRS</td>
            </tr>
            <tr>
              <td className="px-4 py-2.5 text-slate-400">Circuit Constraints</td>
              <td className="px-4 py-2.5 font-mono">0 R1CS (Elliptic Curve Pairings)</td>
              <td className="px-4 py-2.5 font-mono text-purple-300">14,280 R1CS constraints</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
