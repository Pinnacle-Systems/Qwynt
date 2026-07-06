import { prisma } from "../../lib/prisma.js";

import taxTemplateDetails from "../seed-data/taxTemplateDetails.json" with { type: "json" };

export async function seedTaxTemplateDetails() {
  for (const taxTemplateDetail of taxTemplateDetails) {
    await prisma.taxTemplateDetails.upsert({
      where: { id: taxTemplateDetail.id },
      update: {
        taxTemplateId: taxTemplateDetail.taxTemplateId,
        taxTermId: taxTemplateDetail.taxTermId,
        displayName: taxTemplateDetail.displayName,
        value: taxTemplateDetail.value,
        amount: taxTemplateDetail.amount,
      },
      create: taxTemplateDetail,
    });
  }
}
