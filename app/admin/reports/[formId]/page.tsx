import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getForm } from "@/lib/forms";
import { buildReport, parse } from "@/lib/report";
import { DEPARTMENTS, ROLE_LABELS, type Role } from "@/lib/roles";

const fmt = (n: number | null) => (n === null ? "–" : n.toFixed(2));

function scoreColor(avg: number | null) {
  if (avg === null) return "bg-slate-300";
  if (avg >= 4) return "bg-green-500";
  if (avg >= 3) return "bg-brand-500";
  if (avg >= 2) return "bg-amber-500";
  return "bg-red-500";
}

export default async function ReportPage({ params, searchParams }: { params: { formId: string }; searchParams: { dept?: string } }) {
  await requireUser(["ADMIN"]);
  const form = getForm(params.formId);
  if (!form) notFound();
  const dept = searchParams.dept && DEPARTMENTS.includes(searchParams.dept) ? searchParams.dept : undefined;
  const all = await prisma.response.findMany({
    where: { formId: form.id },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true, role: true, department: true } } },
  });
  const rows = all
    .map((r) => ({ ...r, a: parse(r.answers) }))
    .filter((r) => !dept || r.a.department === dept || r.user.department === dept);
  const report = buildReport(form, rows.map((r) => r.a));

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin" className="text-sm text-brand-600 hover:underline">← Dashboard</Link>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">{form.title}</h1>
            <p className="text-sm text-slate-600">{rows.length} response{rows.length === 1 ? "" : "s"}{dept ? ` · ${dept}` : ""}</p>
          </div>
          <div className="flex gap-2">
            <form className="flex gap-2">
              <select name="dept" defaultValue={dept ?? ""} className="input w-auto">
                <option value="">All departments</option>
                {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
              </select>
              <button className="btn-outline">Filter</button>
            </form>
            <a href={`/api/export/${form.id}${dept ? `?dept=${encodeURIComponent(dept)}` : ""}`} className="btn">Export CSV</a>
          </div>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="card text-sm text-slate-500">No responses yet.</div>
      ) : (
        report.map(({ field, items, sectionAvg }) =>
          field.type === "matrix" ? (
            <section key={field.id} className="card">
              <div className="mb-4 flex items-baseline justify-between gap-2">
                <h2 className="font-semibold text-brand-800">
                  {form.sections.find((s) => s.fields.includes(field))?.title}
                  {field.label && <span className="block text-sm font-normal text-slate-600">{field.label}</span>}
                </h2>
                {sectionAvg !== null && <span className="text-sm">Section average: <strong>{fmt(sectionAvg)}</strong> / 5</span>}
              </div>
              <div className="space-y-3">
                {items.map((it) => (
                  <div key={it.key} className="grid items-center gap-2 text-sm md:grid-cols-[1fr_260px_60px]">
                    <span>{it.label}</span>
                    {field.numeric ? (
                      <div className="h-3 overflow-hidden rounded-full bg-slate-100" title={field.scale.map((o) => `${o.label}: ${it.counts[o.value] ?? 0}`).join(", ")}>
                        <div className={`h-full ${scoreColor(it.avg)}`} style={{ width: `${((it.avg ?? 0) / 5) * 100}%` }} />
                      </div>
                    ) : (
                      <Distribution options={field.scale} counts={it.counts} total={it.total} />
                    )}
                    <span className="text-right font-semibold">{field.numeric ? fmt(it.avg) : `n=${it.total}`}</span>
                  </div>
                ))}
              </div>
            </section>
          ) : (
            <section key={field.id} className="card">
              <h2 className="mb-3 text-sm font-semibold">{field.label}</h2>
              <Distribution options={"options" in field ? field.options : []} counts={items[0].counts} total={items[0].total} wide />
            </section>
          ),
        )
      )}

      {rows.length > 0 && (
        <section className="card overflow-x-auto p-0">
          <h2 className="p-4 font-semibold">Individual responses</h2>
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50"><tr><th className="th">Submitted</th><th className="th">By</th><th className="th">Department</th><th className="th"></th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="td">{r.createdAt.toLocaleString("en-IN")}</td>
                  <td className="td">{r.user.name} <span className="text-xs text-slate-500">{r.user.email} · {ROLE_LABELS[r.user.role as Role]}</span></td>
                  <td className="td">{String(r.a.department ?? r.user.department ?? "")}</td>
                  <td className="td text-right"><Link className="text-brand-600 hover:underline" href={`/admin/responses/${r.id}`}>View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}

const COLORS = ["bg-brand-600", "bg-green-500", "bg-amber-500", "bg-red-500", "bg-purple-500", "bg-teal-500", "bg-pink-500"];

function Distribution({ options, counts, total, wide }: { options: { value: string; label: string }[]; counts: Record<string, number>; total: number; wide?: boolean }) {
  return (
    <div>
      <div className="flex h-3 overflow-hidden rounded-full bg-slate-100">
        {options.map((o, i) => {
          const c = counts[o.value] ?? 0;
          return c ? <div key={o.value} className={COLORS[i % COLORS.length]} style={{ width: `${(c / Math.max(total, 1)) * 100}%` }} title={`${o.label}: ${c}`} /> : null;
        })}
      </div>
      <div className={`mt-1 flex flex-wrap gap-x-3 text-xs text-slate-600 ${wide ? "" : "max-w-[260px]"}`}>
        {options.map((o, i) => (
          <span key={o.value} className="flex items-center gap-1">
            <span className={`inline-block h-2 w-2 rounded-full ${COLORS[i % COLORS.length]}`} />
            {o.label}: {counts[o.value] ?? 0}
          </span>
        ))}
      </div>
    </div>
  );
}
