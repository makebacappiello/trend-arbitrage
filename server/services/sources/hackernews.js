import fetch from "node-fetch";

export async function fetchHackerNewsTech(limit = 30) {
  // 1) Get the list of NEW story IDs
  const idsUrl = "https://hacker-news.firebaseio.com/v0/newstories.json";
  const idsResponse = await fetch(idsUrl);

  // If the request failed, return an empty list
  if (!idsResponse.ok) {
    return [];
  }

  // 2) Convert the response into an array of IDs
  const allIds = await idsResponse.json();

  // Only keep the first "limit" IDs
  const ids = allIds.slice(0, limit);

  // 3) For each ID, fetch the story details
  const results = [];

  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];

    const itemUrl =
      "https://hacker-news.firebaseio.com/v0/item/" + id + ".json";
    const itemResponse = await fetch(itemUrl);

    // If this story fails to load, skip it
    if (!itemResponse.ok) {
      continue;
    }

    const story = await itemResponse.json();

    // If the story has no title, skip it
    if (!story || !story.title) {
      continue;
    }

    // 4) Convert it into the shape our app expects
    results.push({
      source: "hackernews",
      category: "tech",
      creator: story.by || null,
      title: story.title,
      url: story.url || "https://news.ycombinator.com/item?id=" + story.id,
      points: story.score || 0,
      comments: story.descendants || 0,
      created_at: new Date((story.time || 0) * 1000),
    });
  }

  return results;
}
