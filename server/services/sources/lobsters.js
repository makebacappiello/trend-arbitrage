import fetch from "node-fetch";
import * as cheerio from "cheerio";

export async function fetchLobstersTech(limit = 30) {
  // 1) Fetch the Lobste.rs homepage
  const response = await fetch("https://lobste.rs/");

  // If the page fails to load, return nothing
  if (!response.ok) {
    return [];
  }

  // 2) Get the HTML as text
  const html = await response.text();

  // 3) Load HTML into cheerio so we can query it
  const $ = cheerio.load(html);

  const results = [];

  // 4) Find each story on the page
  const stories = $(".story");

  for (let i = 0; i < stories.length; i++) {
    if (results.length >= limit) {
      break;
    }

    const story = stories[i];

    // 5) Get the title
    const title = $(story).find(".u-url").text().trim();
    if (!title) {
      continue;
    }

    // 6) Get the link
    let href = $(story).find(".u-url").attr("href");

    if (!href) {
      continue;
    }

    // If link is relative, make it absolute
    if (!href.startsWith("http")) {
      href = "https://lobste.rs" + href;
    }

    // 7) Get score and comments
    const scoreText = $(story).find(".score").first().text().trim();
    const commentsText = $(story).find(".comments").first().text().trim();

    const points = parseInt(scoreText, 10) || 0;
    const comments = parseInt(commentsText, 10) || 0;

    // 8) Get time
    const timeText = $(story).find("time").attr("datetime");
    const createdAt = timeText ? new Date(timeText) : new Date();

    // 9) Save story in app format
    results.push({
      source: "lobsters",
      category: "tech",
      creator: null,
      title: title,
      url: href,
      points: points,
      comments: comments,
      created_at: createdAt,
    });
  }

  console.log("LOBSTERS FETCHED:", results.length);
  return results;
}
