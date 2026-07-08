# Contributing

Thank you for your interest in contributing to KyouLink.

## How to contribute

1. Fork the repository.
2. Create a new branch for your change:
   - `git checkout -b fix/<issue>`
   - `git checkout -b feat/<feature>`
3. Make your changes.
4. Commit with a clear message:
   - `git commit -m "fix: correct branch delete embed behavior"`
5. Push to your fork and open a pull request against `main`.

## Pull request process

- PRs should include a short description of the change.
- If the PR fixes an issue, reference it in the description.
- Avoid including unrelated changes in a single PR.
- `README.md` should be updated for documentation changes.

## Code style

- Keep code readable and consistent with existing project style.
- Prefer descriptive variable names and small helper functions.

## Workflow

This repository uses GitHub Actions for CI and deployment.
- Pull requests to `main` run validation.
- Pushes to `main` run deploy after validation.
