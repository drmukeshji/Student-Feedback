import Link from "next/link";
import RegisterForm from "./RegisterForm";

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="card">
        <h1 className="mb-1 text-2xl font-bold">Create your account</h1>
        <p className="mb-6 text-sm text-slate-600">Choose the type of user you are. The forms you see depend on this choice.</p>
        <RegisterForm />
        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account? <Link href="/login" className="font-semibold text-brand-600 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
