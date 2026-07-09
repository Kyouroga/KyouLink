/*
 * Copyright (c) 2026 Kyouroga. https://kyouroga.org
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * Project: KyouLink
 * Repository: https://github.com/Kyouroga/KyouLink
 *
 * For contribution guidelines, coding standards, and the pull request process,
 * see CONTRIBUTING.md in the project root.
 */

// Validate GitHub webhook headers and signature before dispatch.
// Notes: Normalizes events and verifies the HMAC SHA-256 signature.
import verifySignature from './verifySignature.js';
import dispatch from './eventDispatcher.js';
import { getConfig } from '../config/config.js';

const MAX_PAYLOAD_SIZE = 1024 * 1024; // 1 MB

function buildResponse(status, body) {
    return {
        status,
        body
    };
}

function getHeaderValue(headers, key) {
    if (!headers) {
        return undefined;
    }

    if (typeof headers.get === 'function') {
        return headers.get(key);
    }

    return headers[key] || headers[key.toLowerCase()];
}

function normalizeHeaders(headers) {
    const normalized = {};

    if (!headers) {
        return normalized;
    }

    if (typeof headers.entries === 'function') {
        for (const [name, value] of headers.entries()) {
            normalized[name.toLowerCase()] = value;
        }
        return normalized;
    }

    return Object.keys(headers || {}).reduce((result, key) => {
        result[key.toLowerCase()] = headers[key];
        return result;
    }, normalized);
}

function getRawBodyBuffer(rawBody) {
    if (!rawBody) {
        return null;
    }

    if (typeof rawBody === 'string') {
        return new TextEncoder().encode(rawBody);
    }

    if (rawBody instanceof ArrayBuffer) {
        return new Uint8Array(rawBody);
    }

    if (ArrayBuffer.isView(rawBody)) {
        return new Uint8Array(rawBody.buffer, rawBody.byteOffset, rawBody.byteLength);
    }

    return null;
}

async function handleGithubWebhook({ method, headers, rawBody, parsedBody, env = {}, url, dispatchFn }) {
    const verb = String(method || '').toUpperCase();

    // Simple health check for browser/uptime probes
    if (verb === 'GET') {
        try {
            if (url) {
                const u = new URL(url);
                const diag = u.searchParams.get('diag');
                if (diag) {
                    const config = getConfig(env);
                    const secretPresent = !!(
                        (env && env.GITHUB_SECRET) ||
                        (config && config.github && config.github.secret)
                    );
                    const discordPresent = !!(
                        (env && env.DISCORD_WEBHOOK_URL) ||
                        (config && config.discord && config.discord.webhookUrl)
                    );

                    return buildResponse(200, {
                        success: true,
                        service: 'GitBridge',
                        status: 'running',
                        diagnostic: {
                            github_secret_present: secretPresent,
                            discord_webhook_present: discordPresent
                        }
                    });
                }
            }
        } catch (err) {
            // fall through to default health response
            console.error('Diag parse error', err);
        }

        return buildResponse(200, {
            success: true,
            service: 'GitBridge',
            status: 'running',
            message: 'Operational'
        });
    }

    if (verb !== 'POST') {
        return buildResponse(405, {
            success: false,
            error: 'Method not allowed'
        });
    }

    // Normalize headers so the handler can read GitHub values consistently.
    const normalizedHeaders = normalizeHeaders(headers);

    const contentType = getHeaderValue(normalizedHeaders, 'content-type') || '';
    if (!contentType.includes('application/json')) {
        return buildResponse(415, {
            success: false,
            error: 'Content-Type must be application/json'
        });
    }

    const rawBodyBuffer = getRawBodyBuffer(rawBody);
    if (!rawBodyBuffer || rawBodyBuffer.length === 0) {
        return buildResponse(400, {
            success: false,
            error: 'Missing request body'
        });
    }

    if (rawBodyBuffer.length > MAX_PAYLOAD_SIZE) {
        return buildResponse(413, {
            success: false,
            error: 'Payload too large'
        });
    }

    const signature = getHeaderValue(normalizedHeaders, 'x-hub-signature-256');
    if (!signature) {
        return buildResponse(401, {
            success: false,
            error: 'Missing X-Hub-Signature-256 header'
        });
    }

    if (!(await verifySignature(signature, rawBodyBuffer, env))) {
        return buildResponse(401, {
            success: false,
            error: 'Invalid signature'
        });
    }

    let payload = parsedBody;
    if (!payload) {
        try {
            payload = JSON.parse(new TextDecoder().decode(rawBodyBuffer));
        } catch (err) {
            return buildResponse(400, {
                success: false,
                error: 'Invalid JSON payload'
            });
        }
    }

    if (!payload || typeof payload !== 'object') {
        return buildResponse(400, {
            success: false,
            error: 'Invalid payload'
        });
    }

    const event = getHeaderValue(normalizedHeaders, 'x-github-event');
    if (!event) {
        return buildResponse(400, {
            success: false,
            error: 'Missing X-GitHub-Event header'
        });
    }

    const normalizedEvent = String(event).trim();

    try {
        const dispatcher = typeof dispatchFn === 'function' ? dispatchFn : dispatch;
        await dispatcher(normalizedEvent, payload, env);
    } catch (err) {
        console.error('Error dispatching event:', err && err.stack ? err.stack : err);
        return buildResponse(500, {
            success: false,
            error: 'Internal server error'
        });
    }

    return buildResponse(200, {
        success: true
    });
}

export { handleGithubWebhook };




