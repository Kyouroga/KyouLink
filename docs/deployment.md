# Deployment

Use this guide for Cloudflare Worker deployment and GitHub Actions setup.

## Prerequisites

| Requirement | Notes |
| --- | --- |
| Cloudflare account | Needed to publish the Worker |
| Wrangler access token | Allows deployment from the CLI or CI |
| GitHub repository secrets | Required for automated deployment |

## Required secrets

| Secret | Purpose |
| --- | --- |
| CF_API_TOKEN | Authenticates Wrangler with Cloudflare |
| CF_ACCOUNT_ID | Identifies the target Cloudflare account |

## Deploy locally

```bash
npx wrangler deploy --env production
```

## CI deployment

The repository workflow can deploy automatically once the required secrets are configured in GitHub.
