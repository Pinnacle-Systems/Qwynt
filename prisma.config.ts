import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "src/models/schema.prisma",
  migrations: {
    path: "src/models/migrations",
    seed: "node src/models/seed.js",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
