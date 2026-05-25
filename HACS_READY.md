# HACS Readiness Checklist

- [x] `hacs.json` present
- [x] `README.md` present
- [x] Frontend artifact built at repository root:
  - `flight-status-tracker-cards.js`
- [x] `.gitignore` excludes `node_modules/` and build intermediates
- [x] Card metadata exposed via `window.customCards`

## Release Checklist
1. Run `npm install` (if needed)
2. Run `npm run build`
3. Commit source + metadata + built artifact
4. Create GitHub release tag (after confirmation)
