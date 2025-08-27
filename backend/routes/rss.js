// Proxy PubMed RSS feeds via RSS2JSON

import express from "express";
import axios from "axios";
const router = express.Router();

const specialtyFeeds = {
  cardiology: "https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fpubmed.ncbi.nlm.nih.gov%2Frss%2Fsearch%2F1FAuRRws3kezNVZgH5I1cUGkRYQ3kMAMwLmhqK6BQxKL-uagsT%2F%3Flimit%3D15%26utm_campaign%3Dpubmed-2%26fc%3D20250823010449",
  pulmonology: "https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fpubmed.ncbi.nlm.nih.gov%2Frss%2Fsearch%2F1BwDT-LAhNxOxfLN_XyLmDOsG60JOW_7bFNkOmj3lSd07CQoPX%2F%3Flimit%3D15%26utm_campaign%3Dpubmed-2%26fc%3D20250823011800",
  nephrology: "https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fpubmed.ncbi.nlm.nih.gov%2Frss%2Fsearch%2F1JsSDwnbM1SVzR3rnSgW2SYmGiFttvT8cqiHXSaJH6v6q0z5mX%2F%3Flimit%3D15%26utm_campaign%3Dpubmed-2%26fc%3D20250823012919",
  // ...add all other specialties from your rss feeds.txt...
  infectiousdiseases: "https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fpubmed.ncbi.nlm.nih.gov%2Frss%2Fsearch%2F1LM5GtZJjqwJ8IkiNyg31T9Mn6ctQOnzvZ4P1u2QY_MWJvHI14%2F%3Flimit%3D15%26utm_campaign%3Dpubmed-2%26fc%3D20250823121840"
};

router.get("/:specialty", async (req, res) => {
  const spec = req.params.specialty.toLowerCase();
  const url = specialtyFeeds[spec];
  if (!url) return res.status(404).json({ error: "Specialty not found." });
  try {
    const { data } = await axios.get(url);
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: "RSS fetch error", details: err.message });
  }
});

export default router;