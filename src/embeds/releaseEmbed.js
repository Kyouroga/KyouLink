import * as COLORS from '../utils/colors.js';

import truncate from '../utils/truncate.js';

export default payload => {
    const repo =
        payload.repository || {};

    const release =
        payload.release || {};

    const user =
        release.author ||
        payload.sender ||
        {};

    const title =
        `[${repo.full_name}] Release ${payload.action || "published"}: ${release.name || release.tag_name || "Release"}`.trim();

    const embed = {
        color:
            COLORS.RELEASE,

        author: {
            name:
                user.login ||
                "Unknown User",

            url:
                user.html_url,

            icon_url:
                user.avatar_url
        },

        title,

        url:
            release.html_url,

        fields: [
            {
                name:
                    "Tag",
                value:
                    release.tag_name ||
                    "Unknown",
                inline: true
            },
            {
                name:
                    "Release Name",
                value:
                    release.name ||
                    "Unnamed Release",
                inline: true
            }
        ]
    };

    const description =
        truncate(
            release.body ||
            `Version: ${release.tag_name}`,
            1800
        );

    if (
        description &&
        description !==
            "No content provided."
    ) {
        embed.description =
            description;
    }

    return embed;
};
