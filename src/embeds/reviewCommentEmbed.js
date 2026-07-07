import COLORS from '../utils/colors.js';

import truncate from '../utils/truncate.js';

export default payload => {
    const repo =
        payload.repository || {};

    const pr =
        payload.pull_request || {};

    const comment =
        payload.comment || {};

    const user =
        comment.user || {};

    const embed = {
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
            comment.html_url
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
