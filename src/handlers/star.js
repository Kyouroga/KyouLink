const { sendEmbed } =
    require("../services/discord");

const buildEmbed =
    require("../embeds/starEmbed");

module.exports = async payload => {
    const action =
        payload.action;

    if (
        action !== "started"
    ) {
        return;
    }

    const embed =
        buildEmbed(payload);

    await sendEmbed(embed);
};