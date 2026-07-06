import { prisma } from "../../lib/prisma.js";

import employeeCategories from "../seed-data/employeeCategories.json" with { type: "json" };

export async function seedEmployeeCategories() {
  for (const employeeCategory of employeeCategories) {
    await prisma.employeeCategory.upsert({
      where: { id: employeeCategory.id },
      update: employeeCategory,
      create: employeeCategory,
    });
  }
}
