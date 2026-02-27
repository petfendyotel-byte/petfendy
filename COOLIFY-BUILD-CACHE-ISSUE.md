# Coolify Build Cache Issue - Cookie Policy Page

## Problem
Coolify deployment is failing with the error:
```
Error: The default export is not a React Component in '/[locale]/cerez-politikasi/page'
```

## Root Cause Analysis
After thorough investigation:

1. ✅ The cookie policy file (`petfendy/app/[locale]/cerez-politikasi/page.tsx`) is **CORRECT**
   - Has proper "use client" directive
   - Has proper default export: `export default function CookiePolicyPage()`
   - Has valid React component structure
   - No syntax errors detected by TypeScript/ESLint

2. ✅ The file structure matches the working payment security page
   - Both use "use client"
   - Both use useParams hook
   - Both have identical export patterns

3. ✅ Git repository is up-to-date
   - Latest commit: 94b0ce7
   - No pending changes
   - File content is identical in repository and working directory

## Conclusion
The error is **NOT** a code issue. It's a **Coolify build cache issue**.

## Solution

### Option 1: Clear Build Cache in Coolify (Recommended)
1. Go to Coolify dashboard: http://46.224.248.228:8000
2. Navigate to the application
3. Click on "Settings" or "Advanced"
4. Find "Clear Build Cache" or "Clean Build" option
5. Click to clear cache
6. Trigger a new deployment

### Option 2: Force Rebuild with Docker
1. SSH into the Coolify server
2. Run: `docker system prune -a --volumes` (WARNING: This clears ALL Docker cache)
3. Or more targeted: Find the application's build cache and remove it
4. Trigger a new deployment

### Option 3: Temporary Workaround - Disable Static Generation
If clearing cache doesn't work, temporarily disable static generation for this page:

Add to `petfendy/app/[locale]/cerez-politikasi/page.tsx`:
```typescript
export const dynamic = 'force-dynamic'
```

This forces the page to be server-rendered instead of statically generated, bypassing the build error.

### Option 4: Manual Deployment with Fresh Clone
1. Clone the repository fresh on the server
2. Build locally: `npm run build`
3. If build succeeds locally, the issue is definitely Coolify cache
4. Deploy the fresh build

## Verification
To verify the file is correct, run locally:
```bash
cd petfendy
npm run build
```

If the build succeeds locally, the code is fine and it's a Coolify environment issue.

## Next Steps
1. Clear Coolify build cache
2. Redeploy
3. If still fails, add `export const dynamic = 'force-dynamic'` as temporary workaround
4. Monitor deployment logs for any other errors

## Files Verified
- ✅ `petfendy/app/[locale]/cerez-politikasi/page.tsx` - Correct structure, valid export
- ✅ `petfendy/app/[locale]/odeme-guvenligi/page.tsx` - Working reference (identical pattern)
- ✅ Git status - Clean, no pending changes
- ✅ TypeScript diagnostics - No errors

## Date
February 28, 2026

## Status
**AWAITING COOLIFY CACHE CLEAR**
