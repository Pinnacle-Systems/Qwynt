import { prisma } from "../../lib/prisma.js";

import colors from "../seed-data/colors.json" with { type: "json" };

export async function seedColors() {
  for (const color of colors) {
    await prisma.color.upsert({
      where: { id: color.id },
      update: {
        name: color.name,
        active: color.active,
      },
      create: color,
    });
  }
}
