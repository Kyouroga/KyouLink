const { sendEmbed } =
    require("../services/discord");

const buildEmbed =
    require("../embeds/reviewEmbed");

module.exports = async payload => {
    if (
        payload.action !==
        "submitted"
    ) {
        return;
    }

    const embed =
        buildEmbed(payload);

    await sendEmbed(embed);
};