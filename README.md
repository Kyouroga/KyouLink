# KyouLink

A secure GitHub → Discord webhook bridge logic library redesigned for Cloudflare Worker compatibility.

- [Setup](#setup): Install and configure the project
- [Testing](docs/testing.md): Run the regression suite locally
- [Deployment](docs/deployment.md): Deploy to Cloudflare Workers
- [Security](docs/security.md): Review secret handling and protection

## Setup
1. Clone the repository.
2. Install dependencies.
3. Add your runtime secrets.

```bash
git clone https://github.com/Kyouroga/KyouLink.git
cd KyouLink
npm install
```
### Required environment values

| Name | Purpose |
| --- | --- |
| GITHUB_SECRET | Verifies incoming GitHub webhook signatures |
| DISCORD_WEBHOOK_URL | Sends the formatted Discord message |

### Required GitHub repository secrets

| Secret | Purpose |
| --- | --- |
| CF_API_TOKEN | Cloudflare API token with Workers publish permissions |
| CF_ACCOUNT_ID | Cloudflare account ID |

## Usage

The webhook entrypoint is handled by [src/github/webhookHandler.js](src/github/webhookHandler.js).

Send a POST request to:

```text
POST /github/webhook
```

### Required headers

| Header | Why it matters |
| --- | --- |
| Content-Type | Must be application/json |
| X-Hub-Signature-256 | Verifies the webhook authenticity |
| X-GitHub-Event | Tells the app which GitHub event arrived |

## Testing

Run the local regression suite before committing:

```bash
npm test
```

See [docs/testing.md](docs/testing.md) for the full test overview.

## Deployment

This project is designed for Cloudflare Workers. Use [docs/deployment.md](docs/deployment.md) for the full deploy guide.

## Supported events

| Event | Notes |
| --- | --- |
| push | Handles normal push notifications with commit-author attribution |
| create | Sends dedicated branch-created notifications |
| delete | Sends dedicated branch-deleted notifications |
| rename | Sends dedicated branch-renamed notifications |
| fork | Sends a Discord notification when a repository is forked |
| issues | Covers issue opened, closed, and related updates |
| issue_comment | Supports comments on issues |
| pull_request | Handles pull request lifecycle updates |
| pull_request_review | Covers review activity |
| pull_request_review_comment | Supports review comment notifications |
| commit_comment | Sends commit-comment notifications that mirror the review-comment experience |
| release | Sends release-related notifications |
| repository | Covers repository-level actions such as rename events and other generic fallback notifications |
| discussion | Sends discussion updates to Discord |

## Security

Keep secrets private and review [docs/security.md](docs/security.md) before deploying.
