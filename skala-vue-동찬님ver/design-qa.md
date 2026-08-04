# Design QA

- Source visual truth: `카드 상세1.jpeg`, `카드 상세2.jpeg` (user-provided mobile references, 648 x 1436 px)
- Implementation: local Vue app at `http://127.0.0.1:5174/`
- Intended viewport/state: desktop city dashboard with the responsive weather detail panel open; mobile bottom-sheet state below 600 px
- Implementation screenshot: unavailable
- Density normalization: not performed because browser-rendered evidence could not be captured

## Full-view comparison evidence

Blocked. The in-app browser could not access the local preview because its admin-enforced security policy could not be verified. Build output and source inspection are not substitutes for rendered evidence.

## Focused region comparison evidence

Blocked for the same reason. The city header, outfit briefing, hourly rain timeline, metrics grid, and responsive mobile state could not be visually compared with the reference.

## Functional verification completed

- 18 supported cities have stable API slugs and demo data profiles.
- Sunny, rainy, cloudy, overcast, UV, air-quality, sunrise, sunset, hourly probability, and rainfall fields are covered by unit tests.
- Rainy-city advice includes an umbrella recommendation.
- Rapid city switching is protected against stale request results.
- All 23 automated tests pass and the production build succeeds.

## Findings

- [P1] Rendered visual comparison unavailable.
  - Impact: responsive layout, clipping, typography, spacing, color, image quality, and final interaction polish cannot be certified from browser evidence.
  - Fix: reopen the local preview when browser policy verification is available, capture desktop and mobile panel states, and repeat visual QA.

## Required fidelity surfaces

- Fonts and typography: blocked pending rendered capture.
- Spacing and layout rhythm: blocked pending rendered capture.
- Colors and visual tokens: blocked pending rendered capture.
- Image quality and asset fidelity: blocked pending rendered capture; the current MVP character remains a temporary coded placeholder rather than final character artwork.
- Copy and content: source-reviewed and covered functionally, but line wrapping remains pending visual capture.

## Comparison history

- Pass 1: blocked before comparison because browser security policy verification was unavailable; no visual fixes were claimed.

## Implementation checklist

- Capture a desktop panel for a sunny city.
- Capture a desktop panel for a rainy city and confirm rainfall rows.
- Capture the mobile bottom-sheet state below 600 px.
- Check console errors and repeat the reference/implementation comparison.
- Replace the temporary character placeholder with approved weather/outfit assets in a separate visual pass.

final result: blocked
