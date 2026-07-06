## PostgreSQL Migration Stages

### Stage 1: Adapter cleanup

- Remove the MariaDB-specific Prisma adapter.
- Keep the app running on the current MySQL datasource.
- Make environment docs show both MySQL and PostgreSQL connection string formats.

### Stage 2: Prisma datasource switch

- The primary schema is now located at `src/models/schema.prisma` (PostgreSQL).
- The legacy MySQL schema is preserved at `src/models/schema.mysql.prisma`.
- Successfully swapped the PostgreSQL schema into place.

- Reset the Prisma migration baseline for PostgreSQL.
- Update `DATABASE_URL` to a PostgreSQL URL.

### Current schema-only portability changes

- `@db.LongBlob` was mapped to `@db.ByteA` in the PostgreSQL schema copy.
- `@db.LongText` was mapped to `@db.Text` in the PostgreSQL schema copy.
- `@db.Date` was left as-is because Prisma supports it for PostgreSQL.

### Stage 3: Raw SQL review

The following files contain raw SQL and should be reviewed for PostgreSQL compatibility before cutover:

- `src/services/stock.service.js`
- `src/services/partyLedger.js`
- `src/services/payOut.service.js`
- `src/services/po.service.js`
- `src/services/purchaseBill.service.js`
- `src/services/salesBill.service.js`
- `src/services/salesReturn.service.js`
- `src/utils/reports/profitReport.js`
- `src/sampleQuery.js`

### Common PostgreSQL follow-ups

- Replace MySQL-only SQL syntax if found during testing.
- Recreate migrations for PostgreSQL instead of reusing the current MySQL SQL files.
- Validate bigint, boolean, and date handling against existing reports and ledger queries.
