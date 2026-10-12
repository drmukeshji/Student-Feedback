import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { answerColumns, displayAnswer, getForm } from "@/lib/forms";
import { parse } from "@/lib/report";

const esc = (v: unknown) => {
  let s = String(v ?? "");
  if (/^[=+\-@]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export async function GET(req: NextRequest, { params }: { params: { formId: string } }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return new NextResponse("Forbidden", { status: 403 });
  const form = getForm(params.formId);
  if (!form) return new NextResponse("Not found", { status: 404 });
  const dept = req.nextUrl.searchParams.get("dept");

  const responses = await prisma.response.findMany({
    where: { formId: form.id },
    orderBy: { createdAt: "asc" },
    include: { user: { select: { name: true, email: true, role: true, department: true } } },
  });
  const cols = answerColumns(form);
  const lines = [["Submitted At", "Account Name", "Account Email", "Account Role", ...cols.map((c) => c.label)].map(esc).join(",")];
  for (const r of responses) {
    const a = parse(r.answers);
    if (dept && a.department !== dept && r.user.department !== dept) continue;
    lines.push(
      [r.createdAt.toISOString(), r.user.name, r.user.email, r.user.role, ...cols.map((c) => displayAnswer(c.field, a[c.key]))].map(esc).join(","),
    );
  }
  return new NextResponse("\uFEFF" + lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${form.id}-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
