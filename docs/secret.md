# Secret

Keep these values private:

| Secret or value | Why it matters |
| --- | --- |
| GITHUB_SECRET | Verifies that incoming webhook requests are genuinely from GitHub |
| DISCORD_WEBHOOK_URL | Controls where Discord notifications are sent |
| CF_API_TOKEN | Authorizes Cloudflare deployments and must be kept private |
| CF_ACCOUNT_ID | Identifies the target Cloudflare account and should remain confidential |

The bridge validates GitHub signatures before processing events and rejects unsupported payloads early.
