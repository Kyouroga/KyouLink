import test from 'node:test';
import assert from 'node:assert/strict';

import { handleGithubWebhook } from '../src/github/webhookHandler.js';
import verifySignature from '../src/github/verifySignature.js';

async function createSignature(rawBody, secret) {
    const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', key, rawBody);
    const hex = Array.from(new Uint8Array(signature))
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('');

    return `sha256=${hex}`;
}

test('verifySignature accepts a valid HMAC signature', async () => {
    const body = new TextEncoder().encode('{"action":"opened"}');
    const secret = 'local-test-secret';
    const signature = await createSignature(body, secret);

    assert.equal(await verifySignature(signature, body, { GITHUB_SECRET: secret }), true);
    assert.equal(await verifySignature('sha256=deadbeef', body, { GITHUB_SECRET: secret }), false);
});

test('handleGithubWebhook uses the injected dispatcher for valid requests', async () => {
    const body = JSON.stringify({ action: 'opened' });
    const rawBody = new TextEncoder().encode(body);
    const secret = 'local-test-secret';
    const signature = await createSignature(rawBody, secret);

    let dispatched = false;

    const result = await handleGithubWebhook({
        method: 'POST',
        headers: new Headers({
            'content-type': 'application/json',
            'x-github-event': 'issues',
            'x-hub-signature-256': signature
        }),
        rawBody,
        env: { GITHUB_SECRET: secret, NODE_ENV: 'test' },
        dispatchFn: async () => {
            dispatched = true;
        }
    });

    assert.equal(result.status, 200);
    assert.equal(dispatched, true);
});
