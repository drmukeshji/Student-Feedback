export const ROLES = ["STUDENT", "ALUMNI", "FACULTY", "EMPLOYER", "PARENT", "STAFF", "ADMIN"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  STUDENT: "Student",
  ALUMNI: "Alumni",
  FACULTY: "Faculty Member",
  EMPLOYER: "Employer",
  PARENT: "Parent",
  STAFF: "Support Staff",
  ADMIN: "Administrator",
};

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  STUDENT: "Currently enrolled UG/PG students — semester feedback and exit survey.",
  ALUMNI: "Students who have completed their programme at the University.",
  FACULTY: "Teaching faculty — curriculum, teaching, infrastructure and governance.",
  EMPLOYER: "Organisations employing graduates of the University.",
  PARENT: "Parents and guardians of students.",
  STAFF: "Non-teaching / support staff of the University.",
  ADMIN: "IQAC administrators who manage users and view reports.",
};

/** Roles a visitor may pick when self-registering. Alumni accounts are normally
 * created by an admin marking a student as graduated, but past graduates who
 * never had a student account can register directly. */
export const SELF_REGISTER_ROLES: Role[] = ["STUDENT", "FACULTY", "EMPLOYER", "PARENT", "STAFF", "ALUMNI"];

export function isRole(v: unknown): v is Role {
  return typeof v === "string" && (ROLES as readonly string[]).includes(v);
}

export const FACULTIES: { name: string; departments: string[] }[] = [
  { name: "Life Sciences", departments: ["Pharmacy", "Physiotherapy", "Environmental Science", "Neuroscience", "Public Health"] },
  {
    name: "Social Sciences & Education",
    departments: ["Psychology", "Public Policy, Administration & Governance", "Political Science", "Economics"],
  },
  { name: "Humanities & Law", departments: ["Law", "Media Studies", "Indian and Foreign Languages"] },
  { name: "Science & Technology", departments: ["Engineering", "Physics", "Mathematics", "Chemistry"] },
  { name: "Management & Commerce", departments: ["Management", "Commerce"] },
];

export const DEPARTMENTS = FACULTIES.flatMap((f) => f.departments);
