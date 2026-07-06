# MuthuPrinters Workspace

This repo now uses `pnpm` with a small workspace layout:

- `.`: `@muthu-printers/api`
- `client/`: `@muthu-printers/web`

## Common commands

- `pnpm install`
- `pnpm dev`
- `pnpm dev:api`
- `pnpm dev:web`
- `pnpm build`
- `pnpm test:all`

## Prisma commands

- `pnpm prisma:validate`
- `pnpm prisma:generate`
- `pnpm prisma:migrate:dev`
- `pnpm prisma:migrate:squash`

## Notes

- The root package is the backend workspace package.
- The frontend remains in `client/` for now, but it participates in the shared lockfile and workspace commands.
