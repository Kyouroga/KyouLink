const { sendEmbed } =
    require("../services/discord");

const buildEmbed =
    require("../embeds/forkEmbed");

module.exports = async payload => {
    const embed =
        buildEmbed(payload);

    await sendEmbed(embed);
};