import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function main() {
  await db.user.upsert({
    where: { email: "youremail@domain.com" },
    update: { role: "admin" },
    create: { email: "youremail@domain.com", role: "admin" },
  });
}

main().finally(() => db.$disconnect());
