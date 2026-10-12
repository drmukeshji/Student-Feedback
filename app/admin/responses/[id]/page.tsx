import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { deleteResponse } from "@/app/actions";
import { displayAnswer, getForm } from "@/lib/forms";
import { parse } from "@/lib/report";
import { ROLE_LABELS, type Role } from "@/lib/roles";

export default async function ResponsePage({ params }: { params: { id: string } }) {
  await requireUser(["ADMIN"]);
  const r = await prisma.response.findUnique({ where: { id: params.id }, include: { user: true } });
  if (!r) notFound();
  const form = getForm(r.formId);
  if (!form) notFound();
  const a = parse(r.answers);
  return (
    <div className="space-y-6">
      <Link href={`/admin/reports/${form.id}`} className="text-sm text-brand-600 hover:underline">← {form.title} report</Link>
      <div className="card flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{form.title}</h1>
          <p className="text-sm text-slate-600">
            {r.user.name} ({r.user.email}) · {ROLE_LABELS[r.user.role as Role]} · submitted {r.createdAt.toLocaleString("en-IN")}
          </p>
        </div>
        <form action={deleteResponse}>
          <input type="hidden" name="responseId" value={r.id} />
          <button className="btn-outline btn-sm text-red-600">Delete response</button>
        </form>
      </div>
      {form.sections.map((s) => (
        <section key={s.title} className="card">
          <h2 className="mb-3 font-semibold text-brand-800">{s.title}</h2>
          <dl className="divide-y divide-slate-100">
            {s.fields.flatMap((f) =>
              f.type === "matrix"
                ? f.items.map((it) => (
                    <div key={`${f.id}.${it.id}`} className="grid gap-2 py-2 text-sm sm:grid-cols-[1fr_200px]">
                      <dt className="text-slate-600">{it.label}</dt>
                      <dd className="font-medium">{displayAnswer(f, a[`${f.id}.${it.id}`]) || "—"}</dd>
                    </div>
                  ))
                : [
                    <div key={f.id} className="grid gap-2 py-2 text-sm sm:grid-cols-[1fr_2fr]">
                      <dt className="text-slate-600">{f.label}</dt>
                      <dd className="whitespace-pre-wrap font-medium">{displayAnswer(f, a[f.id]) || "—"}</dd>
                    </div>,
                  ],
            )}
          </dl>
        </section>
      ))}
    </div>
  );
}
