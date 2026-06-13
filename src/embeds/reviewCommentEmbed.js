module.exports = () => ({});

const COLORS =
    require("../utils/colors");

const truncate =
    require("../utils/truncate");

module.exports = payload => {
    const repo =
        payload.repository || {};

    const pr =
        payload.pull_request || {};

    const comment =
        payload.comment || {};

    const user =
        comment.user || {};

    return {
        color:
            COLORS.REVIEW_COMMENT,

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
            `[${repo.full_name}] Review Comment on PR #${pr.number}`,

        url:
            comment.html_url,

        description:
            truncate(
                comment.body,
                1800
            ),

        fields: [
            {
                name:
                    "Pull Request",
                value:
                    pr.title ||
                    "Unknown",
                inline: false
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