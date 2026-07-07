const isNode =
    typeof process !== "undefined" &&
    process?.versions?.node;

function getConfig(env = {}) {
    const source =
        env && Object.keys(env).length > 0
            ? env
            : isNode
            ? process.env
            : {};

    return {
        port: parseInt(source.PORT || "3000", 10),
        github: {
            secret: source.GITHUB_SECRET || ""
        },
        discord: {
            webhookUrl: source.DISCORD_WEBHOOK_URL || ""
        }
    };
}

export { getConfig };
