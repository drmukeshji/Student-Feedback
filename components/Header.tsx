import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { logout } from "@/app/actions";
import { ROLE_LABELS, type Role } from "@/lib/roles";

export default async function Header() {
  const user = await getCurrentUser();
  return (
    <header className="border-b border-brand-800 bg-brand-900 text-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg font-bold text-brand-900">GU</span>
          <span className="leading-tight">
            <span className="block font-semibold">Gurugram University</span>
            <span className="block text-xs text-brand-100">IQAC Feedback Portal</span>
          </span>
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          {user ? (
            <>
              {user.role === "ADMIN" ? (
                <>
                  <Link href="/admin" className="rounded px-3 py-1.5 hover:bg-brand-800">Dashboard</Link>
                  <Link href="/admin/users" className="rounded px-3 py-1.5 hover:bg-brand-800">Users</Link>
                </>
              ) : (
                <Link href="/dashboard" className="rounded px-3 py-1.5 hover:bg-brand-800">My Forms</Link>
              )}
              <Link href="/profile" className="rounded px-3 py-1.5 hover:bg-brand-800">
                {user.name} <span className="text-brand-100">({ROLE_LABELS[user.role as Role]})</span>
              </Link>
              <form action={logout}>
                <button className="rounded border border-brand-100/40 px-3 py-1.5 hover:bg-brand-800">Logout</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded px-3 py-1.5 hover:bg-brand-800">Login</Link>
              <Link href="/register" className="rounded bg-white px-3 py-1.5 font-semibold text-brand-900 hover:bg-brand-50">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
