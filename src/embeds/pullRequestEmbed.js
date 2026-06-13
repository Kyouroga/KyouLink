const COLORS =
    require("../utils/colors");

const truncate =
    require("../utils/truncate");

module.exports = payload => {
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
        "Pull Request opened";

    if (
        payload.action ===
        "reopened"
    ) {
        color =
            COLORS.PR_REOPENED;

        actionText =
            "Pull Request reopened";
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
                "Pull Request merged";
        } else {
            color =
                COLORS.PR_CLOSED;

            actionText =
                "Pull Request closed";
        }
    }

    const fields = [
        {
            name:
                "Source Branch",
            value:
                pr.head?.ref ||
                "Unknown",
            inline: true
        },
        {
            name:
                "Target Branch",
            value:
                pr.base?.ref ||
                "Unknown",
            inline: true
        }
    ];

    if (
        typeof pr.changed_files ===
        "number"
    ) {
        fields.push({
            name:
                "Files Changed",
            value:
                String(
                    pr.changed_files
                ),
            inline: true
        });
    }

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
            `[${repo.full_name}] ${actionText}: #${pr.number}`,

        url:
            pr.html_url,

        description:
            truncate(
                `${pr.title}\n\n${pr.body || ""}`,
                1800
            ),

        fields,

        footer: {
            text:
                repo.full_name
        },

        timestamp:
            new Date().toISOString()
    };
};