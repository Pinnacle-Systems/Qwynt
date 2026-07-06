import { prisma } from "../../lib/prisma.js";

import pages from "../seed-data/pages.json" with { type: "json" };
import pageGroups from "../seed-data/pageGroups.json" with { type: "json" };

export async function seedPages() {
  const pageData = pages;
  const pageGroupData = pageGroups;

  const existingPages = await prisma.page.findMany({
    select: { id: true },
    take: 1,
  });

  if (existingPages.length > 0) {
    return;
  }

  await prisma.$transaction([
    prisma.pageGroup.createMany({ data: pageGroupData }),
    prisma.page.createMany({ data: pageData }),
  ]);
}
