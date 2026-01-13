// 1) Words we never want to count as "trends"
const STOP_WORDS = [
  "show",
  "about",
  "first",
  "data",
  "news",
  "today",
  "people",
  "using",
  "use",
  "used",
  "make",
  "made",
  "good",
  "best",
  "more",
  "less",
  "just",
  "like",
  "time",
  "year",
  "years",
  "newest",
  "update",
  "updates",
  "release",
  "released",
  "launch",
  "launched",
  "now",
  "why",
  "how",
  "what",
  "when",
  "where",
  "who",
  "get",
  "gets",
  "got",
  "learn",
  "guide",
  "tips",
  "top",
  "vs",
  "review",
  "reviews",
];

// Convert array -> Set so lookups are fast (STOP_SET.has(word))
const STOP_SET = new Set(STOP_WORDS);

// 2) Clean a string so it’s easier to split into words
export function normalizeText(text) {
  if (!text) return "";

  return (
    text
      .toLowerCase()
      // replace anything that is NOT a letter/number/#/space with a space
      .replace(/[^a-z0-9#\s]/g, " ")
      // collapse multiple spaces into one
      .replace(/\s+/g, " ")
      .trim()
  );
}

// 3) Turn a title into "good" words (tokens)
function tokenize(title) {
  const clean = normalizeText(title);
  const parts = clean.split(" ");

  const tokens = [];
  for (const word of parts) {
    // keep only words length 3+ and not in stop list
    if (word.length >= 3 && !STOP_SET.has(word)) {
      tokens.push(word);
    }
  }

  return tokens;
}

// 4) Grab hashtags like #ai #machinelearning
function extractHashtags(title) {
  if (!title) return [];
  const matches = title.match(/#[a-z0-9_]+/gi) || [];
  return matches.map((h) => h.toLowerCase());
}

// 5) Main function: turn items into "mentions" rows for the DB
export function extractMentionsFromItems(items) {
  const mentions = [];

  for (const item of items) {
    // A) get tokens + hashtags
    const tokens = tokenize(item.title);
    const hashtags = extractHashtags(item.title);

    // B) keep only first 10 tokens (so we don’t explode DB inserts)
    const topTokens = tokens.slice(0, 10);

    // C) make 2-word phrases ("bigrams") from top tokens
    const bigrams = [];
    for (let i = 0; i < topTokens.length - 1; i++) {
      if (i >= 8) break; // only keep up to 8 bigrams
      bigrams.push(topTokens[i] + " " + topTokens[i + 1]);
    }

    // D) combine tokens + bigrams + hashtags, remove duplicates
    const allTopics = [...topTokens, ...bigrams, ...hashtags];
    const uniqueTopics = [...new Set(allTopics)]
      .filter((t) => t && t.length >= 3)
      .slice(0, 18); // max 18 topics per item

    // E) convert each topic into a DB-ready mention row
    for (const topic of uniqueTopics) {
      const normalized = normalizeText(topic);
      if (!normalized) continue;

      mentions.push({
        category: item.category,
        source: item.source,
        creator: item.creator,
        normalized_topic: normalized,
        display_topic: topic,
        created_at: item.created_at,
        points: item.points || 0,
        comments: item.comments || 0,
        raw_title: item.title,
        raw_url: item.url,
      });
    }
  }

  return mentions;
}
