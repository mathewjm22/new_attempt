// Proxy all Gemini AI calls

import express from "express";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/google/gemini-2.0-flash-exp:free:generateContent";

// Proxy POST /api/ai/generate
router.post("/generate", async (req, res) => {
  try {
    const { prompt, generationConfig } = req.body;
    const response = await axios.post(
      GEMINI_API_URL + `?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: generationConfig || { responseMimeType: "application/json" }
      }
    );
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: "AI proxy error", details: err.message });
  }
});

export default router;