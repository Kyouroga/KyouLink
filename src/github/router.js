const express = require("express");

const verifySignature =
    require("./verifySignature");

const dispatch =
    require("./eventDispatcher");

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const verified =
            verifySignature(req);

        if (!verified) {
            return res
                .status(401)
                .json({
                    error:
                        "Invalid signature"
                });
        }

        const event =
            req.headers["x-github-event"];

        const payload = req.body;

        await dispatch(
            event,
            payload
        );

        return res.status(200).json({
            success: true
        });
    } catch (err) {
        console.error(err);

        return res
            .status(500)
            .json({
                success: false
            });
    }
});

module.exports = router;