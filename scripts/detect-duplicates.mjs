// Near-duplicate detection over the English system-prompt bodies.
//
// Why it matters: the archive collects the same vendor prompt from several
// public sources, and one capture is often re-captured verbatim (or as a
// strict subset) under a different file name. Readers should be able to see
// that at a glance instead of assuming each entry is unique.
//
// Method: word 3-gram shingles + MinHash (64 permutations) + LSH banding to
// shortlist candidate pairs, then exact Jaccard / containment on the
// shortlisted pairs. A pair counts as heavily repeated when either
//   - jaccard >= 0.85      the two bodies are near-identical, or
//   - containment >= 0.95  one body's content is almost entirely inside the
//                           other (a subset capture of the same prompt).
//
// Only English bodies are compared. The Chinese files are translations of the
// same entries, so comparing them would only re-report the same grouping.
//
// Exports:
//   detectDuplicateGroups(bodies) -> { groups, flagged, compared }
//   groups: [{ id, kind, canonical, members: [{ id, words, similarity,
//            containment, relation }] }]

export const DUPLICATE_THRESHOLDS = {
  jaccard: 0.85,
  containment: 0.95,
  minIntersectingShingles: 50,
};

const PERMS = 64;
const BANDS = 16;
const ROWS = PERMS / BANDS;

const mul = (a, b) => Math.imul(a, b) >>> 0;

/** FNV-1a over a string, seeded so different seeds give independent hashes. */
function hash32(str, seed) {
  let h = (2166136261 ^ seed) >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = mul(h, 16777619) >>> 0;
  }
  h ^= h >>> 15;
  h = mul(h, 2246822507) >>> 0;
  h ^= h >>> 13;
  h = mul(h, 3266489909) >>> 0;
  h ^= h >>> 16;
  return h >>> 0;
}

/** Cheap permutation of a 32-bit hash: mix(h, permIndex). */
function mix(h, i) {
  let x = (h ^ mul(i + 1, 0x9e3779b1)) >>> 0;
  x ^= x >>> 16;
  x = mul(x, 2246822507) >>> 0;
  x ^= x >>> 13;
  x = mul(x, 3266489909) >>> 0;
  x ^= x >>> 16;
  return x >>> 0;
}

/** Word 3-gram shingle hashes of a body. */
function shingleHashes(text) {
  const words = text.toLowerCase().match(/[a-z0-9_]+/g) ?? [];
  const out = new Set();
  for (let i = 0; i + 2 < words.length; i++) {
    out.add(hash32(words[i] + ' ' + words[i + 1] + ' ' + words[i + 2], 0));
  }
  return out;
}

/** MinHash signature: the minimum mixed hash per permutation. */
function signature(hashes) {
  const sig = new Uint32Array(PERMS).fill(0xffffffff);
  for (const h of hashes) {
    for (let p = 0; p < PERMS; p++) {
      const v = mix(h, p);
      if (v < sig[p]) sig[p] = v;
    }
  }
  return sig;
}

/** Exact |A ∩ B| over two sorted hash arrays. */
function intersectionSize(a, b) {
  let inter = 0;
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      inter++;
      i++;
      j++;
    } else if (a[i] < b[j]) {
      i++;
    } else {
      j++;
    }
  }
  return inter;
}

/**
 * @param {Record<string, string>} bodies English body text keyed by body id.
 * @returns {{ groups: object[], flagged: Set<string>, compared: number }}
 */
