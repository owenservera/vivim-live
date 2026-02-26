# Automated AI Documentation Pipeline - Design Document

## Project Overview

**Goal**: Create a fully automated closed-loop documentation system that:
1. Monitors the `vivi-app` GitHub repository for code changes
2. Uses z.ai API (GLM-4.7 model) to generate/update documentation automatically
3. Commits and pushes changes to the `vivim-live` repository
4. Triggers Vercel deployment automatically

---

## Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌───────────────────┐
│   vivi-app      │     │   GitHub Action  │     │   vivim-live      │
│   (source)      │────▶│   (workflow)     │────▶│   (docs target)   │
└─────────────────┘     └──────────────────┘     └───────────────────┘
                               │
                               ▼
                        ┌──────────────────┐
                        │   z.ai API       │
                        │   (GLM-4.7)      │
                        │   docs gen       │
                        └──────────────────┘
                               │
                               ▼
                        ┌──────────────────┐
                        │   Vercel         │
                        │   (deploy)       │
                        └──────────────────┘
```

---

## System Components

### 1. GitHub Repository Structure

**Source Repository**: `owenservera/vivi-app` (or `vivim/vivim-app`)
- Contains source code that needs documentation

**Target Repository**: `owenservera/vivim-live`
- Contains Docusaurus docs at `/docs`
- Deployed to `vivim.live/docs`

### 2. Documentation Site

- **Framework**: Docusaurus
- **Location**: `C:\0-BlackBoxProject-0\vivim-live\docs`
- **Build Command**: `bun run build:docs`
- **Output**: `docs/build`

---

## z.ai API Configuration

### Endpoint
```
Base URL: https://api.z.ai/api/coding/paas/v4
```

### Authentication
```bash
Authorization: Bearer 3b4e3003c9534dd68e3f0ef8dacfb80a.jFvLL8R4QD3K8TVl
```

### Model
- **Model ID**: `glm-4.7`
- **Context Window**: 128K tokens
- **Pricing**: $0.60/1M input, $2.20/1M output

### API Request Format
```json
POST /chat/completions
Content-Type: application/json
Authorization: Bearer <API_KEY>

{
  "model": "glm-4.7",
  "messages": [
    {
      "role": "system",
      "content": "You are a technical documentation generator. Analyze code changes and generate comprehensive documentation in Markdown format suitable for Docusaurus. Include code examples, API references, and usage patterns."
    },
    {
      "role": "user",
      "content": "Generate documentation for the following code changes:\n\n{code_diff}\n\nOutput in Markdown format with:\n- Overview\n- Parameters\n- Return values\n- Usage examples\n- TypeScript types"
    }
  ],
  "temperature": 0.3,
  "max_tokens": 4096
}
```

---

## GitHub Actions Workflow Design

### Trigger Strategy

**Primary Triggers**:
1. **Push to main branch** of vivi-app
2. **PR merged** to main
3. **Scheduled** (daily at 2 AM UTC) - catch missed changes
4. **Manual trigger** (workflow_dispatch)

**Path Filters** (in vivi-app):
```yaml
on:
  push:
    branches: [main]
    paths:
      - 'src/**'
      - 'packages/**'
      - '!*.test.ts'
      - '!*.spec.ts'
```

### Workflow Location

Create at: `.github/workflows/auto-docs.yml` in **vivim-live** repo

The workflow runs in vivim-live because:
- It needs to modify vivim-live docs
- It commits to vivim-live
- Vercel deploys vivim-live

---

## Complete Workflow Implementation

### `.github/workflows/auto-docs.yml`

```yaml
name: AI Documentation Pipeline

on:
  # Trigger from vivi-app repository via repository dispatch
  repository_dispatch:
    types: [vivi-app-changed]
  
  # Also allow manual/scheduled runs
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC
  workflow_dispatch:
    inputs:
      source_branch:
        description: 'Source branch to check for changes'
        required: false
        default: 'main'

env:
  ZAI_API_KEY: ${{ secrets.ZAI_API_KEY }}
  ZAI_BASE_URL: https://api.z.ai/api/coding/paas/v4
  ZAI_MODEL: glm-4.7
  VIVI_APP_REPO: owenservera/vivi-app

