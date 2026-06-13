const { sendEmbed } =
    require("../services/discord");

const buildEmbed =
    require("../embeds/issueEmbed");

module.exports = async payload => {
    const action =
        payload.action;

    const allowed = [
        "opened",
        "closed",
        "reopened"
    ];

    if (
        !allowed.includes(action)
    ) {
        return;
    }

    const embed =
        buildEmbed(payload);

    await sendEmbed(embed);
};