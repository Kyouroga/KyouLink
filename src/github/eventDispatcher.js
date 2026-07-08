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

// Route supported GitHub events to their dedicated handlers.
// Notes: Generic fallback is disabled so unknown events do not emit embeds.
import discussionHandler from "../handlers/discussion.js";
import forkHandler from "../handlers/fork.js";
import issueCommentHandler from "../handlers/issueComment.js";
import issuesHandler from "../handlers/issues.js";
import pullRequestHandler from "../handlers/pullRequest.js";
import pullRequestReviewCommentHandler from "../handlers/pullRequestReviewComment.js";
import pullRequestReviewHandler from "../handlers/pullRequestReview.js";
import pushHandler from "../handlers/push.js";
import releaseHandler from "../handlers/release.js";

const handlers = {
    push: pushHandler,
    fork: forkHandler,
    issues: issuesHandler,
    issue_comment: issueCommentHandler,
    pull_request: pullRequestHandler,
    pull_request_review: pullRequestReviewHandler,
    pull_request_review_comment: pullRequestReviewCommentHandler,
    release: releaseHandler,
    discussion: discussionHandler
};

// Route only supported GitHub events to their dedicated handlers.
// Unknown events are ignored rather than emitting a generic fallback embed.
export default async function dispatch(event, payload, env = {}) {
    const handler = handlers[event];

    if (handler) {
        await handler(payload, env);
    }
};





