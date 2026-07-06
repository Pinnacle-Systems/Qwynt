import { prisma } from "../../lib/prisma.js";

import countries from "../seed-data/countries.json" with { type: "json" };

export async function seedCountries() {
  for (const country of countries) {
    await prisma.country.upsert({
      where: { id: country.id },
      update: country,
      create: country,
    });
  }
}
