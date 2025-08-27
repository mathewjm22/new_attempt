// Probot GitHub App definition
// Handles webhooks, authentication, and user storage in Gists

import { Octokit } from "@octokit/rest";

export default (app) => {
  // Respond to Issues, PRs, etc. for future collab features
  app.on("issues.opened", async context => {
    // Example: auto-comment on new issues mentioning "clinical case"
    const { issue } = context.payload;
    if (issue.title.toLowerCase().includes("clinical case")) {
      await context.octokit.issues.createComment(context.issue({
        body: "👋 Thanks for sharing a clinical case! The Clinical Pattern Recognition Trainer bot is listening."
      }));
    }
  });

  // Respond to other events as needed (Discussions, PRs, etc.)

  // Optionally: Listen for 'clinical-trainer-case' label to sync shared cases
};