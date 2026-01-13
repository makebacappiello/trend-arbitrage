export function computeScore({
  mentionsRecent,
  mentionsPrev,
  mentions7d,
  sourcesCount,
  creatorDiversity,
  engagementRecent,
  hoursRecent = 2,
  hoursPrev = 2,
}) {
  const velocity = mentionsRecent / Math.max(1, hoursRecent);
  const prevVelocity = mentionsPrev / Math.max(1, hoursPrev);
  const accel = Math.max(0, velocity - prevVelocity);

  const noveltyPenalty = Math.log(1 + Math.max(0, mentions7d));
  const crossBoost = 1 + 0.35 * Math.max(0, sourcesCount - 1);
  const creatorBoost = 1 + 0.15 * Math.max(0, creatorDiversity - 1);
  const engagementBoost = Math.log(1 + Math.max(0, engagementRecent));

  const score =
    (crossBoost *
      creatorBoost *
      (4 * Math.log(1 + velocity) +
        6 * Math.log(1 + accel) +
        1.5 * engagementBoost)) /
    (1 + noveltyPenalty);

  return Number.isFinite(score) ? score : 0;
}
