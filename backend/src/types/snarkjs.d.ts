declare module 'snarkjs' {
  export const groth16: {
    fullProve: (
      input: unknown,
      wasmFile: string,
      zkeyFile: string,
    ) => Promise<{ proof: any; publicSignals: string[] }>;
    prove: (zkeyFile: string, wtnsFile: string) => Promise<{ proof: any; publicSignals: string[] }>;
    verify: (vKey: unknown, publicSignals: unknown, proof: unknown) => Promise<boolean>;
    exportSolidityCallData: (proof: unknown, publicSignals: unknown) => Promise<string>;
  };
  export const curves: {
    getCurveFromName: (name: string) => Promise<any>;
  };
  export const powersOfTau: any;
  export const zKey: any;
  export const wtns: any;
  export const r1cs: any;
}
