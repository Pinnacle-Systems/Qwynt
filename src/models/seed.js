import { prisma } from "../lib/prisma.js";

import { seedBranches } from "./seeds/branches.js";
import { seedCities } from "./seeds/cities.js";
import { seedCompanies } from "./seeds/companies.js";
import { seedColors } from "./seeds/colors.js";
import { seedCountries } from "./seeds/countries.js";
import { seedDepartments } from "./seeds/departments.js";
import { seedEmployees } from "./seeds/employees.js";
import { seedEmployeeCategories } from "./seeds/employeeCategories.js";
import { seedFinYears } from "./seeds/finYears.js";
import { seedGsms } from "./seeds/gsms.js";
import { seedHsns } from "./seeds/hsns.js";
import { seedItemGroups } from "./seeds/itemGroups.js";
import { seedPages } from "./seeds/pages.js";
import { seedPayTerms } from "./seeds/payTerms.js";
import { seedParties } from "./seeds/parties.js";
import { seedRoleOnPages } from "./seeds/roleOnPages.js";
import { seedRoles } from "./seeds/roles.js";
import { seedSizes } from "./seeds/sizes.js";
import { seedSizeTemplates } from "./seeds/sizeTemplates.js";
import { seedStates } from "./seeds/states.js";
import { seedStyleItems } from "./seeds/styleItems.js";
import { seedTaxTemplateDetails } from "./seeds/taxTemplateDetails.js";
import { seedTaxTemplates } from "./seeds/taxTemplates.js";
import { seedTaxTerms } from "./seeds/taxTerms.js";
import { seedUoms } from "./seeds/uoms.js";
import { seedUserOnBranches } from "./seeds/userOnBranches.js";
import { seedUsers } from "./seeds/users.js";

async function main() {
  await seedPages();
  await seedCompanies();
  await seedCountries();
  await seedStates();
  await seedCities();
  await seedBranches();
  await seedDepartments();
  await seedEmployeeCategories();
  await seedFinYears();
  await seedPayTerms();
  await seedRoles();
  await seedRoleOnPages();
  await seedTaxTerms();
  await seedTaxTemplates();
  await seedTaxTemplateDetails();
  await seedEmployees();
  await seedUsers();
  await seedUserOnBranches();
  await seedParties();
  await seedUoms();
  await seedHsns();
  await seedGsms();
  await seedColors();
  await seedSizes();
  await seedSizeTemplates();
  await seedItemGroups();
  await seedStyleItems();
}

async function refreshSequences() {
  console.log("Refreshing database sequences...");
  try {
    await prisma.$executeRaw`
      DO $$
      DECLARE
        seq_name TEXT;
        table_name TEXT;
        column_name TEXT;
        max_id BIGINT;
      BEGIN
        FOR seq_name, table_name, column_name IN
          SELECT
            quote_ident(n.nspname) || '.' || quote_ident(s.relname) AS sequence_name,
            quote_ident(n.nspname) || '.' || quote_ident(t.relname) AS table_name,
            quote_ident(a.attname) AS column_name
          FROM pg_class s
          JOIN pg_namespace n ON n.oid = s.relnamespace
          JOIN pg_depend d ON d.objid = s.oid
          JOIN pg_class t ON t.oid = d.refobjid
          JOIN pg_attribute a ON a.attrelid = d.refobjid AND a.attnum = d.refobjsubid
          WHERE s.relkind = 'S' AND d.deptype = 'a'
          AND n.nspname NOT IN ('pg_catalog', 'information_schema')
        LOOP
          EXECUTE format('SELECT COALESCE(MAX(%s), 0) FROM %s', column_name, table_name) INTO max_id;
          IF max_id > 0 THEN
            EXECUTE format('SELECT setval(%L, %s, true)', seq_name, max_id);
          ELSE
            EXECUTE format('SELECT setval(%L, 1, false)', seq_name);
          END IF;
        END LOOP;
      END $$;
    `;
    console.log("Database sequences refreshed successfully.");
  } catch (error) {
    console.error("Error refreshing sequences:", error);
  }
}


main()
  .then(async () => {
    await refreshSequences();
    await prisma.$disconnect();
  })

  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
