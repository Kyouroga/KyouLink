const { sendEmbed } =
    require("../services/discord");

const buildEmbed =
    require("../embeds/releaseEmbed");

module.exports = async payload => {
    const action =
        payload.action;

    const allowed = [
        "published",
        "created"
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