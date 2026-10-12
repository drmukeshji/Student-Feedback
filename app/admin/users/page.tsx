import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { markGraduated, setUserRole, toggleActive } from "@/app/actions";
import { ROLE_LABELS, ROLES, isRole, type Role } from "@/lib/roles";
import CreateUserForm from "./CreateUserForm";

export default async function UsersPage({ searchParams }: { searchParams: { role?: string; q?: string } }) {
  const admin = await requireUser(["ADMIN"]);
  const role = isRole(searchParams.role) ? searchParams.role : undefined;
  const q = searchParams.q?.trim();
  const users = await prisma.user.findMany({
    where: {
      ...(role ? { role } : {}),
      ...(q ? { OR: [{ name: { contains: q } }, { email: { contains: q } }, { enrollmentNo: { contains: q } }, { department: { contains: q } }] } : {}),
    },
    orderBy: [{ role: "asc" }, { name: "asc" }],
    include: { _count: { select: { responses: true } } },
    take: 500,
  });
  const students = users.filter((u) => u.role === "STUDENT");

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin" className="text-sm text-brand-600 hover:underline">← Dashboard</Link>
        <h1 className="mt-1 text-2xl font-bold">Users</h1>
      </div>

      <form className="flex flex-wrap gap-2">
        <select name="role" defaultValue={role ?? ""} className="input w-auto">
          <option value="">All roles</option>
          {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
        </select>
        <input name="q" defaultValue={q} placeholder="Search name, email, enrollment, department" className="input w-72" />
        <button className="btn-outline">Filter</button>
      </form>

      {students.length > 0 && (
        <form action={markGraduated} className="card space-y-3 border-l-4 border-l-brand-600">
          <div>
            <h2 className="font-semibold">Mark students as graduated → Alumni</h2>
            <p className="text-sm text-slate-600">Select students who have completed their study. Their accounts become Alumni accounts and the Alumni Feedback Form unlocks for them.</p>
          </div>
          <div className="max-h-60 overflow-y-auto rounded border border-slate-200 p-2">
            {students.map((s) => (
              <label key={s.id} className="flex items-center gap-2 py-1 text-sm">
                <input type="checkbox" name="userId" value={s.id} className="accent-brand-600" />
                {s.name} <span className="text-slate-500">· {s.enrollmentNo ?? "—"} · {s.department ?? "—"} · {s.program ?? ""}</span>
              </label>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm" htmlFor="graduationYear">Year of passing</label>
            <input id="graduationYear" name="graduationYear" type="number" defaultValue={new Date().getFullYear()} className="input w-28" />
            <button className="btn">Mark as graduated</button>
          </div>
        </form>
      )}

      <div className="card overflow-x-auto p-0">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr><th className="th">Name</th><th className="th">Email</th><th className="th">Role</th><th className="th">Details</th><th className="th">Responses</th><th className="th">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u.id} className={u.active ? "" : "bg-slate-50 text-slate-400"}>
                <td className="td font-medium">{u.name}{!u.active && <span className="badge ml-2 bg-slate-200 text-slate-600">inactive</span>}</td>
                <td className="td">{u.email}</td>
                <td className="td"><span className="badge bg-brand-100 text-brand-800">{ROLE_LABELS[u.role as Role]}</span></td>
                <td className="td text-xs text-slate-500">
                  {[u.department, u.program, u.enrollmentNo, u.designation, u.organization, u.wardName && `Ward: ${u.wardName}`, u.graduationYear && `Batch ${u.graduationYear}`]
                    .filter(Boolean)
                    .join(" · ")}
                </td>
                <td className="td">{u._count.responses}</td>
                <td className="td">
                  {u.id !== admin.id && (
                    <div className="flex flex-wrap items-center gap-1">
                      <form action={setUserRole} className="flex gap-1">
                        <input type="hidden" name="userId" value={u.id} />
                        <select name="role" defaultValue={u.role} className="rounded border border-slate-300 px-1 py-0.5 text-xs">
                          {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                        </select>
                        <button className="btn-outline btn-sm">Set</button>
                      </form>
                      <form action={toggleActive}>
                        <input type="hidden" name="userId" value={u.id} />
                        <button className="btn-outline btn-sm">{u.active ? "Deactivate" : "Activate"}</button>
                      </form>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {users.length === 0 && <tr><td className="td text-slate-500" colSpan={6}>No users found.</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h2 className="mb-3 font-semibold">Add a user</h2>
        <CreateUserForm />
      </div>
    </div>
  );
}
