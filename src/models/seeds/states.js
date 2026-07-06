import { prisma } from "../../lib/prisma.js";

import states from "../seed-data/states.json" with { type: "json" };

export async function seedStates() {
  for (const state of states) {
    await prisma.state.upsert({
      where: { id: state.id },
      update: state,
      create: state,
    });
  }
}
