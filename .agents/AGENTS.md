# KinCare Agent Architecture & Protection Rules

## Modular Structure Rules
1. Never put feature-specific logic in `js/core.js` or `js/nav.js`.
2. Keep `kincare-automation.js` isolated for Checkr background checks, applicant auto-categorization, and roster logic.
3. Always run `node .gemini/validate.js` before deploying to Netlify.
4. Keep file lines under 500 lines for JavaScript modules.

## Deployment Command
```bash
node .gemini/validate.js && git add -A && git commit -m "Description" && npx netlify-cli deploy --prod --dir "." --message "Deployment"
```
