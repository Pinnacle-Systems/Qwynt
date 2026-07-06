import { prisma } from "../../lib/prisma.js";

import users from "../seed-data/users.json" with { type: "json" };

export async function seedUsers() {
  for (const user of users) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: {
        username: user.username,
        email: user.email,
        password: user.password,
        roleId: user.roleId,
        otp: user.otp,
        active: user.active,
        employeeId: user.employeeId,
      },
      create: user,
    });
  }
}
