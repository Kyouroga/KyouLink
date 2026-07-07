import { sendEmbed } from '../services/discord.js';

import buildEmbed from '../embeds/issueCommentEmbed.js';

export default async (payload, env = {}) => {
    if (
        payload.action !==
        "created"
    ) {
        return;
    }

    const embed =
        buildEmbed(payload);

    await sendEmbed(embed, undefined, env);
};
