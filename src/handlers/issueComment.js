import { sendEmbed } from '../services/discord.js';

import buildIssueCommentEmbed from '../embeds/issueCommentEmbed.js';
import buildPullRequestCommentEmbed from '../embeds/pullRequestCommentEmbed.js';

export default async (payload, env = {}) => {
    if (
        payload.action !==
        "created"
    ) {
        return;
    }

    const isPullRequestComment =
        payload.issue?.pull_request;

    const embed = isPullRequestComment
        ? buildPullRequestCommentEmbed(payload)
        : buildIssueCommentEmbed(payload);

    await sendEmbed(embed, undefined, env);
};
