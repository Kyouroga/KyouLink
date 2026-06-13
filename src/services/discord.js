const axios = require("axios");
const config = require("../config/config");

async function sendEmbed(embed) {
    if (!config.discord.webhookUrl) {
        throw new Error(
            "DISCORD_WEBHOOK_URL missing."
        );
    }

    await axios.post(
        config.discord.webhookUrl,
        {
            embeds: [embed]
        },
        {
            headers: {
                "Content-Type":
                    "application/json"
            }
        }
    );
}

module.exports = {
    sendEmbed
};