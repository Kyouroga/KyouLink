# Kyouroga-Bridge-Git

A secure GitHub → Discord webhook bridge logic library redesigned for Cloudflare Worker compatibility.

## Features

* GitHub webhook signature validation
* Discord webhook notifications with GitHub identity
* Supports push, fork, issues, comments, pull requests, reviews, releases, and discussions
* Cloudflare Worker friendly handler
* Minimal attack surface and payload validation

---

## Requirements

* GitHub repository with webhook access
* Discord webhook URL
* GitHub webhook secret
* Cloudflare Workers environment or compatible serverless runtime

---

## Setup

Clone the repository:

```bash
git clone https://github.com/Kyouroga/Kyouroga-Bridge-Git.git
cd Kyouroga-Bridge-Git
```

Install dependencies:

```bash
npm install
```

Create a `.env` file for local testing if needed:

```env
GITHUB_SECRET=your_secret
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/xxxx
```

> This repository no longer includes a local Express server entrypoint or Docker deployment files. The logic is designed to be imported into a Cloudflare Worker or another serverless adapter.

---

## Usage

The webhook handler is located at `src/github/webhookHandler.js`.

### Cloudflare Worker

Deploy a Cloudflare Worker that forwards incoming requests to the handler, preserving raw headers, body, and method. Set `GITHUB_SECRET` and `DISCORD_WEBHOOK_URL` as Worker environment variables.

### Local runtime

Use the handler in any Node-compatible runtime by adapting request handling and passing raw request data, headers, and parsed JSON payload.

---

## Webhook Endpoint

```text
POST /github/webhook
```

### Required headers

* `Content-Type: application/json`
* `X-Hub-Signature-256`
* `X-GitHub-Event`

---

## GitHub Webhook Setup

Repository > Settings > Webhooks > Add webhook

* Payload URL: `https://your-domain.com/github/webhook`
* Content type: `application/json`
* Secret: same value as `GITHUB_SECRET`
* Enable SSL verification: `true`
* Events: choose the events you want to forward

---

## Supported Events

* `push`
* `fork`
* `issues`
* `issue_comment`
* `pull_request`
* `pull_request_review`
* `pull_request_review_comment`
* `release`
* `discussion`

---

## Project Structure

```text
src/
├── config/
├── constants/
├── embeds/
├── github/
├── handlers/
├── services/
└── utils/
```

---

## Security Notes

* All requests require HMAC signature verification
* Raw payload is validated before parsing
* Only supported GitHub events are processed
* Old Express, Docker, and PM2 deployment files have been removed
* Keep `GITHUB_SECRET` private and do not commit it


## Notes

* The repository does not require `axios` or Express for webhook delivery; it uses native `fetch` and Cloudflare Worker bindings.
* For Cloudflare deployment, use the lightweight Worker wrapper in `src/worker.js` to forward events to `handleGithubWebhook`.

---

## Cloudflare Deploy (Worker)

This repository is a Worker-only project (no static site). Use the provided `wrangler.toml` to deploy.

1. Ensure `wrangler.toml` exists in the repository root and `main` points to `src/worker.js`.
2. Set the following Worker environment variables in Cloudflare (Dashboard → Workers → your Worker → Settings → Variables):
	- `GITHUB_SECRET` = your GitHub webhook secret
	- `DISCORD_WEBHOOK_URL` = your Discord webhook URL

3. Deploy with Wrangler from CI or locally:

```bash
# If you haven't installed wrangler globally, use npx
npx wrangler deploy --env production
```

Notes:
- If Wrangler reports "Could not detect a directory containing static files", you are likely deploying a Pages project. This repo is a Worker; ensure `wrangler.toml` is present and contains no `site` configuration.
- If you want to publish to a specific route/zone, set `account_id`, `zone_id`, and `route` in `wrangler.toml` or pass `--account-id` on the CLI.
