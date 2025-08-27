import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import cors from "cors";
import { Probot } from "probot";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import githubApp from "./github/githubApp.js";
import aiRoutes from "./routes/ai.js";
import rssRoutes from "./routes/rss.js";
import userRoutes from "./routes/user.js";
import webhookRoutes from "./routes/webhooks.js";

dotenv.config();

const app = express();

// --- MIDDLEWARE --- //
app.use(cors());
app.use(bodyParser.json());
app.use(session({
  secret: process.env.SESSION_SECRET || "supersecret",
  resave: false,
  saveUninitialized: true
}));

// --- ROUTES --- //
app.use("/api/ai", aiRoutes);
app.use("/api/rss", rssRoutes);
app.use("/api/user", userRoutes);

// Webhooks (GitHub App events)
app.use("/api/webhooks", webhookRoutes);

// --- PROBOT APP (GitHub App integration) --- //
const probot = Probot({
  appId: process.env.GITHUB_APP_ID,
  privateKey: process.env.GITHUB_PRIVATE_KEY.replace(/\\n/g, "\n"),
  secret: process.env.GITHUB_WEBHOOK_SECRET,
  // logLevel: "debug"
});
probot.load(githubApp);

// Listen for GitHub webhooks
app.post("/github/webhooks", express.json({ type: "*/*" }), (req, res, next) => {
  probot.webhooks.middleware(req, res, next);
});

// --- HEALTH CHECK --- //
app.get("/health", (_, res) => res.json({ ok: true }));

// --- SERVE FRONTEND (optional, for fullstack local dev) --- //
if (process.env.NODE_ENV === "production") {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get("*", (_, res) =>
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"))
  );
}

// --- START SERVER --- //
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  if (process.env.NODE_ENV !== "production") {
    console.log("Visit http://localhost:4000/health for health check");
  }
});

export default app;