// Run with: npm test  (Node's built-in test runner; TypeScript types are stripped by Node)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { estimatePetrolAvoidedLitres, formatLitres, publicFuelSavings, LITRES_PER_LAKH, FUEL_SAVINGS_INPUT } from '../src/lib/impact.ts';

test('1 lakh litres is 100,000 litres', () => {
  assert.equal(LITRES_PER_LAKH, 100_000);
});

test('litres are converted to lakh exactly once', () => {
  assert.equal(formatLitres(198_000), '1.98 lakh L');
  assert.equal(formatLitres(19_800_000), '198 lakh L');
  assert.equal(formatLitres(100_000), '1 lakh L');
  assert.equal(formatLitres(150_000), '1.5 lakh L');
});

test('below one lakh uses Indian digit grouping in litres', () => {
  assert.equal(formatLitres(98_765), '98,765 L');
  assert.equal(formatLitres(0), '0 L');
  assert.equal(formatLitres(1234.4), '1,234 L');
});

test('formula: electric km ÷ comparable petrol km/litre, summed per class', () => {
  const litres = estimatePetrolAvoidedLitres([
    { vehicleClass: 'Electric scooter', electricKm: 450_000, petrolKmPerLitre: 45 }, // 10,000 L
    { vehicleClass: 'Electric 3-wheeler cargo', electricKm: 250_000, petrolKmPerLitre: 25 }, // 10,000 L
  ]);
  assert.equal(litres, 20_000);
});

test('a class-specific assumption is not applied to other classes', () => {
  const mixed = estimatePetrolAvoidedLitres([
    { vehicleClass: 'Scooter', electricKm: 100_000, petrolKmPerLitre: 50 },
    { vehicleClass: 'Car', electricKm: 100_000, petrolKmPerLitre: 15 },
  ]);
  const scooterOnly = 200_000 / 50;
  assert.notEqual(Math.round(mixed), scooterOnly);
  assert.equal(Math.round(mixed), Math.round(100_000 / 50 + 100_000 / 15));
});

test('missing or invalid inputs are rejected, never guessed', () => {
  assert.throws(() => estimatePetrolAvoidedLitres([]));
  assert.throws(() => estimatePetrolAvoidedLitres([{ vehicleClass: 'Scooter', electricKm: 1000, petrolKmPerLitre: 0 }]));
  assert.throws(() => estimatePetrolAvoidedLitres([{ vehicleClass: 'Scooter', electricKm: Number.NaN, petrolKmPerLitre: 40 }]));
  assert.throws(() => estimatePetrolAvoidedLitres([{ vehicleClass: '', electricKm: 1000, petrolKmPerLitre: 40 }]));
  assert.throws(() => formatLitres(-1));
});

test('without verified inputs the site shows no fuel number', () => {
  assert.equal(FUEL_SAVINGS_INPUT, null);
  const shown = publicFuelSavings();
  assert.equal(shown.available, false);
  assert.equal('display' in shown, false);
  assert.match(shown.label, /Estimated/);
});

test('with verified inputs the figure is labelled as an estimate with its scope and period', () => {
  const shown = publicFuelSavings({
    segments: [{ vehicleClass: 'Scooter', electricKm: 9_900_000, petrolKmPerLitre: 50 }],
    periodFrom: '2025-04-01',
    periodTo: '2026-03-31',
    scope: 'example fleet',
    source: 'example',
    approvedBy: 'example',
  });
  assert.equal(shown.available, true);
  if (shown.available) {
    assert.equal(shown.litres, 198_000);
    assert.equal(shown.display, '1.98 lakh L');
    assert.match(shown.label, /^Estimated/);
    assert.match(shown.note, /2025-04-01 to 2026-03-31/);
  }
});
