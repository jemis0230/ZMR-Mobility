# Impact figures: fuel saved

## Finding (October 2026)

The website showed **"198 Lakh L — Fuel Saved"** on the home page and the About page.

- The figure is **hardcoded** in the page code (no database value, no calculation).
- It was introduced in the commit "version v2" (27 May 2026), replacing the earlier
  **"142,666 L"**. No source, period, scope or efficiency assumption was recorded.
- 198 lakh litres = **19,800,000 litres** (1 lakh = 100,000). A screenshot showing
  "1.98 Lakh L" (198,000 litres) is a different value, 100 times smaller.
- The site also shows **"176 Lakh Km"** green kilometres (17,600,000 km). Read together:
  - 19,800,000 L would mean **0.89 km per litre**, which is impossible for a petrol two-wheeler;
  - 198,000 L would mean **88.9 km per litre**, above typical petrol scooters and motorcycles;
  - 142,666 L would mean **123 km per litre**.

  None of these reconciles, so the fuel figure cannot be validated from the published
  numbers.
- The CO₂ figure (200 tonnes) also does not follow directly from either litre value
  (burning 1 litre of petrol emits roughly 2.3 kg CO₂). It is left unchanged and
  **flagged** for the team to check; it may be a net figure after electricity emissions.

**Action taken:** the number is no longer displayed. The card now reads
"Estimated petrol avoided — Being verified". CO₂, women entrepreneurs, plastics and the
km figure are unchanged.

## Formula (implemented in `src/lib/impact.ts`, tested by `npm test`)

```
petrol avoided (litres) = Σ over vehicle classes:
    eligible electric km of the class ÷ km per litre of a comparable petrol vehicle
```

Each vehicle class (e.g. scooter, motorcycle, 3-wheeler cargo) uses its own efficiency.
The result is shown as "Estimated petrol avoided", formatted as litres below 1 lakh and as
"x.xx lakh L" from 1 lakh, with the period and scope in a note.

## Information needed to publish a figure

1. **Electric kilometres per vehicle class** for the period (from IoT/telematics or
   odometer records), with the export or report they come from.
2. **Reporting period** (start and end date).
3. **Fleet scope** — which vehicles are included (ZMR-owned, leased, rented, sold; which
   cities).
4. **Comparable petrol efficiency (km per litre) per class**, with its source.
5. **Who approves** the published figure.

When these are available, fill `FUEL_SAVINGS_INPUT` in `src/lib/impact.ts`. The site then
shows the calculated, labelled estimate automatically.
