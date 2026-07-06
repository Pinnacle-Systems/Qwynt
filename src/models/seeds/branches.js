import { prisma } from "../../lib/prisma.js";

import branches from "../seed-data/branches.json" with { type: "json" };

export async function seedBranches() {
  for (const branch of branches) {
    await prisma.branch.upsert({
      where: { id: branch.id },
      update: branch,
      create: branch,
    });
  }
}
