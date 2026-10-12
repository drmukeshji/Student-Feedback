import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { FORMS } from "@/lib/forms";
import { ROLE_LABELS, ROLES } from "@/lib/roles";

export default async function AdminHome() {
  await requireUser(["ADMIN"]);
  const [byRole, byForm, recent] = await Promise.all([
    prisma.user.groupBy({ by: ["role"], _count: true }),
    prisma.response.groupBy({ by: ["formId"], _count: true }),
    prisma.response.findMany({ orderBy: { createdAt: "desc" }, take: 8, include: { user: { select: { name: true, role: true } } } }),
  ]);
  const roleCount = (r: string) => byRole.find((x) => x.role === r)?._count ?? 0;
  const formCount = (f: string) => byForm.find((x) => x.formId === f)?._count ?? 0;
  const totalResponses = byForm.reduce((a, b) => a + b._count, 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">IQAC Admin Dashboard</h1>
          <p className="text-sm text-slate-600">{totalResponses} feedback responses collected across {FORMS.length} forms.</p>
        </div>
        <Link href="/admin/users" className="btn">Manage users</Link>
      </div>

      <section>
        <h2 className="mb-3 font-semibold">Registered users</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {ROLES.map((r) => (
            <Link key={r} href={`/admin/users?role=${r}`} className="card p-4 hover:border-brand-500">
              <p className="text-2xl font-bold text-brand-800">{roleCount(r)}</p>
              <p className="text-xs text-slate-500">{ROLE_LABELS[r]}</p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-semibold">Feedback forms</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FORMS.map((f) => (
            <div key={f.id} className="card flex flex-col">
              <h3 className="font-semibold text-brand-800">{f.title}</h3>
              <p className="mt-1 text-xs text-slate-500">For: {f.roles.map((r) => ROLE_LABELS[r]).join(", ")}</p>
              <p className="mt-3 flex-1 text-3xl font-bold">{formCount(f.id)} <span className="text-sm font-normal text-slate-500">responses</span></p>
              <div className="mt-4 flex gap-2">
                <Link href={`/admin/reports/${f.id}`} className="btn btn-sm">View report</Link>
                <a href={`/api/export/${f.id}`} className="btn-outline btn-sm">Export CSV</a>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h2 className="mb-3 font-semibold">Latest submissions</h2>
        {recent.length === 0 ? (
          <p className="text-sm text-slate-500">No submissions yet.</p>
        ) : (
          <table className="min-w-full divide-y divide-slate-200">
            <thead><tr><th className="th">When</th><th className="th">Form</th><th className="th">By</th><th className="th"></th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {recent.map((r) => (
                <tr key={r.id}>
                  <td className="td">{r.createdAt.toLocaleString("en-IN")}</td>
                  <td className="td">{FORMS.find((f) => f.id === r.formId)?.shortTitle ?? r.formId}</td>
                  <td className="td">{r.user.name} <span className="text-xs text-slate-500">({ROLE_LABELS[r.user.role as keyof typeof ROLE_LABELS]})</span></td>
                  <td className="td text-right"><Link href={`/admin/responses/${r.id}`} className="text-brand-600 hover:underline">View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
