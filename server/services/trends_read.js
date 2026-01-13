import { pool } from "../db/index.js";

export async function getTrendsByCategory(category, limit = 30) {
  const { rows } = await pool.query(
    `
    SELECT
      category, normalized_topic, display_topic, score,
      sources_list, creator_diversity,
      mentions_recent, mentions_prev, mentions_7d,
      engagement_recent, computed_at, last_seen_at,
      cluster_id, cluster_label
    FROM trends
    WHERE category = $1
    ORDER BY score DESC, computed_at DESC
    LIMIT $2
    `,
    [category, limit]
  );

  return rows;
}
