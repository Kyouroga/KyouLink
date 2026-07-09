# Security

Keep these values private:

| Secret or value | Why it matters |
| --- | --- |
| GITHUB_SECRET | Verifies that incoming webhook requests are genuinely from GitHub |
| DISCORD_WEBHOOK_URL | Controls where Discord notifications are sent |

The bridge validates GitHub signatures before processing events and rejects unsupported payloads early.
