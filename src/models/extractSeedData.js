import fs from "fs";
import path from "path";

const defaultDumpSource = path.resolve("./Dump20260411");
const defaultOutputDirectory = path.resolve("./src/models/seed-data");

const supportedEntities = {
  pages: {
    tableNames: ["muthuprinters_page", "page"],
    dumpFile: "muthuprinters_page.sql",
    columns: ["id", "name", "link", "type", "active", "pageGroupId"],
    outputFile: "pages.json",
    mapRow: (row) => ({
      ...row,
      active: Boolean(row.active),
    }),
    filterRow: () => true,
    cleanup: (row) => row,
  },
  pageGroups: {
    tableNames: ["muthuprinters_pagegroup", "pagegroup"],
    dumpFile: "muthuprinters_pagegroup.sql",
    columns: ["id", "type", "name", "active"],
    outputFile: "pageGroups.json",
    mapRow: (row) => ({
      ...row,
      active: Boolean(row.active),
    }),
    filterRow: () => true,
    cleanup: (row) => row,
  },
  companies: {
    tableNames: ["muthuprinters_company", "company"],
    dumpFile: "muthuprinters_company.sql",
    columns: [
      "id",
      "companyId",
      "name",
      "code",
      "gstNo",
      "panNo",
      "contactName",
      "contactMobile",
      "contactEmail",
      "active",
      "logo",
    ],
    outputFile: "companies.json",
    mapRow: (row) => ({
      ...row,
      active: Boolean(row.active),
    }),
    filterRow: () => true,
    cleanup: (row) => row,
  },
  countries: {
    tableNames: ["muthuprinters_country", "country"],
    dumpFile: "muthuprinters_country.sql",
    columns: ["id", "name", "code", "active", "companyId"],
    outputFile: "countries.json",
    mapRow: (row) => ({
      ...row,
      active: Boolean(row.active),
    }),
    filterRow: () => true,
    cleanup: (row) => row,
  },
  states: {
    tableNames: ["muthuprinters_state", "state"],
    dumpFile: "muthuprinters_state.sql",
    columns: ["id", "name", "code", "gstNo", "countryId", "active"],
    outputFile: "states.json",
    mapRow: (row) => ({
      ...row,
      active: Boolean(row.active),
    }),
    filterRow: () => true,
    cleanup: (row) => row,
  },
  cities: {
    tableNames: ["muthuprinters_city", "city"],
    dumpFile: "muthuprinters_city.sql",
    columns: ["id", "name", "code", "stateId", "active"],
    outputFile: "cities.json",
    mapRow: (row) => ({
      ...row,
      active: Boolean(row.active),
    }),
    filterRow: () => true,
    cleanup: (row) => row,
  },
  branches: {
    tableNames: ["muthuprinters_branch", "branch"],
    dumpFile: "muthuprinters_branch.sql",
    columns: [
      "id",
      "branchName",
      "branchCode",
      "contactName",
      "contactMobile",
      "contactEmail",
      "address",
      "companyId",
      "active",
      "idPrefix",
      "idSequence",
      "tempPrefix",
      "tempSequence",
      "prefixCategory",
      "logo",
    ],
    outputFile: "branches.json",
    mapRow: (row) => ({
      ...row,
      active: Boolean(row.active),
    }),
    filterRow: () => true,
    cleanup: (row) => row,
  },
  departments: {
    tableNames: ["muthuprinters_department", "department"],
    dumpFile: "muthuprinters_department.sql",
    columns: ["id", "name", "code", "active", "companyId"],
    outputFile: "departments.json",
    mapRow: (row) => ({
      ...row,
      active: Boolean(row.active),
    }),
    filterRow: () => true,
    cleanup: (row) => row,
  },
  employeeCategories: {
    tableNames: ["muthuprinters_employeecategory", "employeecategory"],
    dumpFile: "muthuprinters_employeecategory.sql",
    columns: ["id", "name", "code", "branchId", "active", "defaultCategory"],
    outputFile: "employeeCategories.json",
    mapRow: (row) => ({
      ...row,
      active: Boolean(row.active),
      defaultCategory: Boolean(row.defaultCategory),
    }),
    filterRow: () => true,
    cleanup: (row) => row,
  },
  finYears: {
    tableNames: ["muthuprinters_finyear", "finyear"],
    dumpFile: "muthuprinters_finyear.sql",
    columns: ["id", "from", "to", "companyId", "active"],
    outputFile: "finYears.json",
    mapRow: (row) => ({
      ...row,
      active: Boolean(row.active),
    }),
    filterRow: () => true,
    cleanup: (row) => row,
  },
  userOnBranches: {
    tableNames: ["muthuprinters_useronbranch", "useronbranch"],
    dumpFile: "muthuprinters_useronbranch.sql",
    columns: ["id", "branchId", "userId"],
    outputFile: "userOnBranches.json",
    mapRow: (row) => row,
    filterRow: () => true,
    cleanup: (row) => row,
  },
  roleOnPages: {
    tableNames: ["muthuprinters_roleonpage", "roleonpage"],
    dumpFile: "muthuprinters_roleonpage.sql",
    columns: ["id", "roleId", "pageId", "read", "create", "edit", "delete"],
    outputFile: "roleOnPages.json",
    mapRow: (row) => ({
      ...row,
      read: Boolean(row.read),
      create: Boolean(row.create),
      edit: Boolean(row.edit),
      delete: Boolean(row.delete),
    }),
    filterRow: () => true,
    cleanup: (row) => row,
  },
  roles: {
    tableNames: ["muthuprinters_role", "role"],
    dumpFile: "muthuprinters_role.sql",
    columns: ["id", "name", "companyId", "active", "defaultRole"],
    outputFile: "roles.json",
    mapRow: (row) => ({
      ...row,
      active: Boolean(row.active),
      defaultRole: Boolean(row.defaultRole),
    }),
    filterRow: () => true,
    cleanup: (row) => row,
  },
  employees: {
    tableNames: ["muthuprinters_employee", "employee"],
    dumpFile: "muthuprinters_employee.sql",
    columns: [
      "id",
      "name",
      "email",
      "regNo",
      "chamberNo",
      "departmentId",
      "joiningDate",
      "fatherName",
      "dob",
      "gender",
      "maritalStatus",
      "bloodGroup",
      "panNo",
      "consultFee",
      "salaryPerMonth",
      "commissionCharges",
      "mobile",
      "accountNo",
      "ifscNo",
      "branchName",
      "degree",
      "specialization",
      "localAddress",
      "localCityId",
      "localPincode",
      "permAddress",
      "permCityId",
      "permPincode",
      "active",
      "image",
      "branchId",
      "employeeCategoryId",
      "permanent",
      "leavingReason",
      "leavingDate",
      "canRejoin",
      "rejoinReason",
      "createdAt",
      "updatedAt",
      "bankName",
      "employeeId",
    ],
    outputFile: "employees.json",
    parseRows: (sqlText, config) =>
      parseDumpRows(sqlText, config.tableNames, config.columns, {
        preprocessValuesText: stripEmployeeImagePayloads,
      }),
    mapRow: (row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      regNo: row.regNo,
      chamberNo: row.chamberNo,
      departmentId: row.departmentId,
      joiningDate: row.joiningDate,
      fatherName: row.fatherName,
      dob: row.dob,
      gender: row.gender,
      maritalStatus: row.maritalStatus,
      bloodGroup: row.bloodGroup,
      panNo: row.panNo,
      consultFee: row.consultFee,
      salaryPerMonth: row.salaryPerMonth,
      commissionCharges: row.commissionCharges,
      mobile: row.mobile,
      accountNo: row.accountNo,
      ifscNo: row.ifscNo,
      branchName: row.branchName,
      bankName: row.bankName,
      degree: row.degree,
      specialization: row.specialization,
      localAddress: row.localAddress,
      localCityId: row.localCityId,
      localPincode: row.localPincode,
      permAddress: row.permAddress,
      permCityId: row.permCityId,
      permPincode: row.permPincode,
      active: row.active === null ? null : Boolean(row.active),
      branchId: row.branchId,
      employeeCategoryId: row.employeeCategoryId,
      permanent: row.permanent === null ? null : Boolean(row.permanent),
      leavingReason: row.leavingReason,
      leavingDate: row.leavingDate,
      canRejoin: row.canRejoin === null ? null : Boolean(row.canRejoin),
      rejoinReason: row.rejoinReason,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      employeeId: row.employeeId,
    }),
    filterRow: () => true,
    cleanup: (row) => row,
  },
  users: {
    tableNames: ["muthuprinters_user", "user"],
    dumpFile: "muthuprinters_user.sql",
    columns: [
      "id",
      "username",
      "email",
      "password",
      "roleId",
      "otp",
      "active",
      "employeeId",
    ],
    outputFile: "users.json",
    mapRow: (row) => ({
      id: row.id,
      username: row.username,
      email: row.email,
      password: row.password,
      roleId: row.roleId,
      otp: row.otp,
      active: Boolean(row.active),
      employeeId: row.employeeId,
    }),
    filterRow: () => true,
    cleanup: (row) => row,
  },
  payTerms: {
    tableNames: ["muthuprinters_payterm", "payterm"],
    dumpFile: "muthuprinters_payterm.sql",
    columns: ["id", "name", "days", "companyId", "active", "aliasName", "months", "years"],
    outputFile: "payTerms.json",
    mapRow: (row) => ({
      ...row,
      active: Boolean(row.active),
    }),
    filterRow: () => true,
    cleanup: (row) => row,
  },
  taxTerms: {
    tableNames: ["muthuprinters_taxterm", "taxterm"],
    dumpFile: "muthuprinters_taxterm.sql",
    columns: ["id", "name", "isPoWise", "companyId", "active"],
    outputFile: "taxTerms.json",
    mapRow: (row) => ({
      ...row,
      isPoWise: Boolean(row.isPoWise),
      active: Boolean(row.active),
    }),
    filterRow: () => true,
    cleanup: (row) => row,
  },
  taxTemplates: {
    tableNames: ["muthuprinters_taxtemplate", "taxtemplate"],
    dumpFile: "muthuprinters_taxtemplate.sql",
    columns: ["id", "name", "companyId", "active"],
    outputFile: "taxTemplates.json",
    mapRow: (row) => ({
      ...row,
      active: Boolean(row.active),
    }),
    filterRow: () => true,
    cleanup: (row) => row,
  },
  taxTemplateDetails: {
    tableNames: ["muthuprinters_taxtemplatedetails", "taxtemplatedetails"],
    dumpFile: "muthuprinters_taxtemplatedetails.sql",
    columns: ["id", "taxTemplateId", "taxTermId", "displayName", "value", "amount"],
    outputFile: "taxTemplateDetails.json",
    mapRow: (row) => row,
    filterRow: () => true,
    cleanup: (row) => row,
  },
  parties: {
    tableNames: ["muthuprinters_party", "party"],
    dumpFile: "muthuprinters_party.sql",
    columns: [
      "id",
      "name",
      "code",
      "aliasName",
      "displayName",
      "address",
      "cityId",
      "pincode",
      "panNo",
      "tinNo",
      "cstNo",
      "cstDate",
      "cinNo",
      "faxNo",
      "email",
      "website",
      "contactPersonName",
      "gstNo",
      "costCode",
      "active",
      "contactMobile",
      "companyId",
      "yarn",
      "fabric",
      "accessoryGroup",
      "createdAt",
      "updatedAt",
      "createdById",
      "updatedById",
      "isSupplier",
      "isCustomer",
      "coa",
      "soa",
      "accountNumber",
      "alterContactNumber",
      "bankBranchName",
      "bankname",
      "contact",
      "contactNumber",
      "contactPersonEmail",
      "department",
      "designation",
      "ifscCode",
      "landMark",
      "msmeNo",
      "companyAlterNumber",
      "partyCode",
      "parentId",
      "branchTypeId",
      "isBranch",
      "aadharNo",
    ],
    outputFile: "parties.json",
    mapRow: (row) => ({
      ...row,
      active: row.active === null ? null : Boolean(row.active),
      yarn: row.yarn === null ? null : Boolean(row.yarn),
      fabric: row.fabric === null ? null : Boolean(row.fabric),
      accessoryGroup: row.accessoryGroup === null ? null : Boolean(row.accessoryGroup),
      isSupplier: row.isSupplier === null ? null : Boolean(row.isSupplier),
      isCustomer: row.isCustomer === null ? null : Boolean(row.isCustomer),
      isBranch: row.isBranch === null ? null : Boolean(row.isBranch),
    }),
    filterRow: () => true,
    cleanup: (row) => row,
  },
  itemGroups: {
    tableNames: ["muthuprinters_itemgroup", "itemgroup"],
    dumpFile: "muthuprinters_itemgroup.sql",
    columns: ["id", "name", "active", "companyId"],
    outputFile: "itemGroups.json",
    mapRow: (row) => ({
      ...row,
      active: Boolean(row.active),
    }),
    filterRow: () => true,
    cleanup: (row) => row,
  },
  styleItems: {
    tableNames: ["muthuprinters_styleitem", "styleitem"],
    dumpFile: "muthuprinters_styleitem.sql",
    columns: ["id", "name", "aliasName", "active", "code", "hsnId", "gsmId", "itemGroupId", "sizeTemplateId", "uomId"],
    outputFile: "styleItems.json",
    mapRow: (row) => ({
      ...row,
      active: row.active === null ? null : Boolean(row.active),
    }),
    filterRow: () => true,
    cleanup: (row) => row,
  },
  uoms: {
    tableNames: ["muthuprinters_uom", "uom"],
    dumpFile: "muthuprinters_uom.sql",
    columns: ["id", "name", "active", "companyId"],
    outputFile: "uoms.json",
    mapRow: (row) => ({
      ...row,
      active: Boolean(row.active),
    }),
    filterRow: () => true,
    cleanup: (row) => row,
  },
  hsns: {
    tableNames: ["muthuprinters_hsn", "hsn"],
    dumpFile: "muthuprinters_hsn.sql",
    columns: ["id", "name", "active", "tax"],
    outputFile: "hsns.json",
    mapRow: (row) => ({
      ...row,
      active: Boolean(row.active),
    }),
    filterRow: () => true,
    cleanup: (row) => row,
  },
  gsms: {
    tableNames: ["muthuprinters_gsm", "gsm"],
    dumpFile: "muthuprinters_gsm.sql",
    columns: ["id", "name", "active", "companyId"],
    outputFile: "gsms.json",
    mapRow: (row) => ({
      ...row,
      active: Boolean(row.active),
    }),
    filterRow: () => true,
    cleanup: (row) => row,
  },
  sizeTemplates: {
    tableNames: ["muthuprinters_sizetemplate", "sizetemplate"],
    dumpFile: "muthuprinters_sizetemplate.sql",
    columns: ["id", "name", "companyId", "active"],
    outputFile: "sizeTemplates.json",
    mapRow: (row) => ({
      ...row,
      active: row.active === null ? null : Boolean(row.active),
    }),
    filterRow: () => true,
    cleanup: (row) => row,
  },
  colors: {
    tableNames: ["muthuprinters_color", "color"],
    dumpFile: "muthuprinters_color.sql",
    columns: ["id", "name", "active"],
    outputFile: "colors.json",
    mapRow: (row) => ({
      ...row,
      active: Boolean(row.active),
    }),
    filterRow: () => true,
    cleanup: (row) => row,
  },
  sizes: {
    tableNames: ["muthuprinters_size", "size"],
    dumpFile: "muthuprinters_size.sql",
    columns: ["id", "name", "active", "companyId"],
    outputFile: "sizes.json",
    mapRow: (row) => ({
      ...row,
      active: Boolean(row.active),
    }),
    filterRow: () => true,
    cleanup: (row) => row,
  },
};

