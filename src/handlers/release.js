import { sendEmbed } from '../services/discord.js';

import buildEmbed from '../embeds/releaseEmbed.js';

export default async (payload, env = {}) => {
    const action =
        payload.action;

    const allowed = [
        "published",
        "created"
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
