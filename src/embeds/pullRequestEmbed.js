import * as COLORS from '../utils/colors.js';

import truncate from '../utils/truncate.js';

export default payload => {
    const repo =
        payload.repository || {};

    const pr =
        payload.pull_request ||
        {};

    const user =
        pr.user ||
        payload.sender ||
        {};

    let color =
        COLORS.PR_OPENED;

    let actionText =
        "Pull request opened";

    if (
        payload.action ===
        "reopened"
    ) {
        color =
            COLORS.PR_REOPENED;

        actionText =
            "Pull request reopened";
    }

    if (
        payload.action ===
        "closed"
    ) {
        if (
            pr.merged
        ) {
            color =
                COLORS.PR_MERGED;

            actionText =
                "Pull request merged";
        } else {
            color =
                COLORS.PR_CLOSED;

            actionText =
                "Pull request closed";
        }
    }

    const title =
        `[${repo.full_name}] ${actionText}: #${pr.number} ${pr.title || ""}`.trim();

    const embed = {
        color,

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
            pr.html_url
    };

    const description =
        truncate(
            pr.body || "",
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
