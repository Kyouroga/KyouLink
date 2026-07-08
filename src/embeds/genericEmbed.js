import { getBranchName } from '../utils/formatters.js';

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

        return `${senderName} ${branchAction} branch ${branch || 'unknown'} in ${repoName}`;
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
    const embed = {
        title
    };

    if (url && !isBranchLifecycleEvent(payload, event)) {
        embed.url = url;
    }

    return embed;
};
