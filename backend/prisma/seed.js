import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log(" Seeding database...");

  const hashedPassword = await bcrypt.hash("password123", 10);

  // Create Admin
  const admin = await prisma.user.upsert({
    where: { email: "admin@finance.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@finance.com",
      password: hashedPassword,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  // Create Analyst
  const analyst = await prisma.user.upsert({
    where: { email: "analyst@finance.com" },
    update: {},
    create: {
      name: "Analyst User",
      email: "analyst@finance.com",
      password: hashedPassword,
      role: "ANALYST",
      status: "ACTIVE",
    },
  });

  // Create Viewer
  const viewer = await prisma.user.upsert({
    where: { email: "viewer@finance.com" },
    update: {},
    create: {
      name: "Viewer User",
      email: "viewer@finance.com",
      password: hashedPassword,
      role: "VIEWER",
      status: "ACTIVE",
    },
  });

  // Seed some financial records
  const categories = ["Salary", "Food", "Transport", "Utilities", "Healthcare", "Entertainment", "Freelance", "Rent"];
  const records = [];

  for (let i = 0; i < 30; i++) {
    const isIncome = Math.random() > 0.5;
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 90)); // last 90 days

    records.push({
      amount: parseFloat((Math.random() * 5000 + 100).toFixed(2)),
      type: isIncome ? "INCOME" : "EXPENSE",
      category: categories[Math.floor(Math.random() * categories.length)],
      date,
      notes: `Sample ${isIncome ? "income" : "expense"} record ${i + 1}`,
      userId: admin.id,
    });
  }

  await prisma.financialRecord.createMany({ data: records });

  console.log(" Seed complete!");
  console.log("\n Default credentials:");
  console.log("  Admin   → admin@finance.com    / password123");
  console.log("  Analyst → analyst@finance.com  / password123");
  console.log("  Viewer  → viewer@finance.com   / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });