import { prisma } from "../../lib/prisma.js";

import pages from "../seed-data/pages.json" with { type: "json" };
import roles from "../seed-data/roles.json" with { type: "json" };
import roleOnPages from "../seed-data/roleOnPages.json" with { type: "json" };

export async function seedRoleOnPages() {
  const validRoleIds = new Set(roles.map((role) => role.id));
  const validPageIds = new Set(pages.map((page) => page.id));

  for (const roleOnPage of roleOnPages) {
    if (!validRoleIds.has(roleOnPage.roleId) || !validPageIds.has(roleOnPage.pageId)) {
      continue;
    }

    await prisma.roleOnPage.upsert({
      where: { id: roleOnPage.id },
      update: roleOnPage,
      create: roleOnPage,
    });
  }
}
