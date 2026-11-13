interface Attestation {
  keyId: string;
  publicKey: string;
  signCount: number;
}

const CHALLANGES: Record<string, string> = {};
const ATTESTATIONS: Record<string, Attestation> = {};

const db = {
  findChallenge: (challenge: string): string | undefined => CHALLANGES[challenge],
  storeChallenge: (challenge: string): void => {
    CHALLANGES[challenge] = challenge;
  },
  deleteChallenge: (challenge: string): void => {
    delete CHALLANGES[challenge];
  },
  storeAttestation: (attestation: Pick<Attestation, 'keyId'> & Partial<Attestation>): void => {
    ATTESTATIONS[attestation.keyId] = { ...ATTESTATIONS[attestation.keyId], ...attestation } as Attestation;
  },
  findAttestation: (keyId: string): Attestation | undefined => ATTESTATIONS[keyId],
};

export default db;
