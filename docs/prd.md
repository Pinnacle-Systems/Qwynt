# PRD — Extraction-Ready Transaction Foundation

## Objective
Create reusable ERP transaction primitives inside MuthuPrinters that can later be extracted into a shared library.

## Users
- Internal developers building customer-specific ERP apps
- Business users entering sales, purchase, and inventory transactions

## Primary outcomes
- Keyboard-first data entry
- Zero copy-paste transaction forms
- Safe module reuse
- Configurable presentation without business logic drift
- A clear extraction path once the pattern is proven in this repo

## In scope
- TransactionShell
- TransactionGrid
- Lookup + Autofill
- Manifest + Config + Merge system
- Purchase Order vertical slice
- Adoption path inside the current app

## Out of scope for v1
- Excel paste
- Undo/redo
- Bulk edit
- Full reporting framework
- Multi-currency edge cases

## Functional requirements
- Forms use fixed header/footer and scrollable body
- Grid supports phantom row and keyboard navigation
- Lookup supports search, resolve, enrich, validate
- Save-time validation supports warn/block/ignore policy
- Modules own business calculations and validation

## Delivery strategy
- Build the first reusable transaction primitives inside this repo.
- Apply them to one real vertical slice before broadening scope.
- Extract code into a library only after the pattern is reused and stable.
- Prefer thin, testable boundaries over speculative framework work.

## Phase 1 quick wins
- Rebuild one transaction-heavy screen using a shared shell and shared interaction rules.
- Standardize one lookup/autofill flow behind a reusable interface.
- Move one set of transaction calculations and validations behind a module boundary.
- Demonstrate that a UX change in shared code affects more than one screen.
- Use Purchase Order as the first proving workflow and Sales Invoice as the next adopter once the runtime seam is stable.

## First slice details
- Purchase Order is the first transaction primitive slice in this repo.
- The first milestone focuses on client-side runtime reuse, not backend extraction.
- The Purchase Order slice must cover:
  - fixed header/footer with scrollable item body
  - reusable transaction grid with phantom rows
  - reusable lookup/autofill contract for item enrichment
  - save-time validation with explicit warn/block/ignore outcomes
  - module-owned calculations and validations behind a boundary

## Non-functional requirements
- Responsive under 100 rows with no virtualization
- Virtualization beyond 100 rows
- Barcode flow under 300ms target where feasible
- Contracts must fail fast on invalid manifests and degrade gracefully on invalid config

## Extraction criteria
- At least one primitive is used successfully in more than one workflow.
- Public APIs feel stable after real team feedback.
- Shared code boundaries are clearer than the current app boundaries they replace.
- Extraction reduces duplication instead of just moving it into another package.
