const { sendEmbed } =
    require("../services/discord");

const buildEmbed =
    require(
        "../embeds/discussionEmbed"
    );

module.exports = async payload => {
    const action =
        payload.action;

    const allowed = [
        "created",
        "answered"
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