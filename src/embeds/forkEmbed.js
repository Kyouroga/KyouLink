const COLORS =
    require("../utils/colors");

module.exports = payload => {
    const sender =
        payload.sender || {};

    const repository =
        payload.repository || {};

    const forkee =
        payload.forkee || {};

    return {
        color: COLORS.FORK,

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
            `[${repository.full_name}] Fork created`,

        url:
            forkee.html_url,

        description:
            `Fork Repository: **${forkee.full_name}**`,

        footer: {
            text:
                repository.full_name
        },

        timestamp:
            new Date().toISOString()
    };
};