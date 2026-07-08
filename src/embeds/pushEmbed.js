import * as COLORS from '../utils/colors.js';

import { formatCommitList,
    getBranchName } from '../utils/formatters.js';

function buildBranchEmbed(payload) {
    const repo =
        payload.repository?.full_name ||
        "Unknown Repository";

    const branch =
        getBranchName(
            payload.ref || ""
        );

    const action = payload.deleted
        ? "deleted"
        : payload.created
        ? "created"
        : "updated";

    const title =
        `[${repo}] Branch ${action}: ${branch || "unknown"}`;

    const embed = {
        color: COLORS.PUSH,
        title
    };

    if (payload.created && payload.head_commit?.message) {
        embed.description = payload.head_commit.message;
    }

    if (payload.compare) {
        embed.url = payload.compare;
    }

    return embed;
}

export default payload => {
    const isBranchRef =
        payload.ref_type === "branch";

    if (
        isBranchRef &&
        (payload.created || payload.deleted)
    ) {
        return buildBranchEmbed(payload);
    }

    const repo =
        payload.repository?.full_name ||
        "Unknown Repository";

    const branch =
        getBranchName(
            payload.ref || ""
        );

    const sender =
        payload.sender || {};

    const commits =
        payload.commits || [];

    const commitCount =
        commits.length;

    return {
        color: COLORS.PUSH,

        author: {
            name:
                sender.login ||
                "Unknown User",
            url:
                sender.html_url ||
                undefined,
            icon_url:
                sender.avatar_url ||
                undefined
        },

        title:
            `[${repo}:${branch}] ${commitCount} new commit${commitCount === 1 ? "" : "s"}`,

        url:
            payload.compare ||
            payload.repository?.html_url,

        description:
            commitCount > 0
                ? formatCommitList(
                      commits
                  )
                : "No commits included in payload."
    };
};
