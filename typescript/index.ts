import bodyParser from 'body-parser';
import express, { Request, Response } from 'express';
import { verifyAttestation, verifyAssertion } from 'node-app-attest';
import tratschtante from 'tratschtante';
import { v4 as uuid } from 'uuid';
import db from './db.js';

interface Attestation {
  keyId: string;
  publicKey: string;
  signCount: number;
}

interface AttestationRequest {
  attestation: string;
  challenge: string;
  keyId: string;
}

interface Authentication {
  assertion: string;
  keyId: string;
}

interface SendMessageRequest {
  challenge: string;
  message: string;
  title: string;
}

const log = tratschtante({ level: 'debug' });
const app = express();
app.use(bodyParser.json());
const port = 3000;

const API_PREFIX = '/v1';

const BUNDLE_IDENTIFIER = 'io.uebelacker.AppAttestExample';
const TEAM_IDENTIFIER = 'V8H6LQ9448';

app.get(`${API_PREFIX}/attest/challenge`, (req: Request, res: Response) => {
  const challenge = uuid();
  db.storeChallenge(challenge);
  log.debug(`challange was requested, returning ${challenge}`);
  res.send(JSON.stringify({ challenge }));
});

app.post(`${API_PREFIX}/attest/verify`, (req: Request, res: Response) => {
  try {
    log.debug(`verify was requested: ${JSON.stringify(req.body, null, 2)}`);

    const payload = req.body as AttestationRequest;

    if (!db.findChallenge(payload.challenge)) {
      throw new Error('Invalid challenge');
    }

    const result = verifyAttestation({
      attestation: Buffer.from(payload.attestation, 'base64'),
      challenge: payload.challenge,
      keyId: payload.keyId,
      bundleIdentifier: BUNDLE_IDENTIFIER,
      teamIdentifier: TEAM_IDENTIFIER,
      allowDevelopmentEnvironment: true,
    });

    log.debug(`attestation result: ${JSON.stringify(result, null, 2)}`);

    db.storeAttestation({ keyId: payload.keyId, publicKey: result.publicKey as string, signCount: 0 } as Attestation);

    res.sendStatus(204);
    db.deleteChallenge(payload.challenge);
  } catch (error) {
    log.error(error);
    res.status(401).send({ error: 'Unauthorized' });
  }
});

app.post(`${API_PREFIX}/send-message`, (req: Request, res: Response) => {
  try {
    const authentication = req.headers.authentication as string;

    if (!authentication) {
      throw new Error('No authentication header');
    }

    const { keyId, assertion } = JSON.parse(Buffer.from(authentication, 'base64').toString()) as Authentication;

    if (keyId === undefined || assertion === undefined) {
      throw new Error('Invalid authentication');
    }

    const payload = req.body as SendMessageRequest;

    if (!db.findChallenge(payload.challenge)) {
      throw new Error('Invalid challenge');
    }

    db.deleteChallenge(payload.challenge);

    const attestation = db.findAttestation(keyId);

    if (!attestation) {
      throw new Error('No attestation found');
    }

    const result = verifyAssertion({
      assertion: Buffer.from(assertion, 'base64'),
      payload: JSON.stringify(req.body),
      publicKey: attestation.publicKey,
      bundleIdentifier: BUNDLE_IDENTIFIER,
      teamIdentifier: TEAM_IDENTIFIER,
      signCount: attestation.signCount,
    });

    db.storeAttestation({ keyId, signCount: result.signCount as number } as Attestation);

    log.debug(`Received message: ${JSON.stringify(req.body)}`);

    res.sendStatus(204);
  } catch (error) {
    log.error(error);
    res.status(401).send({ error: 'Unauthorized' });
  }
});

app.listen(port, () => {
  log.info(`listening on port ${port}`);
});
