import express from 'express';
import { v4 as uuid } from 'uuid';
import bodyParser from 'body-parser';
import { verifyAttestation } from 'node-app-attest';
import tratschtante from 'tratschtante';
import db from './db.js';

const log = tratschtante({ level: 'debug' });
const app = express();
app.use(bodyParser.json());
const port = 3000;

const API_PREFIX = '/v1';

const BUNDLE_IDENTIFIER = 'io.uebelacker.AppAttestExample';
const TEAM_IDENTIFIER = 'V8H6LQ9448';

app.get(`${API_PREFIX}/attest/challenge`, (req, res) => {
  const challenge = uuid();
  db.storeChallenge(challenge);
  log.debug(`challange was requested, returning ${challenge}`);
  res.send(JSON.stringify({ challenge }));
});

app.post(`${API_PREFIX}/attest/verify`, (req, res) => {
  try {
    log.debug(`verify was requested: ${JSON.stringify(req.body, null, 2)}`);

    // verify the challenge
    if (!db.findChallenge(req.body.challenge)) {
      throw new Error('Invalid challenge');
    }

    // verify the attestation
    const result = verifyAttestation({
      attestation: Buffer.from(req.body.attestation, 'base64'),
      challenge: req.body.challenge,
      keyId: req.body.keyId,
      bundleIdentifier: BUNDLE_IDENTIFIER,
      teamIdentifier: TEAM_IDENTIFIER,
      allowDevelopmentEnvironment: true,
    });

    log.debug(`attestation result: ${JSON.stringify(result, null, 2)}`);

    // store the client certificate
    // IMPORTANT: store the client certificate in a database! this is only for testing purposes
    // CLIENT_CERTIFICATES[result.keyId] = result.value;

    res.sendStatus(204);
    db.deleteChallenge(req.body.challenge);
  } catch (error) {
    log.error(error);
    res.status(401).send({ error: 'Unauthorized' });
  }
});

app.post(`${API_PREFIX}/send-message`, (req, res) => {
  try {
    const { assertion, hash, body } = req.headers;
    log.debug(`assertion: ${assertion}`);
    log.debug(`hash: ${hash}`);
    log.debug(`body: ${body}`);
    log.debug(`send-message: ${JSON.stringify(req.body)}`);

    res.sendStatus(401);
  } catch (error) {
    log.error(error);
    res.status(401).send({ error: 'Unauthorized' });
  }
});

app.listen(port, () => {
  log.info(`listening on port ${port}`);
});
