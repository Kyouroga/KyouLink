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

// Build embeds for pull request reviews.
import * as COLORS from '../utils/colors.js';

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




