const truncate = require("./truncate");

function formatCommitList(commits = []) {
    return commits
        .slice(0, 10)
        .map(commit => {
            const hash = commit.id.substring(0, 7);

            return [
                `\`${hash}\``,
                truncate(
                    commit.message.split("\n")[0],
                    100
                ),
                `- ${commit.author.name}`
            ].join(" ");
        })
        .join("\n");
}

function getBranchName(ref = "") {
    return ref.replace("refs/heads/", "");
}

function getTagName(ref = "") {
    return ref.replace("refs/tags/", "");
}

module.exports = {
    formatCommitList,
    getBranchName,
    getTagName
};