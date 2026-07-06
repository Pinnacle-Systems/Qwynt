import { prisma } from "../../lib/prisma.js";

import roles from "../seed-data/roles.json" with { type: "json" };

export async function seedRoles() {
  for (const role of roles) {
    await prisma.role.upsert({
      where: { id: role.id },
      update: {
        name: role.name,
        companyId: role.companyId,
        active: role.active,
        defaultRole: role.defaultRole,
      },
      create: role,
    });
  }
}
