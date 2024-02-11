const CLIENT_CERTIFICATES = {};
const CHALLANGES = [];

const db = {
  findChallenge: (challenge) => CHALLANGES[challenge],
  storeChallenge: (challenge) => { CHALLANGES[challenge] = challenge; },
  deleteChallenge: (challenge) => { delete CHALLANGES[challenge]; },
};

export default db;
