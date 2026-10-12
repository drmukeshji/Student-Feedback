import { requireUser } from "@/lib/auth";
import { ROLE_LABELS, type Role } from "@/lib/roles";
import ProfileForm from "./ProfileForm";

const FIELDS: Record<Role, ("phone" | "department" | "program" | "enrollmentNo" | "designation" | "organization" | "wardName")[]> = {
  STUDENT: ["phone", "department", "program", "enrollmentNo"],
  ALUMNI: ["phone", "department", "program", "organization", "designation"],
  FACULTY: ["phone", "department", "designation"],
  STAFF: ["phone", "department", "designation"],
  EMPLOYER: ["phone", "organization", "designation"],
  PARENT: ["phone", "wardName", "department", "organization"],
  ADMIN: ["phone", "designation"],
};

export default async function ProfilePage() {
  const user = await requireUser();
  const role = user.role as Role;
  const values = {
    name: user.name,
    phone: user.phone ?? "",
    department: user.department ?? "",
    program: user.program ?? "",
    enrollmentNo: user.enrollmentNo ?? "",
    designation: user.designation ?? "",
    organization: user.organization ?? "",
    wardName: user.wardName ?? "",
  };
  return (
    <div className="mx-auto max-w-2xl card">
      <h1 className="text-2xl font-bold">My profile</h1>
      <p className="mb-6 text-sm text-slate-600">
        {user.email} · {ROLE_LABELS[role]}
        {role === "ALUMNI" && user.graduationYear ? ` · Batch of ${user.graduationYear}` : ""}
      </p>
      <ProfileForm values={values} fields={["name", ...FIELDS[role]]} />
    </div>
  );
}
