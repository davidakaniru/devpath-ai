import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../prisma";

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim();
}

function tokenize(text: string): Set<string> {
  const stopWords = new Set([
    "the",
    "and",
    "for",
    "with",
    "of",
    "a",
    "an",
    "to",
    "in",
  ]);
  return new Set(
    normalize(text)
      .split(/\s+/)
      .filter((word) => word.length > 2 && !stopWords.has(word)),
  );
}

type PrismaClientOrTx = typeof prisma | Prisma.TransactionClient;

export async function matchTopic(
  client: PrismaClientOrTx,
  trackId: string,
  recommendedTitle: string,
): Promise<{ id: string; title: string } | null> {
  const topics = await client.topic.findMany({
    where: { trackId },
    select: { id: true, title: true },
  });

  const recommendedTokens = tokenize(recommendedTitle);
  if (recommendedTokens.size === 0) return null;

  let bestMatch: { id: string; title: string } | null = null;
  let bestScore = 0;

  for (const topic of topics) {
    const topicTokens = tokenize(topic.title);
    const overlap = [...recommendedTokens].filter((t) =>
      topicTokens.has(t),
    ).length;
    const score = overlap / Math.max(recommendedTokens.size, topicTokens.size);

    if (score > bestScore) {
      bestScore = score;
      bestMatch = topic;
    }
  }

  // Require at least a third of the meaningful words to overlap before trusting the match
  return bestScore >= 0.34 ? bestMatch : null;
}
