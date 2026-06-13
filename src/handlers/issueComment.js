const { sendEmbed } =
    require("../services/discord");

const buildEmbed =
    require(
        "../embeds/issueCommentEmbed"
    );

module.exports = async payload => {
    if (
        payload.action !==
        "created"
    ) {
        return;
    }

    const embed =
        buildEmbed(payload);

    await sendEmbed(embed);
};