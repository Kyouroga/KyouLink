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

function formatDescription(payload) {
    const pieces = [];

    if (payload.body) {
        pieces.push(String(payload.body));
    }

    if (payload.comment?.body) {
        pieces.push(String(payload.comment.body));
    }

    if (payload.review?.body) {
        pieces.push(String(payload.review.body));
    }

    if (payload.issue?.body) {
        pieces.push(String(payload.issue.body));
    }

    if (payload.pull_request?.body) {
        pieces.push(String(payload.pull_request.body));
    }

    if (payload.head_commit?.message) {
        pieces.push(`Commit: ${payload.head_commit.message}`);
    }

    if (payload.release?.body) {
        pieces.push(String(payload.release.body));
    }

    if (payload.discussion?.body) {
        pieces.push(String(payload.discussion.body));
    }

    if (payload.alert?.rule?.name) {
        pieces.push(`Alert rule: ${payload.alert.rule.name}`);
    }

    if (payload.description) {
        pieces.push(String(payload.description));
    }

    if (payload.message) {
        pieces.push(String(payload.message));
    }

    return pieces.join('\n\n').slice(0, 1800);
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

function getTitle(payload, event, action) {
    const repoName =
        payload.repository?.full_name ||
        payload.repository?.name ||
        payload.repo?.full_name ||
        payload.repo?.name ||
        'Repository';

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

    const actionText = String(action || event || 'updated')
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

function addField(fields, name, value, inline = true) {
    if (value === undefined || value === null || value === '') {
        return;
    }

    fields.push({
        name,
        value: String(value),
        inline
    });
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

    const sender = getSender(payload);
    const title = getTitle(payload, event, action);
    const url = getUrl(payload);
    const branch = payload.ref ? getBranchName(payload.ref) : undefined;

    const embed = {
        color: getEventColor(event, action),
        author: {
            name: sender.login || sender.name || 'GitHub',
            url: sender.html_url,
            icon_url: sender.avatar_url
        },
        title,
        url,
        fields: []
    };

    addField(embed.fields, 'Repository', payload.repository?.full_name || payload.repository?.name || payload.repo?.full_name || payload.repo?.name);
    addField(embed.fields, 'Event', event);
    addField(embed.fields, 'Action', action);
    addField(embed.fields, 'Branch', branch);
    addField(embed.fields, 'Ref Type', payload.ref_type);
    addField(embed.fields, 'Environment', payload.environment);
    addField(embed.fields, 'Workflow', payload.workflow || payload.workflow_job?.name || payload.workflow_run?.name);
    addField(embed.fields, 'Sender', sender.login || sender.name);
    addField(embed.fields, 'Target', payload.base?.ref || payload.pull_request?.base?.ref || payload.pull_request?.head?.ref);
    addField(embed.fields, 'Issue / PR',
        payload.issue?.number ? `#${payload.issue.number}` : payload.pull_request?.number ? `#${payload.pull_request.number}` : undefined
    );

    if (normalizedAction !== 'closed') {
        const description = formatDescription(payload);
        if (description) {
            embed.description = description;
        }
    }

    return embed;
};
