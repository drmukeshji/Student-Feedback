"use client";

import { useFormState } from "react-dom";
import { login } from "@/app/actions";
import { Alert } from "@/components/Alert";
import SubmitButton from "@/components/SubmitButton";

export default function LoginForm({ next }: { next?: string }) {
  const [state, action] = useFormState(login, undefined);
  return (
    <form action={action} className="space-y-4">
      {state?.error && <Alert>{state.error}</Alert>}
      <input type="hidden" name="next" value={next ?? ""} />
      <div>
        <label className="label" htmlFor="email">Email</label>
        <input className="input" id="email" name="email" type="email" required autoComplete="email" />
      </div>
      <div>
        <label className="label" htmlFor="password">Password</label>
        <input className="input" id="password" name="password" type="password" required autoComplete="current-password" />
      </div>
      <SubmitButton className="btn w-full">Login</SubmitButton>
    </form>
  );
}
