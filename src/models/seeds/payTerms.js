import { prisma } from "../../lib/prisma.js";

import payTerms from "../seed-data/payTerms.json" with { type: "json" };

export async function seedPayTerms() {
  for (const payTerm of payTerms) {
    await prisma.payTerm.upsert({
      where: { id: payTerm.id },
      update: {
        name: payTerm.name,
        days: payTerm.days,
        years: payTerm.years,
        months: payTerm.months,
        companyId: payTerm.companyId,
        active: payTerm.active,
        aliasName: payTerm.aliasName,
      },
      create: payTerm,
    });
  }
}
