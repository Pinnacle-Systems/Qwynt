import { prisma } from "../../lib/prisma.js";

import cities from "../seed-data/cities.json" with { type: "json" };

export async function seedCities() {
  for (const city of cities) {
    await prisma.city.upsert({
      where: { id: city.id },
      update: city,
      create: city,
    });
  }
}