function getUsageText() {
  const options = Object.keys(supportedEntities).join(", ");
  const scriptPath = path.relative(process.cwd(), process.argv[1] ?? "src/models/extractSeedData.js");

  return [
    "Usage:",
    `  node ${scriptPath} <entity> [dump-source] [output-path]`,
    `  node ${scriptPath} <entity> --dump-source <path> [--output <path>]`,
    "",
    "Supported entities:",
    `  ${options}`,
    "",
    "Arguments:",
    "  dump-source  Optional path to a dump directory or a combined .sql dump file.",
    "  output-path  Optional path to an output directory or output .json file.",
    "",
    "Defaults:",
    `  dump-source: ${path.relative(process.cwd(), defaultDumpSource)}`,
    `  output-path: ${path.relative(process.cwd(), defaultOutputDirectory)}`,
    "",
    "Example:",
    `  node ${scriptPath} pages`,
    `  node ${scriptPath} users ./Dump20260411`,
    `  node ${scriptPath} pages ./Dump20260411.sql ./tmp/pages.json`,
  ].join("\n");
}

function parseCliOptions(argv) {
  const positional = [];
  const options = {};

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--dump-source") {
      options.dumpSource = argv[index + 1];
      index += 1;
      continue;
    }

    if (arg === "--output") {
      options.outputPath = argv[index + 1];
      index += 1;
      continue;
    }

    if (arg === "--help" || arg === "-h") {
      options.help = true;
      continue;
    }

    positional.push(arg);
  }

  return { positional, options };
}

