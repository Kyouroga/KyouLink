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
 * Project: Kyouroga Bridge Git
 * Repository: https://github.com/Kyouroga/Kyouroga-Bridge-Git
 *
 * For contribution guidelines, coding standards, and the pull request process,
 * see CONTRIBUTING.md in the project root.
 */

// Build issue embeds and attribute closed/reopened actions to the event sender.
import * as COLORS from '../utils/colors.js';

import truncate from '../utils/truncate.js';

export default payload => {
    const issue =
        payload.issue || {};

    // For closed and reopened actions, the event sender is the actor who changed
    // the issue state, so attribute the embed author accordingly.
    const user =
        payload.action === 'closed' ||
        payload.action === 'reopened'
            ? payload.sender || issue.user || {}
            : issue.user || payload.sender || {};

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
        payload.action === "opened"
            ? truncate(issue.body || "", 1800)
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





