const COLORS =
    require("../utils/colors");

const truncate =
    require("../utils/truncate");

module.exports = payload => {
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

    return {
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

        title:
            `[${repo.full_name}] ${actionText[payload.action]}: #${issue.number}`,

        url:
            issue.html_url,

        description:
            truncate(
                `${issue.title}\n\n${issue.body || ""}`,
                1800
            ),

        footer: {
            text:
                repo.full_name
        },

        timestamp:
            new Date().toISOString()
    };
};