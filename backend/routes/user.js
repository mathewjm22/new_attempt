// User progress/cases stored in private Gist via GitHub API

import express from "express";
import { Octokit } from "@octokit/rest";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

// Utility: get authenticated Octokit instance for user
function getOctokit(token) {
  return new Octokit({ auth: token });
}

// --- GET user progress/cases from Gist --- //
router.get("/progress", async (req, res) => {
  // In production, get user from session, here simulated as demo
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "No GitHub token" });

  const octokit = getOctokit(token);
  try {
    // Find user's Gist by description or filename
    const { data: gists } = await octokit.gists.list();
    const gist = gists.find(g =>
      g.description && g.description.includes("CPR Trainer Progress")
    );
    if (!gist) return res.json({ progress: null, cases: [] });
    // File: cpr_progress.json
    const file = gist.files["cpr_progress.json"];
    if (!file) return res.json({ progress: null, cases: [] });

    const fileResp = await fetch(file.raw_url);
    const body = await fileResp.json();
    res.json(body);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch progress", details: err.message });
  }
});

// --- POST user progress/cases to Gist --- //
router.post("/save", async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "No GitHub token" });

  const { progress, cases } = req.body;
  const octokit = getOctokit(token);

  try {
    // Search for existing Gist
    const { data: gists } = await octokit.gists.list();
    let gist = gists.find(g =>
      g.description && g.description.includes("CPR Trainer Progress")
    );

    const content = JSON.stringify({ progress, cases }, null, 2);

    if (gist) {
      // Update existing Gist
      await octokit.gists.update({
        gist_id: gist.id,
        files: { "cpr_progress.json": { content } }
      });
    } else {
      // Create new private Gist
      await octokit.gists.create({
        description: "CPR Trainer Progress Gist - DO NOT SHARE",
        public: false,
        files: { "cpr_progress.json": { content } }
      });
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to save progress", details: err.message });
  }
});

export default router;