require("dotenv").config();

module.exports = {
    port: parseInt(process.env.PORT || "3000", 10),

    github: {
        secret: process.env.GITHUB_SECRET
    },

    discord: {
        webhookUrl: process.env.DISCORD_WEBHOOK_URL
    }
};