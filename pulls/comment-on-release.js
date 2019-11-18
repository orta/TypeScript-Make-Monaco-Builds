// @ts-check

if (!process.env.GITHUB_TOKEN) {
  throw new Error("No GITHUB_TOKEN specified");
}

if (!process.argv[2]) {
  throw new Error("No Pull Request number specified");
}

if (!process.argv[3]) {
  throw new Error("No npm tag specified");
}

const prNumber = process.argv[2];
const npmTag = process.argv[3];

const github = require("@actions/github");
const octokit = new github.GitHub(process.env.BOT_GITHUB_TOKEN);

// @ts-check

// Prints a semver version for the PR sandbox

if (!process.env.BOT_GITHUB_TOKEN) {
  throw new Error("No BOT_GITHUB_TOKEN specified");
}

if (!process.argv[2]) {
  throw new Error("No Pull Request number specified");
}

const options = octokit.issues.listComments.endpoint.merge({
  owner: "microsoft",
  repo: "TypeScript",
  issue_number: prNumber
});

// Download all comments
octokit.paginate(options).then(
  results => {
    // Get comments by the TS bot and sort them so the most recent is first
    const messagesByTheBot = results.filter(issue => issue.user.id === 23042052).reverse();
    const messageWithTGZ = messagesByTheBot.find(m => m.body.includes("an installable tgz") && m.body.includes("packed"));

    // If we find it and it's not sneakily been edit already
    if (messageWithTGZ && !messageWithTGZ.body.includes("playground")) {
      console.error(`Updating comment ${messageWithTGZ.id} on microsoft/TypeScript#${prNumber}`);
      const newBody = `${messageWithTGZ.body}\n\n---\n\nThere is also a playground [for this build](https://www.typescriptlang.org/play/index.html?ts=${npmTag}).`;

      octokit.issues.updateComment({
        comment_id: messageWithTGZ.id,
        body: newBody,
        owner: "microsoft",
        repo: "TypeScript"
      });
    }
  },
  failed => {
    process.exitCode = 1;
    console.log("Failed to get PR comments:", failed);
  }
);
