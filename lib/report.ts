import { allFields, type Answers, type Field, type FormDef } from "./forms";

export type ItemStat = { key: string; label: string; counts: Record<string, number>; total: number; avg: number | null };
export type FieldStat = { field: Field; items: ItemStat[]; sectionAvg: number | null };

export function buildReport(form: FormDef, responses: Answers[]): FieldStat[] {
  const stats: FieldStat[] = [];
  for (const f of allFields(form)) {
    if (f.type === "matrix") {
      const items = f.items.map((it) => stat(`${f.id}.${it.id}`, it.label, responses, !!f.numeric));
      const avgs = items.map((i) => i.avg).filter((a): a is number => a !== null);
      stats.push({ field: f, items, sectionAvg: avgs.length ? avgs.reduce((a, b) => a + b, 0) / avgs.length : null });
    } else if (f.type === "radio" || f.type === "select" || f.type === "checkboxes") {
      stats.push({ field: f, items: [stat(f.id, f.label, responses, false)], sectionAvg: null });
    }
  }
  return stats;
}

function stat(key: string, label: string, responses: Answers[], numeric: boolean): ItemStat {
  const counts: Record<string, number> = {};
  let total = 0;
  let sum = 0;
  for (const r of responses) {
    const v = r[key];
    const vals = Array.isArray(v) ? v : v ? [v] : [];
    for (const x of vals) {
      counts[x] = (counts[x] ?? 0) + 1;
      total++;
      if (numeric) sum += Number(x);
    }
  }
  return { key, label, counts, total, avg: numeric && total ? sum / total : null };
}

export function parse(answers: string): Answers {
  try {
    return JSON.parse(answers) as Answers;
  } catch {
    return {};
  }
}
