# Development Guide

## Prerequisites
- Node.js and npm installed
- Home Assistant instance with Flight Status Tracker integration

## Local Development
1. Install dependencies:
   - `npm install`
2. Build bundle:
   - `npm run build`

Generated outputs:
- `build/` (TypeScript compile output)
- `flight-status-tracker-cards.js` (HACS frontend artifact)

## Manual Validation Checklist
1. Add/update frontend resource in Home Assistant:
   - `/hacsfiles/hacs-flight-status-cards/flight-status-tracker-cards.js`
2. Refresh browser cache / hard reload.
3. Confirm cards are available in picker:
   - Flight List
   - Add Flight
   - Remove Flight
   - Diagnostics & Control
4. Verify behaviors:
   - Add card buttons call preview/confirm/clear.
   - Remove card select + remove action works.
   - Diagnostics card buttons trigger refresh/remove/dir refresh.

## Troubleshooting
- If cards do not update, clear browser cache and restart HA frontend.
- If services fail, verify integration entities exist and IDs match defaults or your card config overrides.
