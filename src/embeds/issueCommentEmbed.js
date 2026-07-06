const COLORS =
    require("../utils/colors");

const truncate =
    require("../utils/truncate");

module.exports = payload => {
    const repo =
        payload.repository || {};

    const issue =
        payload.issue || {};

    const comment =
        payload.comment || {};

    const user =
        comment.user || {};

    const embed = {
        color:
            COLORS.ISSUE_COMMENT,

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
            `[${repo.full_name}] New comment on issue #${issue.number}: ${issue.title}`,

        url:
            comment.html_url,

        timestamp:
            new Date().toISOString()
    };

    const description =
        truncate(
            comment.body || "",
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
