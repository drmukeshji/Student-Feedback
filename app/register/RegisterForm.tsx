"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { register } from "@/app/actions";
import { Alert } from "@/components/Alert";
import SubmitButton from "@/components/SubmitButton";
import { DEPARTMENTS, ROLE_DESCRIPTIONS, ROLE_LABELS, SELF_REGISTER_ROLES, type Role } from "@/lib/roles";

export default function RegisterForm() {
  const [state, action] = useFormState(register, undefined);
  const [role, setRole] = useState<Role>("STUDENT");
  const academic = role === "STUDENT" || role === "ALUMNI";
  return (
    <form action={action} className="space-y-5">
      {state?.error && <Alert>{state.error}</Alert>}
      <div>
        <span className="label">I am a</span>
        <div className="grid gap-2 sm:grid-cols-3">
          {SELF_REGISTER_ROLES.map((r) => (
            <label
              key={r}
              className={`cursor-pointer rounded-lg border p-3 text-sm ${role === r ? "border-brand-500 bg-brand-50 ring-2 ring-brand-100" : "border-slate-200 hover:bg-slate-50"}`}
            >
              <input type="radio" name="role" value={r} checked={role === r} onChange={() => setRole(r)} className="sr-only" />
              <span className="font-semibold">{ROLE_LABELS[r]}</span>
            </label>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-500">{ROLE_DESCRIPTIONS[role]}</p>
        {role === "ALUMNI" && (
          <p className="mt-1 text-xs text-slate-500">
            Already registered as a student? You don&apos;t need a new account — the IQAC will convert it to alumni when you graduate.
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="name" label={role === "EMPLOYER" ? "Your name" : "Full name"} required />
        <Field name="email" label="Email" type="email" required />
        <Field name="phone" label="Mobile number" type="tel" />
        {(academic || role === "FACULTY") && (
          <div>
            <label className="label" htmlFor="department">Department</label>
            <select className="input" id="department" name="department" required defaultValue="">
              <option value="" disabled>Select…</option>
              {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
        )}
        {role === "STAFF" && <Field name="department" label="Section / Department" required />}
        {academic && <Field name="program" label="Programme (e.g. B.Tech CSE, MBA)" required />}
        {role === "STUDENT" && <Field name="enrollmentNo" label="Enrollment / Roll no." required />}
        {role === "ALUMNI" && <Field name="graduationYear" label="Year of passing" type="number" required />}
        {role === "ALUMNI" && <Field name="organization" label="Current employer / organisation" />}
        {(role === "FACULTY" || role === "STAFF" || role === "EMPLOYER") && <Field name="designation" label="Designation" required />}
        {role === "EMPLOYER" && <Field name="organization" label="Company name" required />}
        {role === "PARENT" && <Field name="wardName" label="Student (ward) name" required />}
        {role === "PARENT" && <Field name="department" label="Ward's Dept./Course" required />}
        {role === "PARENT" && <Field name="organization" label="Occupation" />}
        <Field name="password" label="Password (min 8 characters)" type="password" required />
        <Field name="confirm" label="Confirm password" type="password" required />
      </div>
      <SubmitButton className="btn w-full">Create account</SubmitButton>
    </form>
  );
}

function Field({ name, label, type = "text", required }: { name: string; label: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="label" htmlFor={name}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input className="input" id={name} name={name} type={type} required={required} minLength={type === "password" ? 8 : undefined} />
    </div>
  );
}
