module.exports = () => ({});

const COLORS =
    require("../utils/colors");

const truncate =
    require("../utils/truncate");

module.exports = payload => {
    const repo =
        payload.repository || {};

    const release =
        payload.release || {};

    const user =
        release.author ||
        payload.sender ||
        {};

    return {
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

        title:
            `[${repo.full_name}] Release ${payload.action}`,

        url:
            release.html_url,

        description:
            truncate(
                release.body ||
                `Version: ${release.tag_name}`,
                1800
            ),

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
        ],

        footer: {
            text:
                repo.full_name
        },

        timestamp:
            release.published_at ||
            new Date().toISOString()
    };
};