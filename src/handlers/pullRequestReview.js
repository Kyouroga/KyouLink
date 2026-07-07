import { sendEmbed } from '../services/discord.js';

import buildEmbed from '../embeds/reviewEmbed.js';

export default async (payload, env = {}) => {
    if (
        payload.action !==
        "submitted"
    ) {
        return;
    }

    const embed =
        buildEmbed(payload);

    await sendEmbed(embed, undefined, env);
};
