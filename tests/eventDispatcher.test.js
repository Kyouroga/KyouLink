import test from 'node:test';
import assert from 'node:assert/strict';

import dispatch from '../src/github/eventDispatcher.js';

const originalFetch = globalThis.fetch;

test('dispatch uses genericEmbed fallback for payloads not handled by a known event handler', async () => {
    const fetchCalls = [];

    globalThis.fetch = async (url, options) => {
        fetchCalls.push({ url, options });
        return {
            ok: true,
            status: 204,
            json: async () => ({})
        };
    };

    try {
        const payload = {
            action: 'deleted',
            repository: {
                full_name: 'Kyouroga/KyouLink',
                html_url: 'https://github.com/Kyouroga/KyouLink'
            },
            sender: {
                login: 'octocat',
                html_url: 'https://github.com/octocat',
                avatar_url: 'https://github.com/octocat.png'
            }
        };

        await dispatch('repository', payload, {
            DISCORD_WEBHOOK_URL: 'https://example.com/webhook'
        });

        assert.equal(fetchCalls.length, 1);
        const body = JSON.parse(fetchCalls[0].options.body);
        assert.equal(body.embeds[0].title, 'octocat deleted in Kyouroga/KyouLink');
    } finally {
        globalThis.fetch = originalFetch;
    }
});

test('dispatch does not fall back to genericEmbed when the dedicated handler already processes the payload', async () => {
    const fetchCalls = [];

    globalThis.fetch = async (url, options) => {
        fetchCalls.push({ url, options });
        return {
            ok: true,
            status: 204,
            json: async () => ({})
        };
    };

    try {
        const payload = {
            action: 'started',
            repository: {
                full_name: 'Kyouroga/KyouLink',
                html_url: 'https://github.com/Kyouroga/KyouLink'
            },
            sender: {
                login: 'octocat',
                html_url: 'https://github.com/octocat',
                avatar_url: 'https://github.com/octocat.png'
            }
        };

        await dispatch('watch', payload, {
            DISCORD_WEBHOOK_URL: 'https://example.com/webhook'
        });

        assert.equal(fetchCalls.length, 1);
        const body = JSON.parse(fetchCalls[0].options.body);
        assert.equal(body.embeds[0].title, 'octocat starred repository Kyouroga/KyouLink');
    } finally {
        globalThis.fetch = originalFetch;
    }
});