jobs:
  detect-changes:
    name: Detect Source Changes
    runs-on: ubuntu-latest
    outputs:
      has_changes: ${{ steps.check_changes.outputs.has_changes }}
      changed_files: ${{ steps.check_changes.outputs.changed_files }}
    steps:
      - name: Checkout vivim-live
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - name: Fetch vivi-app changes
        uses: actions/checkout@v4
        with:
          repository: ${{ env.VIVI_APP_REPO }}
          path: vivi-app
          fetch-depth: 50
          token: ${{ secrets.GH_TOKEN_READ }}
      
      - name: Detect changed files
        id: check_changes
        shell: bash
        run: |
          cd vivi-app
          
          # Get last commit that triggered docs
          LAST_COMMIT=$(git log --format=%H -1 --all -- .github/workflows/auto-docs-marker.txt 2>/dev/null || echo "")
          CURRENT_COMMIT=$(git rev-parse origin/main)
          
          if [ -z "$LAST_COMMIT" ]; then
            # First run - get recent changes
            CHANGED_FILES=$(git diff --name-only HEAD~20 HEAD -- 'src/**' 'packages/**' 2>/dev/null | grep -v '\.test\.' | grep -v '\.spec\.')
          else
            CHANGED_FILES=$(git diff --name-only $LAST_COMMIT $CURRENT_COMMIT -- 'src/**' 'packages/**' 2>/dev/null | grep -v '\.test\.' | grep -v '\.spec\.')
          fi
          
          if [ -z "$CHANGED_FILES" ]; then
            echo "has_changes=false" >> $GITHUB_OUTPUT
            echo "changed_files=" >> $GITHUB_OUTPUT
          else
            echo "has_changes=true" >> $GITHUB_OUTPUT
            echo "changed_files<<EOF" >> $GITHUB_OUTPUT
            echo "$CHANGED_FILES" >> $GITHUB_OUTPUT
            echo "EOF" >> $GITHUB_OUTPUT
          fi
          
          echo "Current commit: $CURRENT_COMMIT"

  generate-docs:
    name: Generate Documentation
    needs: detect-changes
    if: needs.detect-changes.outputs.has_changes == 'true'
    runs-on: ubuntu-latest
    steps:
      - name: Checkout vivim-live
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
          token: ${{ secrets.GH_TOKEN_WRITE }}
      
      - name: Fetch vivi-app source
        uses: actions/checkout@v4
        with:
          repository: ${{ env.VIVI_APP_REPO }}
          path: vivi-app
          token: ${{ secrets.GH_TOKEN_READ }}
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm install axios
      
      - name: Generate documentation
        id: generate
        env:
          CHANGED_FILES: ${{ needs.detect-changes.outputs.changed_files }}
        shell: bash
        run: |
          npm install axios
          
          cat > generate-docs.js << 'EOFJS'
          const axios = require('axios');
          const fs = require('fs');
          const path = require('path');
          
          const ZAI_API_KEY = process.env.ZAI_API_KEY;
          const ZAI_BASE_URL = process.env.ZAI_BASE_URL || 'https://api.z.ai/api/coding/paas/v4';
          const ZAI_MODEL = process.env.ZAI_MODEL || 'glm-4.7';
          
          async function generateDocs() {
            const changedFiles = process.env.CHANGED_FILES.split('\n').filter(f => f.trim());
            
            console.log(`Processing ${changedFiles.length} changed files...`);
            
            // Read changed files content
            const fileContents = [];
            for (const file of changedFiles.slice(0, 10)) {  // Limit to 10 files
              try {
                const content = fs.readFileSync(path.join('vivi-app', file), 'utf-8');
                fileContents.push({ file, content: content.slice(0, 5000) });  // Limit content
              } catch (e) {
                console.log(`Could not read ${file}: ${e.message}`);
              }
            }
            
            // Build prompt for Z.AI
            const systemPrompt = `You are a technical documentation generator. Analyze TypeScript/JavaScript code changes and generate comprehensive documentation in Markdown format suitable for Docusaurus.

Generate documentation that includes:
1. Overview - What this code does
2. API - Functions, classes, interfaces with parameters and return types
3. Usage Examples - Code snippets showing how to use
4. Type Definitions - TypeScript types if applicable
5. Dependencies - What other modules are needed

Format output as Docusaurus MDX with proper frontmatter:
---
id: auto-{filename}
title: {descriptive title}
sidebar_label: {short label}
---

## Content here...
`;
            
            const userPrompt = `Generate documentation for these changed files:\n\n${fileContents.map(f => `### ${f.file}\n\`\`\`typescript\n${f.content}\n\`\`\`\n`).join('\n\n')}`;
            
            // Call Z.AI API
            console.log('Calling Z.AI API...');
            const response = await axios.post(
              `${ZAI_BASE_URL}/chat/completions`,
              {
                model: ZAI_MODEL,
                messages: [
                  { role: 'system', content: systemPrompt },
                  { role: 'user', content: userPrompt }
                ],
                temperature: 0.3,
                max_tokens: 4096
              },
              {
                headers: {
                  'Authorization': `Bearer ${ZAI_API_KEY}`,
                  'Content-Type': 'application/json'
                }
              }
            );
            
            const generatedDocs = response.data.choices[0].message.content;
            console.log('Documentation generated successfully');
            
            // Save to docs directory
            const docsDir = path.join('docs', 'docs', 'auto-generated');
            if (!fs.existsSync(docsDir)) {
              fs.mkdirSync(docsDir, { recursive: true });
            }
            
            const outputFile = path.join(docsDir, 'api-changes.md');
            fs.writeFileSync(outputFile, generatedDocs);
            
            console.log(`Documentation saved to ${outputFile}`);
            
            // Return the content for commit
            return generatedDocs;
          }
          
          generateDocs().then(() => {
            console.log('Done!');
            process.exit(0);
          }).catch(err => {
            console.error('Error:', err.message);
            process.exit(1);
          });
          EOFJS
          
          CHANGED_FILES="$CHANGED_FILES" node generate-docs.js
      
      - name: Check generated docs
        id: check_docs
        run: |
          if [ -f docs/docs/auto-generated/api-changes.md ]; then
            echo "docs_generated=true" >> $GITHUB_OUTPUT
            echo "Documentation file created successfully"
            cat docs/docs/auto-generated/api-changes.md
          else
            echo "docs_generated=false" >> $GITHUB_OUTPUT
            echo "No documentation was generated"
          fi

  commit-and-deploy:
    name: Commit and Deploy
    needs: generate-docs
    if: needs.generate-docs.outputs.docs_generated == 'true'
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
          token: ${{ secrets.GH_TOKEN_WRITE }}
      
      - name: Configure Git
        run: |
          git config --local user.email "github-actions[bot]@users.noreply.github.com"
          git config --local user.name "github-actions[bot]"
      
      - name: Commit documentation changes
        run: |
          git add docs/
          git diff --cached --quiet && {
            echo "No changes to commit"
            exit 0
          }
          
          git commit -m "docs: Auto-generate API documentation [skip ci]"
          git push origin main
      
      - name: Trigger Vercel Deployment
        run: |
          # Option 1: Vercel Deploy Hook (recommended)
          if [ -n "${{ secrets.VERCEL_DEPLOY_HOOK }}" ]; then
            curl -X POST "${{ secrets.VERCEL_DEPLOY_HOOK }}" \
              -H "Content-Type: application/json" \
              -d '{"ref": "main", "message": "Auto-generated documentation update"}'
            echo "Vercel deployment triggered via deploy hook"
          fi
          
          # Option 2: Vercel API (alternative)
          # curl -X POST "https://api.vercel.com/v1/integrations/deploy/prj_xxx" \
          #   -H "Authorization: Bearer ${{ secrets.VERCEL_TOKEN }}"
      
      - name: Update marker file
        run: |
          date > .github/workflows/auto-docs-marker.txt
          git add .github/workflows/auto-docs-marker.txt
          git commit -m "chore: Update docs marker"
          git push origin main
