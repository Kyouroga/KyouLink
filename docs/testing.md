# Testing

Run the local regression suite before committing changes.

```bash
npm test
```

## What the tests cover

| Area | What is validated |
| --- | --- |
| Signature validation | Verifies that valid GitHub signatures are accepted |
| Webhook handling | Confirms the webhook entrypoint routes requests correctly |
| Embed generation | Checks that GitHub-like payloads produce the expected Discord embeds |

## Recommended workflow

1. Run the tests locally before opening a pull request.
2. Review any failures before pushing to the main branch.
3. Keep the suite updated when embed or webhook behavior changes.
