import COLORS from '../utils/colors.js';

import truncate from '../utils/truncate.js';

export default payload => {
    const issue =
        payload.issue || {};

    const user =
        issue.user ||
        payload.sender ||
        {};

    const repo =
        payload.repository || {};

    let color =
        COLORS.ISSUE_OPENED;

    if (
        payload.action ===
        "closed"
    ) {
        color =
            COLORS.ISSUE_CLOSED;
    }

    if (
        payload.action ===
        "reopened"
    ) {
        color =
            COLORS.ISSUE_REOPENED;
    }

    const actionText = {
        opened:
            "Issue opened",
        closed:
            "Issue closed",
        reopened:
            "Issue reopened"
    };

    const title =
        `[${repo.full_name}] ${actionText[payload.action] || actionText.opened}: #${issue.number} ${issue.title || ""}`.trim();

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
            issue.html_url
    };

    const description =
        truncate(
            issue.body || "",
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
