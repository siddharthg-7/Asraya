declare module '@mattrglobal/bbs-signatures' {
  export interface BlsKeyPair {
    readonly publicKey: Uint8Array;
    readonly secretKey?: Uint8Array;
  }

  export type Bls12381G2KeyPair = Required<BlsKeyPair>;

  export interface BbsVerifyResult {
    readonly verified: boolean;
    readonly error?: string;
  }

  export function generateBls12381G2KeyPair(seed?: Uint8Array): Promise<Required<BlsKeyPair>>;

  export function blsSign(request: {
    readonly keyPair: BlsKeyPair;
    readonly messages: readonly Uint8Array[];
  }): Promise<Uint8Array>;

  export function blsVerify(request: {
    readonly publicKey: Uint8Array;
    readonly messages: readonly Uint8Array[];
    readonly signature: Uint8Array;
  }): Promise<BbsVerifyResult>;

  export function blsCreateProof(request: {
    readonly signature: Uint8Array;
    readonly publicKey: Uint8Array;
    readonly messages: readonly Uint8Array[];
    readonly nonce: Uint8Array;
    readonly revealed: readonly number[];
  }): Promise<Uint8Array>;

  export function blsVerifyProof(request: {
    readonly publicKey: Uint8Array;
    readonly proof: Uint8Array;
    readonly messages: readonly Uint8Array[];
    readonly nonce: Uint8Array;
  }): Promise<BbsVerifyResult>;
}