export function detectDuplicateGroups(bodies) {
  const ids = Object.keys(bodies);

  const shingles = new Map(); // id -> sorted Uint32Array
  const sigs = new Map(); // id -> Uint32Array(PERMS)
  const wordCounts = new Map(); // id -> English word count

  for (const id of ids) {
    const text = bodies[id];
    const set = shingleHashes(text);
    shingles.set(id, Uint32Array.from(set).sort());
    sigs.set(id, signature(set));
    wordCounts.set(id, text.split(/\s+/).filter(Boolean).length);
  }

  // ---- LSH shortlist -------------------------------------------------------
  const buckets = new Map();
  for (const [id, sig] of sigs) {
    for (let b = 0; b < BANDS; b++) {
      let key = `${b}:`;
      for (let r = 0; r < ROWS; r++) key += `${sig[b * ROWS + r]},`;
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key).push(id);
    }
  }

  const candidates = new Set();
  for (const members of buckets.values()) {
    if (members.length < 2 || members.length > 400) continue;
    for (let i = 0; i < members.length; i++) {
      for (let j = i + 1; j < members.length; j++) {
        const [a, b] = [members[i], members[j]].sort();
        candidates.add(`${a}\u0000${b}`);
      }
    }
  }

  // ---- exact scoring -------------------------------------------------------
  const pairs = [];
  for (const key of candidates) {
    const [a, b] = key.split('\u0000');
    const sa = shingles.get(a);
    const sb = shingles.get(b);
    const inter = intersectionSize(sa, sb);
    if (inter < DUPLICATE_THRESHOLDS.minIntersectingShingles) continue;
    const union = sa.length + sb.length - inter;
    const jaccard = union ? inter / union : 0;
    const smaller = Math.min(sa.length, sb.length);
    const containment = smaller ? inter / smaller : 0;
    const nearIdentical = jaccard >= DUPLICATE_THRESHOLDS.jaccard;
    const contained = !nearIdentical && containment >= DUPLICATE_THRESHOLDS.containment;
    if (!nearIdentical && !contained) continue;
    pairs.push({
      a,
      b,
      inter,
      jaccard: Number(jaccard.toFixed(4)),
      containment: Number(containment.toFixed(4)),
      kind: nearIdentical ? 'near-identical' : 'contained',
    });
  }

  // ---- group connected components -----------------------------------------
  const parent = new Map();
  const find = (x) => {
    while (parent.get(x) !== x) {
      parent.set(x, parent.get(parent.get(x)));
      x = parent.get(x);
    }
    return x;
  };
  for (const p of pairs) {
    if (!parent.has(p.a)) parent.set(p.a, p.a);
    if (!parent.has(p.b)) parent.set(p.b, p.b);
  }
  for (const p of pairs) {
    const ra = find(p.a);
    const rb = find(p.b);
    if (ra !== rb) parent.set(ra, rb);
  }

  const components = new Map();
  for (const id of parent.keys()) {
    const root = find(id);
    if (!components.has(root)) components.set(root, []);
    components.get(root).push(id);
  }

  const groups = [];
  for (const members of components.values()) {
    const memberSet = new Set(members);
    const edges = pairs.filter((p) => memberSet.has(p.a) && memberSet.has(p.b));

    // Best relation of each member against any other member of the group.
    const bestOf = new Map();
    for (const p of edges) {
      for (const [self, other] of [
        [p.a, p.b],
        [p.b, p.a],
      ]) {
        const prev = bestOf.get(self);
        // Prefer the pair that overlaps this member the most.
        if (!prev || p.inter > prev.inter) {
          bestOf.set(self, {
            inter: p.inter,
            similarity: p.jaccard,
            containment: p.containment,
            relation: p.kind,
            against: other,
          });
        }
      }
    }

    // The fullest body is the canonical one; the others repeat it.
    const ordered = [...members].sort(
      (x, y) => wordCounts.get(y) - wordCounts.get(x) || x.localeCompare(y)
    );
    const canonical = ordered[0];

    groups.push({
      id: `DUP-${String(groups.length + 1).padStart(4, '0')}`,
      kind: edges.some((p) => p.kind === 'near-identical') ? 'near-identical' : 'contained',
      canonical,
      members: ordered.map((id) => {
        const best = bestOf.get(id);
        return {
          id,
          words: wordCounts.get(id),
          similarity: best?.similarity ?? 0,
          containment: best?.containment ?? 0,
          relation: best?.relation ?? 'near-identical',
          canonical: id === canonical,
        };
      }),
    });
  }

  groups.sort(
    (a, b) =>
      b.members.length - a.members.length ||
      b.members[0].similarity - a.members[0].similarity ||
      a.id.localeCompare(b.id)
  );
  // Re-number after sorting so group ids read in display order.
  groups.forEach((g, i) => {
    g.id = `DUP-${String(i + 1).padStart(4, '0')}`;
  });

  const flagged = new Set(groups.flatMap((g) => g.members.map((m) => m.id)));
  return { groups, flagged, compared: ids.length };
}
