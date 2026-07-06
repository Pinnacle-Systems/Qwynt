import { prisma } from "../../lib/prisma.js";

import taxTemplates from "../seed-data/taxTemplates.json" with { type: "json" };

export async function seedTaxTemplates() {
  for (const taxTemplate of taxTemplates) {
    await prisma.taxTemplate.upsert({
      where: { id: taxTemplate.id },
      update: {
        name: taxTemplate.name,
        companyId: taxTemplate.companyId,
        active: taxTemplate.active,
      },
      create: taxTemplate,
    });
  }
}
