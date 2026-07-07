import COLORS from '../utils/colors.js';

import truncate from '../utils/truncate.js';

export default payload => {
    const repo =
        payload.repository || {};

    const review =
        payload.review || {};

    const pr =
        payload.pull_request || {};

    const user =
        review.user || {};

    const state =
        (review.state || "")
            .toLowerCase();

    let color =
        COLORS.REVIEW;

    let stateText =
        "Review Submitted";

    switch (state) {
        case "approved":
            color = 0x2ECC71;
            stateText = "Approved";
            break;

        case "changes_requested":
            color = 0xE74C3C;
            stateText =
                "Changes Requested";
            break;

        case "commented":
            color = COLORS.REVIEW;
            stateText = "Commented";
            break;
    }

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

        title:
            `[${repo.full_name}] Review on PR #${pr.number}`,

        url:
            review.html_url ||
            pr.html_url,

        fields: [
            {
                name:
                    "Review State",
                value:
                    stateText,
                inline: true
            }
        ]
    };

    const description =
        truncate(
            review.body || "",
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
