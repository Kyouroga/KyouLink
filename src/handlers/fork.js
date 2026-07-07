import { sendEmbed } from '../services/discord.js';

import buildEmbed from '../embeds/forkEmbed.js';

export default async (payload, env = {}) => {
    const embed =
        buildEmbed(payload);

    await sendEmbed(embed, undefined, env);
};
