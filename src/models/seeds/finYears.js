import { prisma } from "../../lib/prisma.js";

import finYears from "../seed-data/finYears.json" with { type: "json" };

function toPrismaDateTime(value) {
  if (!value) {
    return null;
  }

  return new Date(value.replace(" ", "T").concat("Z"));
}

export async function seedFinYears() {
  for (const finYear of finYears) {
    const finYearData = {
      ...finYear,
      from: toPrismaDateTime(finYear.from),
      to: toPrismaDateTime(finYear.to),
    };

    await prisma.finYear.upsert({
      where: { id: finYear.id },
      update: finYearData,
      create: finYearData,
    });
  }
}
