import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Gurugram University – Feedback Portal",
  description: "IQAC stakeholder feedback portal: students, alumni, faculty, employers, parents and support staff.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-800 antialiased">
        <Header />
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-500">
          Internal Quality Assurance Cell (IQAC), Gurugram University, Gurugram – Haryana
        </footer>
      </body>
    </html>
  );
}
