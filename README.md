# KyouLink

A secure GitHub → Discord webhook bridge logic library redesigned for Cloudflare Worker compatibility.

## Quick links

| Section | Purpose |
| --- | --- |
| [Setup](#setup) | Install and configure the project |
| [Testing](docs/testing.md) | Run the regression suite locally |
| [Deployment](docs/deployment.md) | Deploy to Cloudflare Workers |
| [Supported events](docs/events.md) | See which GitHub events are handled |
| [Security](docs/security.md) | Review secret handling and protection |

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

See [docs/events.md](docs/events.md) for the full list.

## Security

Keep secrets private and review [docs/security.md](docs/security.md) before deploying.
