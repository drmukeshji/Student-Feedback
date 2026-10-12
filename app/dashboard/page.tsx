import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formsForRole, getForm } from "@/lib/forms";
import { ROLE_LABELS, type Role } from "@/lib/roles";
import { Alert } from "@/components/Alert";

export default async function Dashboard({ searchParams }: { searchParams: { submitted?: string } }) {
  const user = await requireUser();
  if (user.role === "ADMIN") redirect("/admin");
  const role = user.role as Role;
  const forms = formsForRole(role);
  const responses = await prisma.response.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, formId: true, createdAt: true },
  });
  const submitted = searchParams.submitted ? getForm(searchParams.submitted) : undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
        <p className="text-sm text-slate-600">
          Logged in as <span className="badge bg-brand-100 text-brand-800">{ROLE_LABELS[role]}</span>
          {role === "ALUMNI" && user.graduationYear && <> · Batch of {user.graduationYear}</>}
          {user.department && <> · {user.department}</>}
        </p>
      </div>
      {submitted && <Alert kind="success">Thank you! Your “{submitted.title}” has been submitted.</Alert>}
      {role === "STUDENT" && (
        <Alert kind="info">
          Fill the Students Feedback Form every semester. Fill the Exit Survey when you complete your programme — after the
          IQAC marks you as graduated, your account becomes an Alumni account and the Alumni Feedback Form unlocks.
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {forms.map((f) => {
          const mine = responses.filter((r) => r.formId === f.id);
          const done = mine.length > 0;
          return (
            <div key={f.id} className="card flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-lg font-semibold text-brand-800">{f.title}</h2>
                {done ? (
                  <span className="badge bg-green-100 text-green-800">Submitted{mine.length > 1 ? ` ×${mine.length}` : ""}</span>
                ) : (
                  <span className="badge bg-amber-100 text-amber-800">Pending</span>
                )}
              </div>
              <p className="mt-2 line-clamp-3 flex-1 text-sm text-slate-600">{f.intro}</p>
              {done && <p className="mt-2 text-xs text-slate-500">Last submitted {mine[0].createdAt.toLocaleString("en-IN")}</p>}
              <div className="mt-4">
                {!done || f.repeatable ? (
                  <Link href={`/forms/${f.id}`} className="btn">{done ? "Submit again" : "Fill form"}</Link>
                ) : (
                  <span className="text-sm text-slate-500">Already submitted — thank you.</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
