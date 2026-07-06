import { prisma } from "../../lib/prisma.js";

import uoms from "../seed-data/uoms.json" with { type: "json" };

export async function seedUoms() {
  for (const uom of uoms) {
    await prisma.uom.upsert({
      where: { id: uom.id },
      update: {
        name: uom.name,
        active: uom.active,
        companyId: uom.companyId,
      },
      create: uom,
    });
  }
}
