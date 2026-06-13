module.exports = () => ({});

const COLORS =
    require("../utils/colors");

module.exports = payload => {
    const repo =
        payload.repository || {};

    const sender =
        payload.sender || {};

    return {
        color:
            COLORS.STAR,

        author: {
            name:
                sender.login ||
                "Unknown User",

            url:
                sender.html_url,

            icon_url:
                sender.avatar_url
        },

        title:
            `[${repo.full_name}] Repository Starred`,

        url:
            repo.html_url,

        description:
            `${sender.login} starred the repository.`,

        footer: {
            text:
                repo.full_name
        },

        timestamp:
            new Date().toISOString()
    };
};