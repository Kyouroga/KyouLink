const handlers = {
    push: require("../handlers/push"),

    fork: require("../handlers/fork"),

    issues: require("../handlers/issues"),

    issue_comment:
        require("../handlers/issueComment"),

    pull_request:
        require("../handlers/pullRequest"),

    pull_request_review:
        require(
            "../handlers/pullRequestReview"
        ),

    pull_request_review_comment:
        require(
            "../handlers/pullRequestReviewComment"
        ),

    release: require("../handlers/release"),

    discussion:
        require("../handlers/discussion"),

    watch: require("../handlers/star")
};

module.exports = async (
    event,
    payload
) => {
    const handler = handlers[event];

    if (!handler) {
        console.log(
            `Unhandled event: ${event}`
        );
        return;
    }

    await handler(payload);
};