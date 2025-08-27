// Minimal GitHub webhook route for custom (non-Probot) events

import express from "express";
const router = express.Router();

// You may want to validate webhook signature here for security

router.post("/", (req, res) => {
  // Handle custom webhooks here
  // For most GitHub App events, Probot will process via /github/webhooks
  res.json({ ok: true });
});

export default router;