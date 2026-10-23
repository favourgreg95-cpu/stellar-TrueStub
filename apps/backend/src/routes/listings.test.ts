import request from 'supertest';
import express from 'express';

// ── Module mocks (must be declared before imports) ─────────────────────────

jest.mock('../lib/firebase-admin', () => ({
  firebaseAuth: {
    verifyIdToken: jest.fn(),
  },
}));

jest.mock('../openapi/registry', () => ({
  registerRoute: jest.fn(),
}));

jest.mock('../services/listing-fraud.service', () => ({
  assessListingRisk: jest.fn(),
}));

jest.mock('../services/listing-alert.service', () => ({
  listingAlertService: {
    notifyNewListing: jest.fn(),
    notifySavedSearchMatches: jest.fn(),
    notifyListingUpdate: jest.fn(),
  },
}));

import { firebaseAuth } from '../lib/firebase-admin';
import { listingsRouter } from './listings';

const mockedVerify = firebaseAuth.verifyIdToken as jest.Mock;

// ── App factory ─────────────────────────────────────────────────────────────

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/listings', listingsRouter);
  return app;
}

const VALID_TOKEN = 'Bearer valid-token';
const DECODED = { uid: 'user-123' };

function stubAuth() {
  mockedVerify.mockResolvedValue(DECODED);
}

// ─────────────────────────────────────────────────────────────────────────────
// Authentication guard (issue #369)
// ─────────────────────────────────────────────────────────────────────────────

describe('listings route (HTTP layer) — authentication', () => {
  let app: express.Express;

  beforeEach(() => {
    jest.clearAllMocks();
    app = buildApp();
  });

  it('rejects unauthenticated POST / with 401', async () => {
    const res = await request(app)
      .post('/api/listings')
      .send({ id: 'l1', eventName: 'Concert', price: 100 });

    expect(res.status).toBe(401);
  });

  it('rejects unauthenticated PATCH /:id with 401', async () => {
    const res = await request(app)
      .patch('/api/listings/l1')
      .send({ eventName: 'Concert', price: 100 });

    expect(res.status).toBe(401);
  });

  it('rejects unauthenticated POST /risk-check with 401', async () => {
    const res = await request(app)
      .post('/api/listings/risk-check')
      .send({
        listing: { eventName: 'Concert', sellerId: 's1' },
        existingListings: [],
      });

    expect(res.status).toBe(401);
  });

  it('returns 401 when the Firebase token is invalid', async () => {
    mockedVerify.mockRejectedValue(new Error('invalid token'));

    const res = await request(app)
      .post('/api/listings')
      .set('Authorization', 'Bearer bad-token')
      .send({ id: 'l1', eventName: 'Concert', price: 100 });

    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Authenticated write paths (sanity check — auth passes through)
// ─────────────────────────────────────────────────────────────────────────────

describe('listings route (HTTP layer) — authenticated', () => {
  let app: express.Express;

  beforeEach(() => {
    jest.clearAllMocks();
    stubAuth();
    app = buildApp();
  });

  it('lets an authenticated POST / pass auth and return 400 for invalid payload', async () => {
    const res = await request(app)
      .post('/api/listings')
      .set('Authorization', VALID_TOKEN)
      .send({});

    expect(res.status).toBe(400);
  });

  it('lets an authenticated PATCH /:id pass auth and return 400 for invalid payload', async () => {
    const res = await request(app)
      .patch('/api/listings/l1')
      .set('Authorization', VALID_TOKEN)
      .send({});

    expect(res.status).toBe(400);
  });

  it('lets an authenticated POST /risk-check pass auth and return 400 for invalid payload', async () => {
    const res = await request(app)
      .post('/api/listings/risk-check')
      .set('Authorization', VALID_TOKEN)
      .send({});

    expect(res.status).toBe(400);
  });
});
