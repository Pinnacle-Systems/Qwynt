import { prisma } from "../../lib/prisma.js";

import departments from "../seed-data/departments.json" with { type: "json" };

export async function seedDepartments() {
  for (const department of departments) {
    await prisma.department.upsert({
      where: { id: department.id },
      update: department,
      create: department,
    });
  }
}
