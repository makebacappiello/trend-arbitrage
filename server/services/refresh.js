import { fetchHackerNewsTech } from "./sources/hackernews.js";
import { fetchLobstersTech } from "./sources/lobsters.js";
import { fetchGitHubTech } from "./sources/github.js";
import { extractMentionsFromItems } from "./topic_extraction.js";
import {
  insertMentions,
  aggregateCategory,
  upsertTrends,
} from "./db_writes.js";
import { computeScore } from "./scoring.js";

const CATEGORIES = ["tech"];
// For now I only feed "tech" because sources here are tech.

export async function refreshAll() {
  // 1) fetch items
  const [hn, lob, gh] = await Promise.all([
    fetchHackerNewsTech(30),
    fetchLobstersTech(30),
    fetchGitHubTech(20),
  ]);

  const items = [...hn, ...lob, ...gh];

  // 2) extract mentions
  const mentions = extractMentionsFromItems(items);

  // 3) insert mentions
  const insertedMentions = await insertMentions(mentions);

  // 4) aggregate + score + upsert (only tech for now)
  const upsertedByCategory = {};

  for (const category of CATEGORIES) {
    const agg = await aggregateCategory(category);

    const scored = agg.map((r) => {
      const sourcesCount = (r.sources_list || []).length;
      const score = computeScore({
        mentionsRecent: r.mentions_recent,
        mentionsPrev: r.mentions_prev,
        mentions7d: r.mentions_7d,
        sourcesCount,
        creatorDiversity: r.creator_diversity,
        engagementRecent: r.engagement_recent,
      });

      return { ...r, score };
    });

    upsertedByCategory[category] = await upsertTrends(category, scored);
  }

  return {
    fetched: { hackernews: hn.length, lobsters: lob.length, github: gh.length },
    insertedMentions,
    upsertedTrends: upsertedByCategory,
    computedCategories: CATEGORIES,
    at: new Date().toISOString(),
  };
}
