const express = require('express');
const router = express.Router();
const games = require('../sites/games');
// const films = require('../sites/films'); // Uncomment if you add movie search later

/**
 * GET /api/results?q=...&type=game
 * Returns search results as JSON
 */
router.get('/', async (req, res) => {
  const query = req.query.q;
  const type = req.query.type;

  if (!query) return res.status(400).json({ error: "Missing search query" });

  let results = [];
  try {
    if (type === 'games') {
      results = await games.searchAll(query);
    } else if (type === 'movies') {
      // results = await films.searchAll(query);
    }

    // Map results to a consistent JSON format
    results = results.map(item => {
      let provider = "unknown";
      try {
        provider = new URL(item.page).hostname;
      } catch {}

      return {
        title: item.title || "No title",
        provider,       // only the domain
        page: item.page || "", // full URL of the source page
        type: item.type,
        links: item.links || [] // array of magnet links
      };
    });

  } catch (err) {
    console.error("Error searching:", err.message);
    return res.status(500).json({ error: "Search error" });
  }

  res.json(results);
});

module.exports = router;
