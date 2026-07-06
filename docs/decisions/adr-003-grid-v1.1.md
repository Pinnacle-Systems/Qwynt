# ADR-003: Transaction Grid v1.1

## Current working decisions
- grid is keyboard-first
- exactly one phantom row
- row states: new, dirty, deleted
- buffer sync tracked via metadata
- validation does not block navigation
- save blocks on unresolved errors
- concurrent edit protection queues external updates

These decisions are intended to guide the first shared implementation in MuthuPrinters and should be revisited if real usage shows a better extraction boundary.