```

---

## Alternative: Cross-Repository Trigger

Since the docs live in vivim-live but changes come from vivi-app, you need to trigger the workflow from vivi-app:

### In vivi-app: `.github/workflows/trigger-docs.yml`

```yaml
name: Trigger Documentation Update

on:
  push:
    branches: [main]
    paths:
      - 'src/**'
      - 'packages/**'
      - '!*.test.ts'
      - '!*.spec.ts'
  pull_request:
    types: [closed]
    branches: [main]

jobs:
  trigger-docs:
    if: github.event_name == 'push' || (github.event_name == 'pull_request' && github.event.pull_request.merged == true)
    runs-on: ubuntu-latest
    steps:
      - name: Trigger vivim-live workflow
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.repos.createDispatchEvent({
              owner: 'owenservera',
              repo: 'vivim-live',
              event_type: 'vivi-app-changed',
              client_payload: {
                branch: '${{ github.ref_name }}',
                commit: '${{ github.sha }}'
              }
            })
        env:
          GH_TOKEN: ${{ secrets.GH_TOKEN_TRIGGER }}
```

---

## Secrets Required

### In vivim-live repository:

| Secret | Description | Example |
|--------|-------------|---------|
| `ZAI_API_KEY` | Your z.ai API key | `3b4e3003c9534dd68e3f0ef8dacfb80a.jFvLL8R4QD3K8TVl` |
| `VERCEL_DEPLOY_HOOK` | Vercel deploy hook URL | `https://api.vercel.com/v1/integrations/deploy/...` |
| `GH_TOKEN_READ` | GitHub token with read access to vivi-app | `ghp_...` |
| `GH_TOKEN_WRITE` | GitHub token with write access to vivim-live | `ghp_...` |
| `GH_TOKEN_TRIGGER` | GitHub token to trigger dispatch events | `ghp_...` |

### Creating GitHub Personal Access Token:

1. Go to GitHub Settings → Developer Settings → Personal access tokens → Tokens (classic)
2. Generate new token with scopes:
   - `repo` (full control)
   - `repo:status`
   - `public_repo`
3. Use this token for GH_TOKEN_WRITE

