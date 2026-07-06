import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;
const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });

const prisma =
  globalForPrisma.__muthuPrintersPrisma ?? new PrismaClient({ adapter });

  
 

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__muthuPrintersPrisma = prisma;
}



export { Prisma, prisma };
