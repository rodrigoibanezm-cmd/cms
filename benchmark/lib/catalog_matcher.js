const ITEM_MATCH_THRESHOLD = 0.75;

export const MATCH_STRONG = 0.85;
export const MATCH_REVIEW = 0.75;

function normItem(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i][j - 1], dp[i - 1][j], dp[i - 1][j - 1]);
    }
  }

  return dp[m][n];
}

function itemRatio(a, b) {
  const left = normItem(a);
  const right = normItem(b);
  const maxLen = Math.max(left.length, right.length);
  if (maxLen === 0) return 1;
  return 1 - levenshtein(left, right) / maxLen;
}

export function fuzzySim(itemsA, itemsB) {
  const aItems = Array.isArray(itemsA) ? itemsA : [];
  const bItems = Array.isArray(itemsB) ? itemsB : [];
  const used = new Set();
  let matched = 0;

  for (const a of aItems) {
    let bestJ = -1;
    let bestR = 0;

    bItems.forEach((b, j) => {
      if (used.has(j)) return;
      const ratio = itemRatio(a, b);
      if (ratio > bestR) {
        bestR = ratio;
        bestJ = j;
      }
    });

    if (bestJ >= 0 && bestR >= ITEM_MATCH_THRESHOLD) {
      matched++;
      used.add(bestJ);
    }
  }

  const union = aItems.length + bItems.length - matched;
  return union ? matched / union : 0;
}

export function matchTemplate(checklistItems, catalog) {
  let best = null;
  let bestSim = 0;

  for (const entry of catalog) {
    const sim = fuzzySim(checklistItems, entry.checklist);
    if (sim > bestSim) {
      bestSim = sim;
      best = entry;
    }
  }

  return { entry: best, similitud: bestSim };
}

export function decideMatch({ entry, similitud }) {
  if (similitud >= MATCH_STRONG && entry?.template_status === "approved") {
    return "approved_match";
  }
  if (similitud >= MATCH_STRONG && entry?.template_status === "pending") {
    return "pending_match_con_alerta";
  }
  if (similitud >= MATCH_REVIEW) return "revision_manual";
  return "varios";
}

export function resolveFallbackEntry(catalog) {
  return catalog.find((entry) => entry.template_key === "INFORMES_VARIOS") || null;
}
