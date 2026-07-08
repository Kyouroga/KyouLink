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

// Deliver embed payloads to Discord via webhook POST.
// Notes: Resolves webhook URL from runtime env or config and sends JSON payload.
import { getConfig } from '../config/config.js';

async function sendEmbed(embed, webhookUrl, env = {}) {
    // Resolve the Discord webhook URL from runtime env or configured defaults.
    const config = getConfig(env);
    const url =
        webhookUrl ||
        env.DISCORD_WEBHOOK_URL ||
        config.discord.webhookUrl;

    if (!url) {
        throw new Error(
            'DISCORD_WEBHOOK_URL missing.'
        );
    }

    await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type':
                'application/json'
        },
        body: JSON.stringify({
            username: 'GitHub',
            avatar_url:
                'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
            embeds: [embed]
        })
    });
}

export { sendEmbed };





