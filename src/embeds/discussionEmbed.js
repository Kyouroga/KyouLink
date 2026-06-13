module.exports = () => ({});

const COLORS =
    require("../utils/colors");

const truncate =
    require("../utils/truncate");

module.exports = payload => {
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
            `[${repo.full_name}] Discussion Created`;
    }

    if (
        action === "answered"
    ) {
        title =
            `[${repo.full_name}] Discussion Answered`;
    }

    return {
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

        description:
            truncate(
                `${discussion.title}\n\n${discussion.body || ""}`,
                1800
            ),

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
        ],

        footer: {
            text:
                repo.full_name
        },

        timestamp:
            new Date().toISOString()
    };
};