import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { FORMS, allFields, type Answers } from "../lib/forms";

const prisma = new PrismaClient();

async function upsertUser(email: string, password: string, data: Record<string, unknown> & { name: string; role: string }) {
  const passwordHash = await bcrypt.hash(password, 10);
  return prisma.user.upsert({ where: { email }, update: {}, create: { email, passwordHash, ...data } });
}

function randomAnswers(formId: string, bias: number): Answers {
  const form = FORMS.find((f) => f.id === formId)!;
  const a: Answers = {};
  for (const f of allFields(form)) {
    if (f.type === "matrix") {
      for (const it of f.items) {
        const idx = Math.min(f.scale.length - 1, Math.max(0, Math.round(bias * (f.scale.length - 1) + (Math.random() - 0.5) * 2)));
        a[`${f.id}.${it.id}`] = f.scale[f.numeric ? idx : f.scale.length - 1 - idx].value;
      }
    } else if (f.type === "radio" || f.type === "select") {
      a[f.id] = f.options[Math.floor(Math.random() * f.options.length)].value;
    } else if (f.type === "checkboxes") {
      a[f.id] = f.options.filter(() => Math.random() > 0.4).map((o) => o.value);
    }
  }
  return a;
}

async function main() {
  const adminEmail = (process.env.ADMIN_EMAIL ?? "admin@gurugramuniversity.ac.in").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD ?? "Admin@12345";
  await upsertUser(adminEmail, adminPassword, { name: "IQAC Administrator", role: "ADMIN", designation: "Director, IQAC" });
  console.log(`Admin: ${adminEmail}`);

  if (process.env.SEED_DEMO === "false") return;

  const pw = "Demo@12345";
  const demo = [
    { email: "student@demo.gu", name: "Aarav Sharma", role: "STUDENT", department: "Engineering", program: "B.Tech CSE", enrollmentNo: "GU2023CSE001" },
    { email: "student2@demo.gu", name: "Priya Verma", role: "STUDENT", department: "Management", program: "MBA", enrollmentNo: "GU2024MBA014" },
    { email: "alumni@demo.gu", name: "Rohit Yadav", role: "ALUMNI", department: "Commerce", program: "M.Com", graduationYear: 2024, graduatedAt: new Date(), organization: "Infosys" },
    { email: "faculty@demo.gu", name: "Dr. Neha Gupta", role: "FACULTY", department: "Engineering", designation: "Assistant Professor" },
    { email: "employer@demo.gu", name: "Vikas Malhotra", role: "EMPLOYER", organization: "TechNova Pvt Ltd", designation: "HR Manager" },
    { email: "parent@demo.gu", name: "Sunita Sharma", role: "PARENT", wardName: "Aarav Sharma", department: "Engineering / B.Tech CSE" },
    { email: "staff@demo.gu", name: "Ramesh Kumar", role: "STAFF", department: "Examination Branch", designation: "Assistant" },
  ];
  const users = [];
  for (const { email, ...d } of demo) users.push(await upsertUser(email, pw, d));
  console.log(`Demo users (password ${pw}): ${demo.map((d) => d.email).join(", ")}`);

  if ((await prisma.response.count()) === 0) {
    const sample: [string, string][] = [
      ["student-feedback", "student2@demo.gu"],
      ["exit-survey", "alumni@demo.gu"],
      ["alumni-feedback", "alumni@demo.gu"],
      ["faculty-feedback", "faculty@demo.gu"],
      ["employer-feedback", "employer@demo.gu"],
      ["staff-feedback", "staff@demo.gu"],
    ];
    for (const [formId, email] of sample) {
      const u = users.find((x) => x.email === email)!;
      const answers = { ...randomAnswers(formId, 0.7), department: u.department ?? "" };
      await prisma.response.create({ data: { formId, userId: u.id, answers: JSON.stringify(answers) } });
    }
    console.log("Added sample responses.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
