import COLORS from '../utils/colors.js';

export default payload => {
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
            `[${repository.full_name}] Fork created: ${forkee.full_name || forkee.name || "Unknown repository"}`,

        url:
            forkee.html_url
    };
};
