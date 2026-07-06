import { prisma } from "../../lib/prisma.js";

import taxTerms from "../seed-data/taxTerms.json" with { type: "json" };

export async function seedTaxTerms() {
  for (const taxTerm of taxTerms) {
    await prisma.taxTerm.upsert({
      where: { id: taxTerm.id },
      update: {
        name: taxTerm.name,
        isPoWise: taxTerm.isPoWise,
        companyId: taxTerm.companyId,
        active: taxTerm.active,
      },
      create: taxTerm,
    });
  }
}
