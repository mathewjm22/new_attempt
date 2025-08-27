# Clinical Pattern Recognition Trainer Backend

This is the backend (Node.js + Express + Probot) for the Clinical Pattern Recognition Trainer, deployed as a GitHub App.

## Features

- Gemini API proxy for all AI calls (real-time, no mock data)
- PubMed RSS proxy for Journal Club
- User progress/case persistence in each user's private GitHub Gist
- GitHub OAuth authentication
- GitHub App webhooks (for future integrations)
- CORS enabled for frontend on a different domain

## Setup

1. **Clone this repo and `cd backend`**
2. **Copy `.env.example` to `.env` and fill in your secrets (see main README)**
3. **Install dependencies:**
   ```bash
   npm install
   ```
4. **Run the server:**
   ```bash
   npm start
   ```
   Or for development (with hot reload):
   ```bash
   npm run dev
   ```

5. **GitHub App Setup**
   - Register a GitHub App at https://github.com/settings/apps/new
   - Fill in the required fields, set webhook URL to `/github/webhooks`
   - Grant only the permissions you need (Gists, user:email, Issues if you want collab)
   - Generate a private key, copy it and your app ID into the `.env` file

6. **Frontend**
   - See `/frontend/README.md` for setup instructions.

## Endpoints

- `/api/ai/generate` — Proxy for Gemini API (POST)
- `/api/rss/:specialty` — Get PubMed feed for a specialty (GET)
- `/api/user/progress` — Get user progress/cases from Gist (GET, needs token)
- `/api/user/save` — Save user progress/cases to Gist (POST, needs token)
- `/github/webhooks` — Receives GitHub App webhooks

## Notes

- You must complete the frontend GitHub OAuth flow to get a token for user endpoints.
- All user data is stored in a private Gist on their GitHub account. No centralized DB needed!

---

MIT License