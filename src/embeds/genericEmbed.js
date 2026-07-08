import * as COLORS from '../utils/colors.js';
import { getBranchName } from '../utils/formatters.js';

const EVENT_COLOR_MAP = {
    push: COLORS.PUSH,
    fork: COLORS.FORK,
    issues: COLORS.ISSUE_OPENED,
    issue_comment: COLORS.ISSUE_COMMENT,
    pull_request: COLORS.PR_OPENED,
    pull_request_review: COLORS.REVIEW,
    pull_request_review_comment: COLORS.REVIEW_COMMENT,
    release: COLORS.RELEASE,
    discussion: COLORS.DISCUSSION,
    watch: COLORS.STAR,
    star: COLORS.STAR
};

function getEventColor(event = '', action = '') {
    const normalized = String(event).toLowerCase();
    const actionValue = String(action).toLowerCase();

    switch (normalized) {
        case 'issues':
            if (actionValue === 'closed') return COLORS.ISSUE_CLOSED;
            if (actionValue === 'reopened') return COLORS.ISSUE_REOPENED;
            return COLORS.ISSUE_OPENED;
        case 'pull_request':
            if (actionValue === 'closed') return COLORS.PR_CLOSED;
            if (actionValue === 'reopened') return COLORS.PR_REOPENED;
            return COLORS.PR_OPENED;
        case 'pull_request_review':
            if (actionValue === 'approved') return 0x2ECC71;
            if (actionValue === 'changes_requested') return 0xE74C3C;
            return COLORS.REVIEW;
        default:
            return EVENT_COLOR_MAP[normalized] || COLORS.FORK;
    }
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
    const repoName =
        payload.repository?.full_name ||
        payload.repository?.name ||
        payload.repo?.full_name ||
        payload.repo?.name ||
        'Repository';

    const normalizedAction = normalizeAction(event, action);

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

        return `[${repoName}] New branch ${branchAction}: ${branch || 'unknown'}`;
    }

    if (
        event === 'watch' ||
        event === 'star'
    ) {
        return `[${repoName}] Repository ${normalizedAction}`;
    }

    const subject =
        payload.issue?.number
            ? `issue #${payload.issue.number}`
            : payload.pull_request?.number
            ? `PR #${payload.pull_request.number}`
            : payload.release?.tag_name || payload.release?.name
            ? `release ${payload.release.tag_name || payload.release.name}`
            : payload.discussion?.title
            ? 'discussion'
            : payload.comment?.html_url
            ? 'comment'
            : '';

    const actionText = String(normalizedAction || event || 'updated')
        .replace(/_/g, ' ')
        .trim();

    const titleParts = [`[${repoName}]`, actionText];
    if (subject) {
        titleParts.push(`(${subject})`);
    }

    return titleParts.filter(Boolean).join(' ').trim();
}

function getUrl(payload) {
    return (
        payload.comment?.html_url ||
        payload.issue?.html_url ||
        payload.pull_request?.html_url ||
        payload.release?.html_url ||
        payload.discussion?.html_url ||
        payload.compare ||
        payload.repository?.html_url ||
        undefined
    );
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

    const title = getTitle(payload, event, action);
    const url = getUrl(payload);

    return {
        color: getEventColor(event, action),
        title,
        url
    };
};
