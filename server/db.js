const CHALLANGES = [];
const ATTESTATIONS = {};
const db = {
  findChallenge: (challenge) => CHALLANGES[challenge],
  storeChallenge: (challenge) => { CHALLANGES[challenge] = challenge; },
  deleteChallenge: (challenge) => { delete CHALLANGES[challenge]; },
  storeAttestation: (attestation) => {
    if (ATTESTATIONS[attestation.keyId]) {
      ATTESTATIONS[attestation.keyId] = { ...ATTESTATIONS[attestation.keyId], ...attestation };
    } else {
      ATTESTATIONS[attestation.keyId] = attestation;
    }
  },
  findAttestation: (keyId) => ATTESTATIONS[keyId],
};

export default db;
