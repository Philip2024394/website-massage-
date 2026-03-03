# Price layout: 60min 90min 120min + prices on one line each

## Desired layout
- **Line 1:** 60min  90min  120min (one row)
- **Line 2:** price for 60  |  price for 90  |  price for 120 (one row, each under its duration)

## Why it wasn't staying on one line

### 1. **Flex child not shrinking (`min-w-0`)**
- The price block lives in a flex container (`flex-1 min-w-0`). The **grid** inside did not have `min-w-0`.
- Without `min-w-0`, the grid's minimum width follows its content, so the flex item couldn't shrink and could overflow or push layout (e.g. card, thumbnail) in narrow viewports.
- **Fix:** Add `min-w-0 w-full` on the grid so it can shrink inside the flex child and stay within the card.

### 2. **Text wrapping inside cells**
- By default, text in grid cells can wrap when the column is narrow (e.g. "120min" or "Rp 150.000" breaking into two lines).
- That made the **duration row** or **price row** look like more than one line.
- **Fix:** Add `whitespace-nowrap` on:
  - Duration labels (60min, 90min, 120min)
  - Price cells (or their container) so each price stays on one line per column.

### 3. **Grid row structure**
- Using only `grid-cols-3` with 6 children relies on default grid flow. Making the two-row layout explicit avoids any flow quirks.
- **Fix:** Use `grid-rows-2` (or `grid-template-rows: auto auto`) so the grid is clearly 2 rows × 3 columns: row 1 = durations, row 2 = prices.

### 4. **Card `overflow-hidden`**
- The card has `overflow-hidden`, so if the inner content was too wide it got clipped instead of wrapping.
- Together with fix (1), giving the grid `min-w-0` keeps the grid within the card and avoids clipping while keeping both lines single rows.

## Summary of code changes
- **TherapistPricingGrid.tsx** and **PlacePricing.tsx**:  
  - Grid: `min-w-0 w-full`, `grid-cols-3 grid-rows-2`, `gap-x-1 gap-y-0`.  
  - Duration cells: `whitespace-nowrap`.  
  - Price cells: `whitespace-nowrap` and `min-w-0` / `overflow-hidden` where needed so the price row stays one line and aligns under 60min, 90min, 120min.

## Files touched
- `src/modules/therapist/TherapistPricingGrid.tsx`
- `src/modules/massage-place/PlacePricing.tsx`
