import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getForm } from "@/lib/forms";
import type { Role } from "@/lib/roles";
import FeedbackForm from "./FeedbackForm";

export default async function FormPage({ params }: { params: { formId: string } }) {
  const user = await requireUser();
  const form = getForm(params.formId);
  if (!form) notFound();
  if (!form.roles.includes(user.role as Role)) redirect("/dashboard");
  if (!form.repeatable && (await prisma.response.findFirst({ where: { formId: form.id, userId: user.id } }))) {
    redirect("/dashboard");
  }
  const prefill: Record<string, string> = {
    name: user.name,
    email: user.email,
    phone: user.phone ?? "",
    department: user.department ?? "",
    program: user.program ?? "",
    designation: user.designation ?? "",
    organization: user.organization ?? "",
    wardName: user.wardName ?? "",
    graduationYear: user.graduationYear ? String(user.graduationYear) : "",
  };
  return (
    <div className="space-y-6">
      <Link href="/dashboard" className="text-sm text-brand-600 hover:underline">← Back to my forms</Link>
      <div className="card border-t-4 border-t-brand-600">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Gurugram University, Gurugram – Haryana</p>
        <h1 className="mt-1 text-2xl font-bold">{form.title}</h1>
        <p className="mt-3 text-sm text-slate-600">{form.intro}</p>
        <p className="mt-2 text-xs text-slate-500">Fields marked <span className="text-red-500">*</span> are required.</p>
      </div>
      <FeedbackForm form={form} prefill={prefill} />
    </div>
  );
}
