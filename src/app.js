const express = require("express");

const config =
    require("./config/config");

const githubRouter =
    require("./github/router");

const app = express();

app.use(
    express.json({
        verify: (req, res, buffer) => {
            req.rawBody = buffer;
        }
    })
);

app.get("/", (req, res) => {
    res.status(200).json({
        service:
            "Kyouroga-Bridge-Git",
        status: "online"
    });
});

app.use(
    "/github/webhook",
    githubRouter
);

app.listen(config.port, () => {
    console.log(
        `Kyouroga-Bridge-Git listening on port ${config.port}`
    );
});