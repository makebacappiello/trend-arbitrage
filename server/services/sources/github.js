import fetch from "node-fetch";

// Fetch new GitHub repositories for the TECH category
export async function fetchGitHubTech(limit = 20) {

  // 1) Figure out the date from 7 days ago
  const sevenDaysAgo = getDateDaysAgo(7);

  // 2) Build the GitHub search URL
  const url =
    "https://api.github.com/search/repositories" +
    "?q=created:>=" + sevenDaysAgo +
    "&sort=stars" +
    "&order=desc" +
    "&per_page=" + limit;

  // 3) GitHub requires a User-Agent header
  const headers = {
    "User-Agent": "trend-arbitrage-prototype"
  };

  // 4) If a GitHub token exists, include it (optional)
  if (process.env.GITHUB_TOKEN) {
    headers["Authorization"] = "Bearer " + process.env.GITHUB_TOKEN;
  }

  // 5) Make the request
  const response = await fetch(url, { headers });

  // If something goes wrong, return an empty list
  if (!response.ok) {
    return [];
  }

  // 6) Convert response to JSON
  const data = await response.json();

  // 7) Get the repositories array (or empty if missing)
  const repos = data.items || [];

  // 8) Convert GitHub repos into our app's format
  const results = [];

  for (let i = 0; i < repos.length && i < limit; i++) {
    const repo = repos[i];

    results.push({
      source: "github",
      category: "tech",
      creator: repo.owner ? repo.owner.login : null,
      title: repo.name + " " + (repo.description || ""),
      url: repo.html_url,
      points: repo.stargazers_count || 0,
      comments: repo.forks_count || 0,
      created_at: repo.created_at
        ? new Date(repo.created_at)
        : new Date()
    });
  }

  return results;
}

// Helper: returns YYYY-MM-DD for N days ago
function getDateDaysAgo(days) {
  const now = new Date();
  const past = n
