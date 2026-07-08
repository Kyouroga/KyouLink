import discussionHandler from "../handlers/discussion.js";
import forkHandler from "../handlers/fork.js";
import issueCommentHandler from "../handlers/issueComment.js";
import issuesHandler from "../handlers/issues.js";
import pullRequestHandler from "../handlers/pullRequest.js";
import pullRequestReviewCommentHandler from "../handlers/pullRequestReviewComment.js";
import pullRequestReviewHandler from "../handlers/pullRequestReview.js";
import pushHandler from "../handlers/push.js";
import releaseHandler from "../handlers/release.js";
import { sendEmbed } from "../services/discord.js";
import buildGenericEmbed from "../embeds/genericEmbed.js";

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

export default async function dispatch(event, payload, env = {}) {
    const handler = handlers[event];

    if (handler) {
        await handler(payload, env);
        return;
    }

    console.log(`Generic fallback for event: ${event}`);

    const embed = buildGenericEmbed(payload, event);
    if (!embed) {
        return;
    }

    await sendEmbed(embed, undefined, env);
};
