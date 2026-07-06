# Prisma Migrations

This project accumulated a long Prisma migration history during active schema iteration.

## Current approach

- Keep the current schema in `src/models/schema.prisma` as the source of truth.
- Use Prisma's built-in squashing workflow based on `migrate diff` and `migrate resolve`.
- Create a single baseline migration at `src/models/migrations/000000000000_squashed_migrations/migration.sql`.
- Treat `000000000000_squashed_migrations` as the active migration history.
- Keep previous migration folders under `src/models/migrations-archive/` for reference.

## Why

- New environments should not have to replay more than a hundred historical migrations.
- A single baseline is easier to review and maintain while the project is still evolving.
- The built-in Prisma workflow keeps the squash process aligned with official migration tooling.

## Suggested workflow

1. Make sure the schema reflects the database shape you want to keep.
2. Run `pnpm prisma:validate`.
3. Run `pnpm prisma:migrate:squash`.
4. Review the generated baseline SQL before committing it.
5. On existing databases, run `pnpm prisma:migrate:squash:resolve`.
6. Archive or remove the older migration folders once the baseline is accepted.

## Notes

- `pnpm prisma:migrate:squash` uses Prisma's documented `migrate diff --from-empty` flow.
- `pnpm prisma:migrate:squash:resolve` marks the new baseline as applied on existing environments.
- Prisma 7 does not auto-generate the client after migrate, so this repo's migrate scripts run `prisma generate` explicitly.
- Prisma 7 also does not auto-seed after reset, so use `pnpm prisma:migrate:reset` when you want reset + generate + seed together.
- Do not squash migrations if you still need unmerged intermediate migrations from another branch.
