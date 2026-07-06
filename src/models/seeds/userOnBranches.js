import { prisma } from "../../lib/prisma.js";

import userOnBranches from "../seed-data/userOnBranches.json" with { type: "json" };

export async function seedUserOnBranches() {
  for (const userOnBranch of userOnBranches) {
    await prisma.userOnBranch.upsert({
      where: { id: userOnBranch.id },
      update: userOnBranch,
      create: userOnBranch,
    });
  }
}
