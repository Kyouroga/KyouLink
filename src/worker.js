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

// Cloudflare Worker entrypoint for incoming GitHub webhook requests.
// Notes: Preserves raw request data and forwards it to the webhook handler.
import { handleGithubWebhook } from './github/webhookHandler.js';

export default {
  async fetch(request, env) {
    const rawBody = await request.arrayBuffer();

    const result = await handleGithubWebhook({
      method: request.method,
      headers: request.headers,
      rawBody,
      parsedBody: undefined,
      env,
      url: request.url
    });

    return new Response(JSON.stringify(result.body), {
      status: result.status,
      headers: {
        'content-type': 'application/json'
      }
    });
  }
};




