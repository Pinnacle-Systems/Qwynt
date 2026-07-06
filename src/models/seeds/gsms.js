import { prisma } from "../../lib/prisma.js";

import gsms from "../seed-data/gsms.json" with { type: "json" };

export async function seedGsms() {
  for (const gsm of gsms) {
    await prisma.gsm.upsert({
      where: { id: gsm.id },
      update: {
        name: gsm.name,
        active: gsm.active,
        companyId: gsm.companyId,
      },
      create: gsm,
    });
  }
}
