import { h } from './dom.js';

/* Fuzzy match: returns { score, ranges } or null. Substring beats subsequence. */
export function fuzzy(text, query) {
  const t = text.toLowerCase(), q = query.toLowerCase().trim();
  if (!q) return { score: 0, ranges: [] };
  const i = t.indexOf(q);
  if (i >= 0) return { score: 100 - i - (t.length - q.length) * 0.1 + (i === 0 ? 20 : 0), ranges: [[i, i + q.length]] };
  let ti = 0, score = 0, last = -2; const ranges = [];
  for (const ch of q.replace(/\s+/g, '')) {
    const f = t.indexOf(ch, ti); if (f < 0) return null;
    if (f === last + 1) { score += 3; ranges[ranges.length - 1][1] = f + 1; } else { score += 1; ranges.push([f, f + 1]); }
    last = f; ti = f + 1;
  }
  return { score, ranges };
}
export function highlight(text, ranges = []) {
  const frag = document.createDocumentFragment(); let pos = 0;
  for (const [a, b] of ranges) {
    if (a > pos) frag.append(text.slice(pos, a));
    frag.append(h('mark', { class: 'ui-mark', text: text.slice(a, b) })); pos = b;
  }
  if (pos < text.length) frag.append(text.slice(pos));
  return frag;
}
