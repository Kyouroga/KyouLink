import config from '../config/config.js';

async function sendEmbed(embed, webhookUrl, env = {}) {
    const url =
        webhookUrl ||
        env.DISCORD_WEBHOOK_URL ||
        config.discord.webhookUrl;

    if (!url) {
        throw new Error(
            'DISCORD_WEBHOOK_URL missing.'
        );
    }

    await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type':
                'application/json'
        },
        body: JSON.stringify({
            username: 'GitHub',
            avatar_url:
                'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
            embeds: [embed]
        })
    });
}

export { sendEmbed };
