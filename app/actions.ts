"use server";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser, requireUser } from "@/lib/auth";
import { SESSION_COOKIE, sessionCookieOptions, signSession } from "@/lib/session";
import { getForm, parseAnswers } from "@/lib/forms";
import { SELF_REGISTER_ROLES, isRole, type Role } from "@/lib/roles";

export type ActionState = { error?: string; errors?: string[]; ok?: string } | undefined;

const str = (fd: FormData, k: string) => {
  const v = String(fd.get(k) ?? "").trim();
  return v ? v.slice(0, 300) : null;
};

function safeNext(next: string | null) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}

async function startSession(userId: string) {
  cookies().set(SESSION_COOKIE, await signSession(userId), sessionCookieOptions);
}

export async function login(_: ActionState, fd: FormData): Promise<ActionState> {
  const email = str(fd, "email")?.toLowerCase();
  const password = String(fd.get("password") ?? "");
  if (!email || !password) return { error: "Email and password are required." };
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) return { error: "Invalid email or password." };
  if (!user.active) return { error: "Your account has been deactivated. Please contact the IQAC office." };
  await startSession(user.id);
  redirect(user.role === "ADMIN" ? "/admin" : safeNext(str(fd, "next")));
}

export async function register(_: ActionState, fd: FormData): Promise<ActionState> {
  const role = str(fd, "role");
  const name = str(fd, "name");
  const email = str(fd, "email")?.toLowerCase();
  const password = String(fd.get("password") ?? "");
  if (!isRole(role) || !SELF_REGISTER_ROLES.includes(role)) return { error: "Please choose a valid user type." };
  if (!name || !email) return { error: "Name and email are required." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Please enter a valid email address." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  if (password !== String(fd.get("confirm") ?? "")) return { error: "Passwords do not match." };
  if (await prisma.user.findUnique({ where: { email } })) return { error: "An account with this email already exists." };

  const gradYear = Number(str(fd, "graduationYear"));
  const user = await prisma.user.create({
    data: {
      role,
      name,
      email,
      passwordHash: await bcrypt.hash(password, 10),
      phone: str(fd, "phone"),
      department: str(fd, "department"),
      program: str(fd, "program"),
      enrollmentNo: str(fd, "enrollmentNo"),
      designation: str(fd, "designation"),
      organization: str(fd, "organization"),
      wardName: str(fd, "wardName"),
      graduationYear: role === "ALUMNI" && gradYear ? gradYear : null,
      graduatedAt: role === "ALUMNI" ? new Date() : null,
    },
  });
  await startSession(user.id);
  redirect("/dashboard");
}

export async function logout() {
  cookies().delete(SESSION_COOKIE);
  redirect("/");
}

export async function updateProfile(_: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireUser();
  const name = str(fd, "name");
  if (!name) return { error: "Name is required." };
  const newPassword = String(fd.get("newPassword") ?? "");
  if (newPassword && newPassword.length < 8) return { error: "New password must be at least 8 characters." };
  await prisma.user.update({
    where: { id: user.id },
    data: {
      name,
      phone: str(fd, "phone"),
      department: str(fd, "department"),
      program: str(fd, "program"),
      enrollmentNo: str(fd, "enrollmentNo"),
      designation: str(fd, "designation"),
      organization: str(fd, "organization"),
      wardName: str(fd, "wardName"),
      ...(newPassword ? { passwordHash: await bcrypt.hash(newPassword, 10) } : {}),
    },
  });
  revalidatePath("/profile");
  return { ok: "Profile updated." };
}

export async function submitFeedback(formId: string, _: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireUser();
  const form = getForm(formId);
  if (!form || !form.roles.includes(user.role as Role)) return { error: "This form is not available for your account." };
  if (!form.repeatable) {
    const existing = await prisma.response.findFirst({ where: { formId, userId: user.id } });
    if (existing) return { error: "You have already submitted this form. Thank you!" };
  }
  if (fd.get("declaration") !== "on") return { errors: ["Please confirm the declaration before submitting."] };
  const { answers, errors } = parseAnswers(form, fd);
  if (errors.length) return { errors };
  await prisma.response.create({ data: { formId, userId: user.id, answers: JSON.stringify(answers) } });
  revalidatePath("/dashboard");
  redirect(`/dashboard?submitted=${formId}`);
}

// ---------------- Admin ----------------

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") throw new Error("Not authorised");
  return user;
}

export async function markGraduated(fd: FormData) {
  await requireAdmin();
  const ids = fd.getAll("userId").map(String);
  const year = Number(fd.get("graduationYear")) || new Date().getFullYear();
  if (ids.length) {
    await prisma.user.updateMany({
      where: { id: { in: ids }, role: "STUDENT" },
      data: { role: "ALUMNI", graduationYear: year, graduatedAt: new Date() },
    });
  }
  revalidatePath("/admin/users");
}

export async function setUserRole(fd: FormData) {
  const admin = await requireAdmin();
  const id = String(fd.get("userId"));
  const role = String(fd.get("role"));
  if (!isRole(role) || id === admin.id) return;
  await prisma.user.update({
    where: { id },
    data: { role, ...(role === "ALUMNI" ? { graduatedAt: new Date() } : {}) },
  });
  revalidatePath("/admin/users");
}

export async function toggleActive(fd: FormData) {
  const admin = await requireAdmin();
  const id = String(fd.get("userId"));
  if (id === admin.id) return;
  const u = await prisma.user.findUnique({ where: { id } });
  if (u) await prisma.user.update({ where: { id }, data: { active: !u.active } });
  revalidatePath("/admin/users");
}

export async function createUser(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const role = str(fd, "role");
  const name = str(fd, "name");
  const email = str(fd, "email")?.toLowerCase();
  const password = String(fd.get("password") ?? "");
  if (!isRole(role)) return { error: "Choose a role." };
  if (!name || !email) return { error: "Name and email are required." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  if (await prisma.user.findUnique({ where: { email } })) return { error: "Email already registered." };
  await prisma.user.create({
    data: {
      role,
      name,
      email,
      passwordHash: await bcrypt.hash(password, 10),
      department: str(fd, "department"),
      ...(role === "ALUMNI" ? { graduatedAt: new Date(), graduationYear: new Date().getFullYear() } : {}),
    },
  });
  revalidatePath("/admin/users");
  return { ok: `Created ${email}.` };
}

export async function deleteResponse(fd: FormData) {
  await requireAdmin();
  const id = String(fd.get("responseId"));
  const r = await prisma.response.delete({ where: { id } });
  revalidatePath(`/admin/reports/${r.formId}`);
  redirect(`/admin/reports/${r.formId}`);
}
