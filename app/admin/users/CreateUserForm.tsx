"use client";

import { useFormState } from "react-dom";
import { createUser } from "@/app/actions";
import { Alert } from "@/components/Alert";
import SubmitButton from "@/components/SubmitButton";
import { ROLE_LABELS, ROLES } from "@/lib/roles";

export default function CreateUserForm() {
  const [state, action] = useFormState(createUser, undefined);
  return (
    <form action={action} className="space-y-3">
      {state?.error && <Alert>{state.error}</Alert>}
      {state?.ok && <Alert kind="success">{state.ok}</Alert>}
      <div className="grid gap-3 sm:grid-cols-5">
        <select name="role" className="input" defaultValue="STUDENT">
          {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
        </select>
        <input name="name" className="input" placeholder="Name" required />
        <input name="email" type="email" className="input" placeholder="Email" required />
        <input name="department" className="input" placeholder="Department (optional)" />
        <input name="password" type="password" minLength={8} className="input" placeholder="Temp password" required />
      </div>
      <SubmitButton className="btn btn-sm">Add user</SubmitButton>
    </form>
  );
}
