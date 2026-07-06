import { prisma } from "../../lib/prisma.js";

import itemGroups from "../seed-data/itemGroups.json" with { type: "json" };

export async function seedItemGroups() {
  for (const itemGroup of itemGroups) {
    await prisma.itemGroup.upsert({
      where: { id: itemGroup.id },
      update: {
        name: itemGroup.name,
        active: itemGroup.active,
        companyId: itemGroup.companyId,
      },
      create: itemGroup,
    });
  }
}
