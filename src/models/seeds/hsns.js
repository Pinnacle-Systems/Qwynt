import { prisma } from "../../lib/prisma.js";

import hsns from "../seed-data/hsns.json" with { type: "json" };

export async function seedHsns() {
  for (const hsn of hsns) {
    await prisma.hsn.upsert({
      where: { id: hsn.id },
      update: {
        name: hsn.name,
        active: hsn.active,
        tax: hsn.tax,
      },
      create: hsn,
    });
  }
}
