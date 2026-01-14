import fetch from "node-fetch";

// Fetch trending GitHub repos created in the last 7 days (TECH category)
export async function fetchGitHubTech(limit = 20) {
  // 1) Get date string like "2026-01-07"
  const sevenDaysAgo = getDateDaysAgo(7);

  // 2) Build GitHub Search API URL
  const url =
    "https://api.github.com/search/repositories" +
    `?q=created:>=${sevenDaysAgo}` +
    "&sort=stars" +
    "&order=desc" +
    `&per_page=${limit}`;

  // 3) Headers (GitHub wants a User-Agent)
  const headers = { "User-Agent": "trend-arbitrage-prototype" };

  // Optional: include token to avoid rate limits
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  // 4) Fetch data
  try {
    const response = await fetch(url, { headers });

    // If request fails, return empty array
    if (!response.ok) {
      console.log("GitHub request failed:", response.status);
      return [];
    }

    const data = await response.json();
    const repos = data.items || [];

    // 5) Convert GitHub repos into app format
    return repos.slice(0, limit).map((repo) => ({
      source: "github",
      category: "tech",
      creator: repo.owner?.login || null,
      title: `${repo.name} ${repo.description || ""}`.trim(),
      url: repo.html_url,
      points: repo.stargazers_count || 0,
      comments: repo.forks_count || 0,
      created_at: repo.created_at ? new Date(repo.created_at) : new Date(),
    }));
  } catch (error) {
    console.log("GitHub fetch error:", error.message);
    return [];
  }
}

// Helper: returns "YYYY-MM-DD" for N days ago
function getDateDaysAgo(days) {
  const now = new Date();
  const past = new Date(now);
  past.setDate(now.getDate() - days);

  // Convert to YYYY-MM-DD (GitHub search wants that format)
  return past.toISOString().slice(0, 10);
}
