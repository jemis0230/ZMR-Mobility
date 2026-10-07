# Original images (not published)

Unedited source files kept for reference. The website serves the edited copies in `public/`:

| Original | Published edit | Change |
| --- | --- | --- |
| `person_holding_key.webp` | `public/hero-handover.webp` | Old ZMR logo on the yellow sign replaced with the approved ZMR Mobility logo on a cream sign |
| `category-images/*.webp` | `public/category-images/*.webp` and `*-v2.webp` | Old ZMR stickers on the vehicle panels replaced with the approved logo |

The `*-v2.webp` copies are referenced from code so optimised-image caches pick up the new artwork; the
original paths are overwritten with the same edit because existing vehicle records point at them.
