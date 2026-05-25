// api/leetcode.js
// Node.js Serverless Function for Vercel acting as a CORS proxy for LeetCode stats

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { username } = req.query;
  if (!username) {
    return res.status(400).json({ error: "Missing username parameter" });
  }

  let data = null;

  // 1. Try primary stats proxy API
  try {
    const response = await fetch(`https://leetcode-stats-api.herokuapp.com/${username}`);
    if (response.ok) {
      const json = await response.json();
      if (json.status === "success") {
        data = {
          totalSolved: json.totalSolved || 0,
          easySolved: json.easySolved || 0,
          mediumSolved: json.mediumSolved || 0,
          hardSolved: json.hardSolved || 0,
          acceptanceRate: json.acceptanceRate || 50.0,
          ranking: json.ranking || 999999
        };
      }
    }
  } catch (err) {
    console.error("Server proxy: primary stats API failed:", err);
  }

  // 2. Try secondary Render proxy API
  if (!data) {
    try {
      const response = await fetch(`https://alfa-leetcode-api.onrender.com/${username}/solved`);
      if (response.ok) {
        const json = await response.json();
        data = {
          totalSolved: json.solvedProblem || 0,
          easySolved: json.easySolved || 0,
          mediumSolved: json.mediumSolved || 0,
          hardSolved: json.hardSolved || 0,
          acceptanceRate: 50.0,
          ranking: 999999
        };
      }
    } catch (err) {
      console.error("Server proxy: backup stats API failed:", err);
    }
  }

  if (!data) {
    return res.status(404).json({ error: `LeetCode profile for "${username}" not found or APIs are offline.` });
  }

  return res.status(200).json(data);
}