### Creating Vercel Deploy Hook:

1. Go to Vercel Dashboard → Project → Settings → Git → Deploy Hooks
2. Create hook named "Documentation Update"
3. Copy the URL and add as secret

---

## Closed Loop Flow

### Complete Automation Cycle:

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FULL CLOSED LOOP                            │
└─────────────────────────────────────────────────────────────────────┘

1. DEVELOPER PUSH
   └─> Developer pushes code to vivi-app/main

2. VIVI-APP WORKFLOW TRIGGERS
   └─> .github/workflows/trigger-docs.yml fires
   └─> Detects src/** changes (excludes tests)

3. CROSS-REPO DISPATCH
   └─> Creates repository_dispatch event on vivim-live
   └─> Sends branch + commit SHA

4. VIVIM-LIVE WORKFLOW STARTS
   └─> .github/workflows/auto-docs.yml receives event
   └─> Fetches vivi-app source code

5. CHANGE DETECTION
   └─> Compares with last processed commit
   └─> Identifies changed TypeScript/JavaScript files

6. Z.AI DOCUMENTATION GENERATION
   └─> Sends code diff to Z.AI API
   └─> Endpoint: https://api.z.ai/api/coding/paas/v4
   └─> Model: glm-4.7
   └─> Generates Markdown documentation

7. DOCUMENTATION SAVED
   └─> Writes to docs/docs/auto-generated/api-changes.md

8. GIT COMMIT
   └─> Commits with message: "docs: Auto-generate API documentation [skip ci]"
   └─> Pushes to vivim-live/main

9. VERCEL DEPLOY
   └─> Vercel detects push to main
   └─> Automatically builds docs
   └─> Deploys to vivim.live/docs

10. LIVE
    └─> Documentation is live!
    └─> Loop completes
```

---

## Rate Limiting & Cost Considerations

### Z.AI Rate Limits

- **GLM-4.7**: Standard concurrency limits
- **GLM-4.7-Flash**: Free tier (1% throttle at >8K context)
- **Context Window**: 128K tokens

### Cost Estimation

| Item | Cost |
|------|------|
| GLM-4.7 Input | $0.60/1M tokens |
| GLM-4.7 Output | $2.20/1M tokens |

For typical PR (5 files, ~2000 tokens input, ~1000 tokens output):
- Input: $0.0012
- Output: $0.0022
- **Total: ~$0.003 per update**

### Cost Optimization Tips

1. **Use Flash model for drafts**: `glm-4.7-Flash` (free)
2. **Cache system prompts**: Reduces token usage
3. **Filter file types**: Only process `.ts`, `.tsx`, `.js`, `.jsx`
4. **Limit file count**: Process max 10 files per run

---

## Error Handling

### Retry Logic

```javascript
async function callWithRetry(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === maxRetries - 1) throw err;
      await sleep(1000 * Math.pow(2, i));  // Exponential backoff
    }
  }
}
```

### Graceful Degradation

- If Z.AI API fails: Create issue/PR for manual docs
- If GitHub API fails: Retry on next schedule
- If Vercel fails: Manual redeploy available

---

## Testing the Pipeline

### Manual Test

```bash
# Trigger workflow manually
gh workflow run auto-docs.yml -f source_branch=main

# Check run status
gh run list --workflow=auto-docs.yml
```

### Monitor

1. **GitHub Actions**: vivim-live → Actions tab
2. **Vercel**: Dashboard → Deployments
3. **Z.AI**: Console → Usage

---

## Implementation Checklist

- [ ] Add Z.AI_API_KEY secret to vivim-live
- [ ] Add VERCEL_DEPLOY_HOOK secret to vivim-live
- [ ] Add GH_TOKEN secrets to both repos
- [ ] Create `.github/workflows/auto-docs.yml` in vivim-live
- [ ] Create `.github/workflows/trigger-docs.yml` in vivi-app
- [ ] Test with manual workflow dispatch
- [ ] Monitor first automated run

---

## Files to Create

### 1. `vivim-live/.github/workflows/auto-docs.yml`
Main documentation generation workflow

### 2. `vivi-app/.github/workflows/trigger-docs.yml`  
Cross-repo trigger workflow

### 3. `generate-docs.js`
Node.js script for Z.AI API integration

---

## Summary

This design provides a **fully closed-loop automated documentation system**:

| Component | Technology |
|-----------|------------|
| Change Detection | GitHub Actions + repository_dispatch |
| AI Generation | Z.AI GLM-4.7 via coding plan API |
| Documentation | Docusaurus Markdown |
| Commit | GitHub Actions + GitHub API |
| Deployment | Vercel (auto-deploys on git push) |

**Total Cost**: ~$0.003 per documentation update (Z.AI API only)
**Automation Level**: Fully automatic after initial setup
