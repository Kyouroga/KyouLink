import truncate from './truncate.js';

function formatCommitList(commits = []) {
    return commits
        .slice(0, 10)
        .map(commit => {
            const hash = commit.id.substring(0, 7);
            const commitUrl = commit.url || "";
            const hashText = commitUrl
                ? `[\`${hash}\`](${commitUrl})`
                : `\`${hash}\``;

            return [
                hashText,
                truncate(
                    commit.message.split("\n")[0],
                    100
                ),
                `- ${commit.author?.name || commit.author?.login || "Unknown"}`
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

export { formatCommitList, getBranchName, getTagName };
