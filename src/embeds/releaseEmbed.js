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

// Build embeds for GitHub releases.
import * as COLORS from '../utils/colors.js';

import truncate from '../utils/truncate.js';

export default payload => {
    // Release embeds combine the repository context with the release details.
    const repo =
        payload.repository || {};

    const release =
        payload.release || {};

    // Prefer the actor who published the release as the embed author, falling back to the release author object when needed.
    const user =
        payload.sender ||
        release.author ||
        {};

    const title =
        `[${repo.full_name}] Release ${payload.action || "published"}: ${release.name || release.tag_name || "Release"}`.trim();

    const embed = {
        color:
            COLORS.RELEASE,

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
            release.html_url,

        fields: [
            {
                name:
                    "Tag",
                value:
                    release.tag_name ||
                    "Unknown",
                inline: true
            },
            {
                name:
                    "Release Name",
                value:
                    release.name ||
                    "Unnamed Release",
                inline: true
            }
        ]
    };

    const description =
        truncate(
            release.body ||
            `Version: ${release.tag_name}`,
            1800
        );

    if (description) {
        embed.description =
            description;
    }

    return embed;
};




