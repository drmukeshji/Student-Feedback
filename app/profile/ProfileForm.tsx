"use client";

import { useFormState } from "react-dom";
import { updateProfile } from "@/app/actions";
import { Alert } from "@/components/Alert";
import SubmitButton from "@/components/SubmitButton";

type P = Record<"name" | "phone" | "department" | "program" | "enrollmentNo" | "designation" | "organization" | "wardName", string>;

const LABELS: Record<keyof P, string> = {
  name: "Full name",
  phone: "Mobile number",
  department: "Department / Section",
  program: "Programme / Degree",
  enrollmentNo: "Enrollment no.",
  designation: "Designation",
  organization: "Organisation / Company / Occupation",
  wardName: "Ward (student) name",
};

export default function ProfileForm({ values, fields }: { values: P; fields: (keyof P)[] }) {
  const [state, action] = useFormState(updateProfile, undefined);
  return (
    <form action={action} className="space-y-4">
      {state?.error && <Alert>{state.error}</Alert>}
      {state?.ok && <Alert kind="success">{state.ok}</Alert>}
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((k) => (
          <div key={k}>
            <label className="label" htmlFor={k}>{LABELS[k]}</label>
            <input className="input" id={k} name={k} defaultValue={values[k]} required={k === "name"} />
          </div>
        ))}
        <div>
          <label className="label" htmlFor="newPassword">New password (leave blank to keep)</label>
          <input className="input" id="newPassword" name="newPassword" type="password" minLength={8} />
        </div>
      </div>
      <SubmitButton>Save profile</SubmitButton>
    </form>
  );
}
