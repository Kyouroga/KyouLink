# Kyouroga-Bridge-Git

A lightweight GitHub → Discord webhook bridge that converts GitHub events into rich Discord embeds.

## Features

* Push Notifications
* Fork Notifications
* Issues
* Issue Comments
* Pull Requests
* Pull Request Reviews
* Pull Request Review Comments
* Releases
* Discussions
* Repository Stars
* GitHub Signature Validation
* Discord Webhook Integration

---

## Requirements

* Node.js 20+
* npm 10+
* GitHub Repository
* Discord Webhook URL

---

## Installation

Clone the repository:

```bash
git clone https://github.com/Kyouroga/Kyouroga-Bridge-Git.git
cd Kyouroga-Bridge-Git
```

Install dependencies:

```bash
npm install
```

Copy environment file:

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=3000

GITHUB_SECRET=your_secret

DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/xxxx
```

Start:

```bash
npm start
```

Development:

```bash
npm run dev
```

---

## Webhook Endpoint

```text
POST /github/webhook
```

Example:

```text
https://example.com/github/webhook
```

---

## GitHub Webhook Setup

Repository

Settings

Webhooks

Add webhook

Payload URL:

```text
https://your-domain.com/github/webhook
```

Content Type:

```text
application/json
```

Secret:

```text
same value as GITHUB_SECRET
```

Enable SSL Verification:

```text
true
```

Events:

* Pushes
* Forks
* Issues
* Issue comments
* Pull requests
* Pull request reviews
* Pull request review comments
* Releases
* Discussions
* Stars

Save webhook.

---

## Supported Events

### Push

```text
[Kyouroga/dontcopy:master] 3 new commits
```

### Fork

```text
[Kyouroga/dontcopy] Fork created
```

### Issues

```text
Issue opened
Issue closed
Issue reopened
```

### Pull Requests

```text
Pull Request opened
Pull Request closed
Pull Request merged
Pull Request reopened
```

### Reviews

```text
Approved
Changes Requested
Commented
```

### Releases

```text
Release Published
Release Created
```

### Discussions

```text
Discussion Created
Discussion Answered
```

---

## Project Structure

```text
src/
├── app.js
├── config/
├── github/
├── handlers/
├── embeds/
├── services/
├── utils/
└── constants/
```

---

## Production Recommendations

* Use HTTPS
* Run behind Nginx
* Use PM2
* Restrict firewall access
* Keep GitHub Secret private
* Use Discord rate limiting protection
