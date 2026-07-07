import config from '../config/config.js';

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
