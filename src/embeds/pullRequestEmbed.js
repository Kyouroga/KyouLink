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

// Build pull request embeds and use sender attribution for close/reopen actions.
import * as COLORS from '../utils/colors.js';

import truncate from '../utils/truncate.js';

export default payload => {
    // Resolve the repository and PR data first, then decide how to describe the action.
    const repo =
        payload.repository || {};

    const pr =
        payload.pull_request ||
        {};

    // For PR reopen/close actions, use the actor as the embed author.
    const user =
        payload.action === 'closed' ||
        payload.action === 'reopened'
            ? payload.sender || pr.user || {}
            : pr.user || payload.sender || {};

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
        payload.action === "opened"
            ? truncate(pr.body || "", 1800)
            : "";

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





