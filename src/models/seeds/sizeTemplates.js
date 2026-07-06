import { prisma } from "../../lib/prisma.js";

import sizeTemplates from "../seed-data/sizeTemplates.json" with { type: "json" };

export async function seedSizeTemplates() {
  for (const sizeTemplate of sizeTemplates) {
    await prisma.sizeTemplate.upsert({
      where: { id: sizeTemplate.id },
      update: {
        name: sizeTemplate.name,
        companyId: sizeTemplate.companyId,
        active: sizeTemplate.active,
      },
      create: sizeTemplate,
    });
  }
}
