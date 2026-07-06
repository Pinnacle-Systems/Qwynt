# ADR-004: Lookup + Autofill v1.0

## Current working decisions
- lookup uses hybrid provider architecture
- lookup selection writes snapshot values to rows
- save-time validation checks authoritative current state
- per-row generation tokens cancel stale cascades
- barcode is a specialized input path through the same lookup field

These decisions are intended to guide the first shared implementation in MuthuPrinters and should be revisited if real usage shows a better extraction boundary.
