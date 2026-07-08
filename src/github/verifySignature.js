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

// Verify GitHub webhook HMAC signature using the runtime secret.
// Notes: Matches X-Hub-Signature-256 against the computed hash.
import { getConfig } from '../config/config.js';

function textToUint8Array(text) {
    return new TextEncoder().encode(text);
}

function secureCompare(a, b) {
    if (typeof a !== "string" || typeof b !== "string") {
        return false;
    }

    if (a.length !== b.length) {
        return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i += 1) {
        result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
}

async function computeHmac(rawBody, secret) {
    const key = await crypto.subtle.importKey(
        "raw",
        textToUint8Array(secret),
        {
            name: "HMAC",
            hash: "SHA-256"
        },
        false,
        ["sign"]
    );

    const signature = await crypto.subtle.sign(
        "HMAC",
        key,
        rawBody
    );

    return Array.from(new Uint8Array(signature))
        .map(byte => byte.toString(16).padStart(2, "0"))
        .join("");
}

async function verifySignature(signature, rawBodyBuffer, env = {}) {
    if (!signature || !rawBodyBuffer) {
        return false;
    }

    const config = getConfig(env);
    const secret =
        env.GITHUB_SECRET ||
        config.github.secret;

    if (!secret) {
        return false;
    }

    const expectedHash = await computeHmac(
        rawBodyBuffer,
        secret
    );

    const expected = `sha256=${expectedHash}`;

    return secureCompare(
        signature,
        expected
    );
}

export default verifySignature;




