import { prisma } from "../../lib/prisma.js";

import styleItems from "../seed-data/styleItems.json" with { type: "json" };

export async function seedStyleItems() {
  for (const styleItem of styleItems) {
    await prisma.styleItem.upsert({
      where: { id: styleItem.id },
      update: {
        name: styleItem.name,
        aliasName: styleItem.aliasName,
        active: styleItem.active,
        code: styleItem.code,
        hsnId: styleItem.hsnId,
        gsmId: styleItem.gsmId,
        itemGroupId: styleItem.itemGroupId,
        sizeTemplateId: styleItem.sizeTemplateId,
        uomId: styleItem.uomId,
      },
      create: styleItem,
    });
  }
}
