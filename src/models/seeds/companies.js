import { prisma } from "../../lib/prisma.js";

import companies from "../seed-data/companies.json" with { type: "json" };

export async function seedCompanies() {
  for (const company of companies) {
    await prisma.company.upsert({
      where: { id: company.id },
      update: {
        companyId: company.companyId,
        name: company.name,
        code: company.code,
        gstNo: company.gstNo,
        panNo: company.panNo,
        contactName: company.contactName,
        contactMobile: company.contactMobile,
        contactEmail: company.contactEmail,
        active: company.active,
        logo: company.logo,
      },
      create: company,
    });
  }
}
