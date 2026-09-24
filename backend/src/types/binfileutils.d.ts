declare module '@iden3/binfileutils' {
  export function createBinFile(
    fileName: string,
    fileType: string,
    version: number,
    nSections: number,
  ): Promise<any>;
  export function startWriteSection(fd: any, sectionId: number): Promise<void>;
  export function endWriteSection(fd: any, sectionId?: number): Promise<void>;
  export function writeBigInt(fd: any, num: bigint, nBytes: number): Promise<void>;
}
