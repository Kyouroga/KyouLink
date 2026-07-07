import * as COLORS from '../utils/colors.js';
import truncate from '../utils/truncate.js';

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

    if (payload.pull_request?.title) {
        pieces.push(`PR: ${payload.pull_request.title}`);
    }

    if (payload.head_commit?.message) {
        pieces.push(`Commit: ${payload.head_commit.message}`);
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

    return truncate(pieces.join('\n\n'), 1800);
}

export default function buildGenericEmbed(payload, event) {
    const repo = payload.repository || payload.repo || {};
    const sender = payload.sender || payload.actor || {};
    const action = payload.action || payload.state || payload.ref_type || payload.event || 'updated';

    const title = `[${repo.full_name || repo.name || 'Repository'}] ${event.replace(/_/g, ' ')}`;

    const embed = {
        color: COLORS.FORK,
        author: {
            name:
                sender.login ||
                sender.name ||
                'GitHub',
            url: sender.html_url,
            icon_url: sender.avatar_url
        },
        title,
        fields: []
    };

    if (repo.full_name || repo.name) {
        embed.fields.push({
            name: 'Repository',
            value: repo.full_name || repo.name,
            inline: true
        });
    }

    if (action) {
        embed.fields.push({
            name: 'Action',
            value: String(action),
            inline: true
        });
    }

    if (payload.ref) {
        embed.fields.push({
            name: 'Ref',
            value: String(payload.ref),
            inline: true
        });
    }

    if (payload.ref_type) {
        embed.fields.push({
            name: 'Ref Type',
            value: String(payload.ref_type),
            inline: true
        });
    }

    if (payload.environment) {
        embed.fields.push({
            name: 'Environment',
            value: String(payload.environment),
            inline: true
        });
    }

    if (payload.workflow) {
        embed.fields.push({
            name: 'Workflow',
            value: String(payload.workflow),
            inline: true
        });
    }

    if (payload.sender?.login) {
        embed.fields.push({
            name: 'Sender',
            value: payload.sender.login,
            inline: true
        });
    }

    if (payload.repository?.html_url) {
        embed.url = payload.repository.html_url;
    }

    const description = formatDescription(payload);
    if (description) {
        embed.description = description;
    }

    return embed;
};
