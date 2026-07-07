import * as COLORS from '../utils/colors.js';

import { formatCommitList,
    getBranchName } from '../utils/formatters.js';

export default payload => {
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
