import { sendEmbed } from '../services/discord.js';

import buildEmbed from '../embeds/pullRequestEmbed.js';

export default async (payload, env = {}) => {
    const action =
        payload.action;

    const allowed = [
        "opened",
        "closed",
        "reopened"
    ];

    if (
        !allowed.includes(action)
    ) {
        return;
    }

    const embed =
        buildEmbed(payload);

    await sendEmbed(embed, undefined, env);
};
