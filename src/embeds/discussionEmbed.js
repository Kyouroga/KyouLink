import * as COLORS from '../utils/colors.js';

import truncate from '../utils/truncate.js';

export default payload => {
    const repo =
        payload.repository || {};

    const discussion =
        payload.discussion || {};

    const user =
        discussion.user ||
        payload.sender ||
        {};

    const action =
        payload.action;

    let title =
        `[${repo.full_name}] Discussion`;

    if (
        action === "created"
    ) {
        title =
            `[${repo.full_name}] Discussion created`;
    }

    if (
        action === "answered"
    ) {
        title =
            `[${repo.full_name}] Discussion answered`;
    }

    if (
        discussion.title
    ) {
        title =
            `${title}: ${discussion.title}`;
    }

    const embed = {
        color:
            COLORS.DISCUSSION,

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
            discussion.html_url,

        fields: [
            {
                name:
                    "Category",
                value:
                    discussion.category
                        ?.name ||
                    "Unknown",
                inline: true
            }
        ]
    };

    const description =
        truncate(
            discussion.body || "",
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
