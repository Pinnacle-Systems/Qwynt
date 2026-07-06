import { prisma } from "../../lib/prisma.js";

import sizes from "../seed-data/sizes.json" with { type: "json" };

export async function seedSizes() {
  for (const size of sizes) {
    await prisma.size.upsert({
      where: { id: size.id },
      update: {
        name: size.name,
        active: size.active,
        companyId: size.companyId,
      },
      create: size,
    });
  }
}
