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

import { getBranchName } from '../utils/formatters.js';
import * as COLORS from '../utils/colors.js';

function getEventColor(event, action) {
    const normalizedEvent = String(event || '').toLowerCase();
    const normalizedAction = String(action || '').toLowerCase();

    if (normalizedEvent === 'push') {
        return COLORS.PUSH;
    }

    if (normalizedEvent === 'fork') {
        return COLORS.FORK;
    }

    if (normalizedEvent === 'issues') {
        if (normalizedAction === 'closed') {
            return COLORS.ISSUE_CLOSED;
        }

        if (normalizedAction === 'reopened') {
            return COLORS.ISSUE_REOPENED;
        }

        return COLORS.ISSUE_OPENED;
    }

    if (normalizedEvent === 'issue_comment') {
        return COLORS.ISSUE_COMMENT;
    }

    if (normalizedEvent === 'pull_request') {
        if (normalizedAction === 'closed') {
            return COLORS.PR_CLOSED;
        }

        if (normalizedAction === 'reopened') {
            return COLORS.PR_REOPENED;
        }

        return COLORS.PR_OPENED;
    }

    if (normalizedEvent === 'pull_request_review') {
        return COLORS.REVIEW;
    }

    if (normalizedEvent === 'pull_request_review_comment') {
        return COLORS.REVIEW_COMMENT;
    }

    if (normalizedEvent === 'release') {
        return COLORS.RELEASE;
    }

    if (normalizedEvent === 'watch' || normalizedEvent === 'star') {
        return COLORS.STAR;
    }

    if (normalizedEvent === 'discussion') {
        return COLORS.DISCUSSION;
    }

    return COLORS.PUSH;
}

function isRepositoryRenameEvent(payload, event, action) {
    return (
        String(event || '').toLowerCase() === 'repository' &&
        String(action || '').toLowerCase() === 'renamed'
    );
}

function getSender(payload) {
    return (
        payload.sender ||
        payload.actor ||
        payload.comment?.user ||
        payload.review?.user ||
        payload.issue?.user ||
        payload.pull_request?.user ||
        {}
    );
}

function normalizeAction(event, action) {
    const normalizedEvent = String(event).toLowerCase();
    const normalizedAction = String(action).toLowerCase();

    if (
        (normalizedEvent === 'watch' || normalizedEvent === 'star') &&
        normalizedAction === 'started'
    ) {
        return 'starred';
    }

    return normalizedAction;
}

function getTitle(payload, event, action) {
    const sender = getSender(payload);
    const senderName = sender.login || sender.name || sender.username || 'GitHub';
    const repoName =
        payload.repository?.full_name ||
        payload.repository?.name ||
        payload.repo?.full_name ||
        payload.repo?.name ||
        'Repository';

    const normalizedAction = normalizeAction(event, action);
    const actionText = String(normalizedAction || event || 'updated')
        .replace(/_/g, ' ')
        .trim();

    if (isRepositoryRenameEvent(payload, event, action)) {
        const previousName = payload.changes?.repository?.name?.from || 'unknown';
        const currentName = payload.repository?.name || repoName;
        return `${senderName} renamed repository: ${previousName} -> ${currentName}`;
    }

    if (
        event === 'push' &&
        payload.ref_type === 'branch' &&
        (payload.created || payload.deleted)
    ) {
        const branch = getBranchName(payload.ref || '');
        const branchAction = payload.deleted
            ? 'deleted'
            : payload.created
            ? 'created'
            : 'updated';

        if (branchAction === 'created') {
            return `[${repoName}] New branch created: ${branch || 'unknown'}`;
        }

        if (branchAction === 'deleted') {
            return `[${repoName}] branch deleted: ${branch || 'unknown'}`;
        }

        return `[${repoName}] Branch ${branchAction}: ${branch || 'unknown'}`;
    }

    if (event === 'watch' || event === 'star') {
        return `${senderName} starred repository ${repoName}`;
    }

    if (payload.issue?.number) {
        return `${senderName} ${actionText} issue #${payload.issue.number} in ${repoName}`;
    }

    if (payload.pull_request?.number) {
        return `${senderName} ${actionText} PR #${payload.pull_request.number} in ${repoName}`;
    }

    if (payload.release?.tag_name || payload.release?.name) {
        const releaseLabel = payload.release?.tag_name || payload.release?.name;
        return `${senderName} ${actionText} release ${releaseLabel} in ${repoName}`;
    }

    if (payload.discussion?.title) {
        return `${senderName} ${actionText} discussion "${payload.discussion.title}" in ${repoName}`;
    }

    if (payload.comment?.html_url) {
        const target = payload.issue?.number
            ? `issue #${payload.issue.number}`
            : payload.pull_request?.number
            ? `PR #${payload.pull_request.number}`
            : 'thread';
        return `${senderName} ${actionText} comment on ${target} in ${repoName}`;
    }

    return `${senderName} ${actionText} in ${repoName}`;
}

function getUrl(payload) {
    return (
        payload.comment?.html_url ||
        payload.issue?.html_url ||
        payload.pull_request?.html_url ||
        payload.release?.html_url ||
        payload.discussion?.html_url ||
        payload.repository?.html_url ||
        undefined
    );
}

function isBranchLifecycleEvent(payload, event) {
    return (
        event === 'push' &&
        payload.ref_type === 'branch' &&
        (payload.created || payload.deleted)
    );
}

function isIgnoredEvent(event) {
    const ignoredEvents = new Set([
        'workflow_run',
        'workflow_job',
        'workflow_dispatch',
        'check_run',
        'check_suite',
        'status'
    ]);

    return ignoredEvents.has(String(event).toLowerCase());
}

export default function buildGenericEmbed(payload, event) {
    const action = payload.action || payload.state || payload.ref_type || payload.event || 'updated';

    const normalizedEvent = String(event).toLowerCase();
    const normalizedAction = String(action).toLowerCase();

    if (
        (normalizedEvent === 'watch' || normalizedEvent === 'star') &&
        normalizedAction !== 'started'
    ) {
        return null;
    }

    if (isIgnoredEvent(event)) {
        return null;
    }

    const title = getTitle(payload, event, action);
    const url = getUrl(payload);
    const sender = getSender(payload);
    const repositoryRenameEvent = isRepositoryRenameEvent(payload, event, action);

    const embed = {
        color: getEventColor(event, action),
        author: {
            name: sender.login || sender.name || sender.username || 'GitHub',
            url: sender.html_url,
            icon_url: sender.avatar_url
        },
        title
    };

    if (url && !isBranchLifecycleEvent(payload, event) && !repositoryRenameEvent) {
        embed.url = url;
    }

    return embed;
};

