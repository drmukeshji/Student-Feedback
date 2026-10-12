import Link from "next/link";
import LoginForm from "./LoginForm";

export default function LoginPage({ searchParams }: { searchParams: { next?: string } }) {
  return (
    <div className="mx-auto max-w-md">
      <div className="card">
        <h1 className="mb-1 text-2xl font-bold">Login</h1>
        <p className="mb-6 text-sm text-slate-600">Students, alumni, faculty, employers, parents, staff and administrators.</p>
        <LoginForm next={searchParams.next} />
        <p className="mt-6 text-center text-sm text-slate-600">
          New here? <Link href="/register" className="font-semibold text-brand-600 hover:underline">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
