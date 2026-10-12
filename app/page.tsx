import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { FORMS } from "@/lib/forms";
import { ROLE_DESCRIPTIONS, ROLE_LABELS, ROLES } from "@/lib/roles";

export default async function Home() {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "ADMIN" ? "/admin" : "/dashboard");
  return (
    <div className="space-y-10">
      <section className="rounded-2xl bg-gradient-to-br from-brand-700 to-brand-900 px-8 py-12 text-white shadow">
        <h1 className="text-3xl font-bold md:text-4xl">Stakeholder Feedback Portal</h1>
        <p className="mt-3 max-w-2xl text-brand-100">
          Share your experience with Gurugram University. Feedback from students, alumni, faculty, employers, parents and
          support staff helps the IQAC improve academic programmes, infrastructure and governance.
        </p>
        <div className="mt-6 flex gap-3">
          <Link href="/register" className="rounded-lg bg-white px-5 py-2.5 font-semibold text-brand-900 hover:bg-brand-50">Create account</Link>
          <Link href="/login" className="rounded-lg border border-white/50 px-5 py-2.5 font-semibold hover:bg-white/10">Login</Link>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Who can give feedback?</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ROLES.map((r) => {
            const forms = FORMS.filter((f) => f.roles.includes(r));
            return (
              <div key={r} className="card">
                <h3 className="font-semibold text-brand-800">{ROLE_LABELS[r]}</h3>
                <p className="mt-1 text-sm text-slate-600">{ROLE_DESCRIPTIONS[r]}</p>
                <ul className="mt-3 space-y-1 text-sm">
                  {r === "ADMIN" ? (
                    <li className="text-slate-500">Reports &amp; analytics for all forms</li>
                  ) : (
                    forms.map((f) => <li key={f.id}>• {f.title}</li>)
                  )}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      <section className="card">
        <h2 className="text-lg font-semibold">From student to alumni</h2>
        <p className="mt-2 text-sm text-slate-600">
          Students register with their department and programme. When a student completes their study, the IQAC
          administrator marks them as graduated and the same account becomes an <strong>Alumni</strong> account, unlocking
          the Alumni Feedback Form while keeping access to the Exit Survey.
        </p>
      </section>
    </div>
  );
}
