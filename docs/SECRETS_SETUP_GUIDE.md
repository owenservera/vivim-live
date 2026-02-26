# Secrets Setup Guide - AI Documentation Pipeline

This guide walks you through setting up all required secrets for the automated documentation pipeline.

---

## Required Secrets

### 1. ZAI_API_KEY (Required)
Your z.ai API key for generating documentation.

| Field | Value |
|-------|-------|
| Name | `ZAI_API_KEY` |
| Value | `3b4e3003c9534dd68e3f0ef8dacfb80a.jFvLL8R4QD3K8TVl` |
| Repository | vivim-live |

---

### 2. GH_TOKEN (Required)
GitHub Personal Access Token with appropriate permissions.

#### How to create:

1. **Go to**: https://github.com/settings/tokens/new

2. **Select scopes** (check all boxes):
   - ✅ `repo` - Full control of private repositories
   - ✅ `repo:status` - Access commit statuses
   - ✅ `public_repo` - Access public repositories

3. **Generate token**:
   - Note: `vivim-docs-pipeline`
   - Expiration: `No expiration` (or 90 days)

4. **Copy the token** (starts with `ghp_`)

| Field | Value |
|-------|-------|
| Name | `GH_TOKEN` |
| Value | `ghp_xxxxxxxxxxxxxxxxxxxx` |
| Repository | vivim-live |

---

### 3. VERCEL_DEPLOY_HOOK (Optional but Recommended)
Vercel Deploy Hook to trigger builds.

#### How to create:

1. **Go to**: Vercel Dashboard → Your Project → Settings → Git → Deploy Hooks

2. **Create hook**:
   - Name: `Documentation Update`
   - Branch: `main`

3. **Copy the URL** (looks like):
   ```
   https://api.vercel.com/v1/integrations/deploy/prj_xxxxxxx/xxxxxxxxx
   ```

| Field | Value |
|-------|-------|
| Name | `VERCEL_DEPLOY_HOOK` |
| Value | `https://api.vercel.com/v1/integrations/deploy/prj_xxx/xxx` |
| Repository | vivim-live |

> **Note**: If you skip this, Vercel will still auto-deploy on git push (default behavior).

---

## Setup Instructions (Step by Step)

### Step 1: Add Secrets to vivim-live Repository

1. Open: https://github.com/owenservera/vivim-live/settings/secrets/actions

2. Click **"New repository secret"** for each secret:

   **Secret 1: ZAI_API_KEY**
   - Name: `ZAI_API_KEY`
   - Value: `3b4e3003c9534dd68e3f0ef8dacfb80a.jFvLL8R4QD3K8TVl`

   **Secret 2: GH_TOKEN**
   - Name: `GH_TOKEN`
   - Value: (your GitHub PAT)

   **Secret 3: VERCEL_DEPLOY_HOOK** (optional)
   - Name: `VERCEL_DEPLOY_HOOK`
   - Value: (your Vercel hook URL)

---

### Step 2: Add GH_TOKEN to vivi-app (for cross-repo trigger)

If you want the vivi-app → vivim-live push trigger to work:

1. Open: https://github.com/owenservera/vivi-app/settings/secrets/actions

2. Add secret:
   - Name: `GH_TOKEN`
   - Value: (same GitHub PAT - needs access to both repos)

---

### Step 3: Verify Vercel Project ID (if needed)

If you want to use Vercel API directly instead of deploy hooks:

1. Go to Vercel Dashboard → Your Project → Settings → General

2. Find **Project ID** (starts with `prj_`)

3. Add as secret:
   - Name: `VERCEL_PROJECT_ID`
   - Value: `prj_xxxxxxx`

---

## Verification

After setting up secrets, verify the pipeline works:

### Test 1: Manual Workflow Trigger

```bash
# Trigger the documentation pipeline manually
gh workflow run auto-docs.yml --repo owenservera/vivim-live
```

### Test 2: Check Workflow Run

1. Go to: https://github.com/owenservera/vivim-live/actions
2. Look for "AI Documentation Pipeline"
3. Click on the run to see progress

### Test 3: Verify Documentation Generated

After successful run:
1. Check: https://github.com/owenservera/vivim-live/tree/main/docs/docs/auto-generated
2. You should see new `.md` files with AI-generated content

### Test 4: Verify Vercel Deployment

1. Check Vercel Dashboard → Deployments
2. New deployment should appear after docs are committed

---

## Troubleshooting

### Issue: "ZAI_API_KEY" is invalid
- Verify the API key is correct
- Check: https://z.ai/manage-apikey/apikey-list

### Issue: "GH_TOKEN" permission denied
- Ensure token has `repo` scope
- Verify token hasn't expired

### Issue: Workflow not triggering
- Check Actions tab for errors
- Verify secrets are set correctly

### Issue: Vercel not deploying
- Check Vercel is connected to vivim-live repo
- Verify `VERCEL_DEPLOY_HOOK` is valid
- Note: Git push auto-deploy should still work

---

## Cost Monitoring

Track your z.ai usage:

1. Go to: https://z.ai/dashboard/usage
2. Monitor:
   - API calls
   - Token usage
   - Current billing

### Estimated Costs
- **Per documentation update**: ~$0.003 (GLM-4.7)
- **Monthly** (10 updates/day): ~$0.90/month
- **Monthly** (100 updates/day): ~$9.00/month

---

## Security Notes

1. **Never expose secrets in code** - Always use `${{ secrets.SECRET_NAME }}`
2. **Rotate tokens regularly** - Update GH_TOKEN every 90 days
3. **Monitor usage** - Check z.ai dashboard for anomalies
4. **Audit log** - Review GitHub Actions logs for suspicious activity

---

## Quick Reference

| Secret | Required | Where to Get |
|--------|----------|--------------|
| `ZAI_API_KEY` | ✅ Yes | z.ai dashboard |
| `GH_TOKEN` | ✅ Yes | github.com/settings/tokens |
| `VERCEL_DEPLOY_HOOK` | ❌ No | Vercel → Settings → Deploy Hooks |

---

## Next Steps

1. ✅ Set up secrets (this guide)
2. ⬜ Test manual workflow trigger
3. ⬜ Verify docs generation
4. ⬜ Set up vivi-app trigger (optional)
5. ⬜ Monitor and optimize
