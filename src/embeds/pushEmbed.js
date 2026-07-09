/*
 * Copyright (c) 2026 Kyouroga. https://kyouroga.org
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * Project: KyouLink
 * Repository: https://github.com/Kyouroga/KyouLink
 *
 * For contribution guidelines, coding standards, and the pull request process,
 * see CONTRIBUTING.md in the project root.
 */

// Build Discord embeds specifically for push events.
// Notes: Branch lifecycle events return title-only embeds; commit pushes include author and description.
import * as COLORS from '../utils/colors.js';

import { formatCommitList,
    getBranchName } from '../utils/formatters.js';

function buildBranchEmbed(payload) {
    // Branch lifecycle events are handled as title-only push embeds.
    // Created and deleted branches produce a simple branch notification.
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

    return {
        color: COLORS.PUSH,
        title: `[${repo}] New branch ${action}: ${branch || "unknown"}`
    };
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

    // Use the user who pushed the commits as the embed author for normal push events.
    const sender =
        payload.sender || {};

    const commits =
        payload.commits || [];

    const commitCount =
        commits.length;

    if (commitCount === 0) {
        return null;
    }

    return {
        color: COLORS.PUSH,

        // Use the commit author as the Discord embed author for normal push events.
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





