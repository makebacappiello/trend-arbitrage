import { pool } from "../db/index.js";

/*
  1️⃣ INSERT MENTIONS
  - Saves mentions one by one
  - Simple and easy to understand
*/
export async function insertMentions(mentions) {
  if (mentions.length === 0) return 0;

  for (const m of mentions) {
    await pool.query(
      `
      INSERT INTO mentions (
        category,
        source,
        creator,
        normalized_topic,
        display_topic,
        created_at,
        points,
        comments,
        raw_title,
        raw_url
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      `,
      [
        m.category,
        m.source,
        m.creator,
        m.normalized_topic,
        m.display_topic,
        m.created_at,
        m.points,
        m.comments,
        m.raw_title,
        m.raw_url,
      ]
    );
  }

  return mentions.length;
}

/*
  2️⃣ AGGREGATE CATEGORY
  - Groups mentions from last 2 hours
  - Calculates basic stats per topic
*/
export async function aggregateCategory(category) {
  const sql = `
    SELECT
      normalized_topic,
      MAX(display_topic) AS display_topic,
      COUNT(*) AS mentions_recent,
      SUM(points + 2 * comments) AS engagement_recent,
      ARRAY_AGG(DISTINCT source) AS sources_list,
      COUNT(DISTINCT creator) AS creator_diversity,
      MAX(created_at) AS last_seen_at
    FROM mentions
    WHERE category = $1
      AND created_at >= NOW() - INTERVAL '2 hours'
    GROUP BY normalized_topic
    ORDER BY mentions_recent DESC
    LIMIT 500;
  `;

  const result = await pool.query(sql, [category]);
  return result.rows;
}

/*
  3 UPSERT TRENDS
  - Inserts or updates trending topics
*/
export async function upsertTrends(category, trends) {
  if (trends.length === 0) return 0;

  let saved = 0;

  for (const t of trends) {
    await pool.query(
      `
      INSERT INTO trends (
        category,
        normalized_topic,
        display_topic,
        score,
        mentions_recent,
        engagement_recent,
        last_seen_at,
        computed_at
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,NOW())
      ON CONFLICT (category, normalized_topic)
      DO UPDATE SET
        display_topic = EXCLUDED.display_topic,
        score = EXCLUDED.score,
        mentions_recent = EXCLUDED.mentions_recent,
        engagement_recent = EXCLUDED.engagement_recent,
        last_seen_at = EXCLUDED.last_seen_at,
        computed_at = NOW();
      `,
      [
        category,
        t.normalized_topic,
        t.display_topic,
        t.score,
        t.mentions_recent || 0,
        t.engagement_recent || 0,
        t.last_seen_at || new Date(),
      ]
    );

    saved++;
  }

  return saved;
}
