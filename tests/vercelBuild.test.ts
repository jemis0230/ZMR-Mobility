import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const { databasePlan } = createRequire(import.meta.url)('../scripts/vercel-build.js');

const PROD_URL = 'postgresql://u:secret@ep-prod-123.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
const PREVIEW_URL = 'postgresql://u:secret@ep-preview-456.c-4.ap-southeast-1.aws.neon.tech/zmr_preview?sslmode=require';

test('production migrates and seeds', () => {
  assert.equal(databasePlan({ VERCEL_ENV: 'production', DATABASE_URL: PROD_URL }).action, 'migrate-and-seed');
});

test('preview without the flag never touches the database', () => {
  assert.equal(databasePlan({ VERCEL_ENV: 'preview', DATABASE_URL: PROD_URL }).action, 'skip');
  assert.equal(databasePlan({ VERCEL_ENV: 'preview', DATABASE_URL: PROD_URL, PREVIEW_DB_ISOLATED: '  ' }).action, 'skip');
});

test('preview migrates only when the flag names its own database host', () => {
  const plan = databasePlan({ VERCEL_ENV: 'preview', DATABASE_URL: PREVIEW_URL, PREVIEW_DB_ISOLATED: 'ep-preview-456.c-4.ap-southeast-1.aws.neon.tech' });
  assert.equal(plan.action, 'migrate');
  assert.match(plan.message, /ep-preview-456.*\/zmr_preview/);
  assert.doesNotMatch(plan.message, /secret/);
});

test('a plain "1" or a host for another database is refused', () => {
  assert.equal(databasePlan({ VERCEL_ENV: 'preview', DATABASE_URL: PROD_URL, PREVIEW_DB_ISOLATED: '1' }).action, 'refuse');
  // Flag set for the preview host, but DATABASE_URL (e.g. inherited) points at production.
  const plan = databasePlan({ VERCEL_ENV: 'preview', DATABASE_URL: PROD_URL, PREVIEW_DB_ISOLATED: 'ep-preview-456.c-4.ap-southeast-1.aws.neon.tech' });
  assert.equal(plan.action, 'refuse');
  assert.doesNotMatch(plan.message, /secret|ep-prod/);
});

test('missing or invalid DATABASE_URL with the flag is refused', () => {
  assert.equal(databasePlan({ VERCEL_ENV: 'preview', PREVIEW_DB_ISOLATED: 'ep-preview-456' }).action, 'refuse');
  assert.equal(databasePlan({ VERCEL_ENV: 'preview', DATABASE_URL: 'not a url', PREVIEW_DB_ISOLATED: 'x' }).action, 'refuse');
});
