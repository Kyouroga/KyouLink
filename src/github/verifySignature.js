const crypto = require("crypto");
const config = require("../config/config");

function verifySignature(req) {
    const signature =
        req.headers["x-hub-signature-256"];

    if (!signature) {
        return false;
    }

    const expected =
        "sha256=" +
        crypto
            .createHmac(
                "sha256",
                config.github.secret
            )
            .update(req.rawBody)
            .digest("hex");

    try {
        return crypto.timingSafeEqual(
            Buffer.from(signature),
            Buffer.from(expected)
        );
    } catch {
        return false;
    }
}

module.exports = verifySignature;