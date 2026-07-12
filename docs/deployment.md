# Deployment

Use this guide for Cloudflare Worker deployment and GitHub Actions setup.

## Prerequisites

| Requirement | Notes |
| --- | --- |
| Cloudflare account | Needed to publish the Worker |
| Wrangler access token | Allows deployment from the CLI or CI |
| GitHub repository secrets | Required for automated deployment |

## Required GitHub repository secrets

| Secret | Purpose |
| --- | --- |
| CF_API_TOKEN | Cloudflare API token with Workers publish permissions |
| CF_ACCOUNT_ID | Cloudflare account ID |

## Deploy locally

```bash
npx wrangler deploy --env production
```

## CI deployment

The repository workflow can deploy automatically once the required secrets are configured in GitHub.

## Generic fallback behavior

Branch create/delete events use dedicated branch handlers with the specific titles you requested, while repository rename, transfer, archive, unarchive, and publicize actions now emit clear link-style titles and other compatible fallback payloads still route through the generic embed path when no dedicated embed exists.