function splitTuples(valuesText) {
  const tuples = [];
  let current = "";
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (const char of valuesText) {
    if (depth === 0 && !inString && (char === "," || /\s/.test(char))) {
      continue;
    }

    current += char;

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === "\\") {
      escaped = true;
      continue;
    }

    if (char === "'") {
      inString = !inString;
      continue;
    }

    if (!inString && char === "(") {
      depth += 1;
      continue;
    }

    if (!inString && char === ")") {
      depth -= 1;
      if (depth === 0) {
        tuples.push(current.trim());
        current = "";
      }
      continue;
    }
  }

  return tuples;
}

function splitFields(tupleText) {
  const inner = tupleText.trim().replace(/^\(/, "").replace(/\)$/, "");
  const fields = [];
  let current = "";
  let inString = false;
  let escaped = false;

  for (const char of inner) {
    if (escaped) {
      current += char;
      escaped = false;
      continue;
    }

    if (char === "\\") {
      current += char;
      escaped = true;
      continue;
    }

    if (char === "'") {
      current += char;
      inString = !inString;
      continue;
    }

    if (char === "," && !inString) {
      fields.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  if (current.length > 0) {
    fields.push(current.trim());
  }

  return fields;
}

function parseValue(value) {
  if (value === "NULL") {
    return null;
  }

  if (value.startsWith("'") && value.endsWith("'")) {
    return value
      .slice(1, -1)
      .replace(/\\'/g, "'")
      .replace(/\\\\/g, "\\");
  }

  const numericValue = Number(value);
  if (!Number.isNaN(numericValue)) {
    return numericValue;
  }

  return value;
}

function stripEmployeeImagePayloads(valuesText) {
  let result = "";
  let index = 0;

  while (index < valuesText.length) {
    if (valuesText.startsWith("_binary '", index)) {
      result += "NULL";
      index += "_binary '".length;

      let escaped = false;
      while (index < valuesText.length) {
        const char = valuesText[index];

        if (escaped) {
          escaped = false;
          index += 1;
          continue;
        }

        if (char === "\\") {
          escaped = true;
          index += 1;
          continue;
        }

        if (char === "'") {
          index += 1;
          break;
        }

        index += 1;
      }

      continue;
    }

    result += valuesText[index];
    index += 1;
  }

  return result;
}

function parseDumpRows(sqlText, tableNames, columns, options = {}) {
  for (const tableName of tableNames) {
    const escapedTableName = tableName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const insertPattern = new RegExp(
      `INSERT INTO \`${escapedTableName}\`(?: \\([^;]*\\))? VALUES ([\\s\\S]*?);\\s*(?:/\\*!40000 ALTER TABLE|UNLOCK TABLES|--)`,
      "s",
    );
    const insertMatch = sqlText.match(insertPattern);

    if (!insertMatch) {
      continue;
    }

    const valuesText = options.preprocessValuesText
      ? options.preprocessValuesText(insertMatch[1])
      : insertMatch[1];

    return splitTuples(valuesText).map((tupleText) => {
      const fields = splitFields(tupleText).map(parseValue);
      return Object.fromEntries(columns.map((column, index) => [column, fields[index]]));
    });
  }

  throw new Error(
    `Could not find an INSERT INTO ... VALUES statement for tables: ${tableNames.join(", ")}`,
  );
}

function writeSeedData(outputFile, data) {
  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, `${JSON.stringify(data, null, 2)}\n`);
}

function resolveDumpFilePath(config, dumpSource) {
  const resolvedDumpSource = path.resolve(dumpSource ?? defaultDumpSource);

  if (!fs.existsSync(resolvedDumpSource)) {
    throw new Error(`Dump source not found: ${resolvedDumpSource}`);
  }

  const stats = fs.statSync(resolvedDumpSource);
  if (stats.isDirectory()) {
    return path.join(resolvedDumpSource, config.dumpFile);
  }

  return resolvedDumpSource;
}

function resolveOutputFilePath(config, outputPath) {
  const resolvedOutputPath = path.resolve(outputPath ?? defaultOutputDirectory);

  if (!fs.existsSync(resolvedOutputPath)) {
    const hasJsonExtension = path.extname(resolvedOutputPath).toLowerCase() === ".json";
    return hasJsonExtension
      ? resolvedOutputPath
      : path.join(resolvedOutputPath, config.outputFile);
  }

  const stats = fs.statSync(resolvedOutputPath);
  if (stats.isDirectory()) {
    return path.join(resolvedOutputPath, config.outputFile);
  }

  return resolvedOutputPath;
}

function main() {
  const { positional, options } = parseCliOptions(process.argv.slice(2));
  const [entity, positionalDumpSource, positionalOutputPath] = positional;

  if (options.help) {
    console.log(getUsageText());
    return;
  }

  if (!entity || !supportedEntities[entity]) {
    console.error(getUsageText());
    process.exitCode = 1;
    return;
  }

  const config = supportedEntities[entity];
  const dumpFilePath = resolveDumpFilePath(config, options.dumpSource ?? positionalDumpSource);
  const outputFilePath = resolveOutputFilePath(config, options.outputPath ?? positionalOutputPath);
  const dumpContents = fs.readFileSync(dumpFilePath, "utf8");

  const parsedRows = config.parseRows
    ? config.parseRows(dumpContents, config)
    : parseDumpRows(dumpContents, config.tableNames, config.columns);

  const rows = parsedRows
    .map(config.mapRow)
    .filter(config.filterRow)
    .map(config.cleanup);

  writeSeedData(outputFilePath, rows);

  console.log(
    `Wrote ${rows.length} ${entity} record(s) to ${path.relative(process.cwd(), outputFilePath)}`,
  );
}

main();
