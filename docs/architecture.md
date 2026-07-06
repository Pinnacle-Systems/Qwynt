# Architecture Overview

## Four-layer model
1. Platform Core
2. UI Infrastructure
3. Module Layer
4. Instance Configuration

In the current phase, these layers may live inside the MuthuPrinters codebase. Extraction into a separate library happens after the boundaries are proven on real transaction flows.

## Transaction pipeline
Module Code
→ TransactionManifest
→ InstanceConfig
→ Merge Engine
→ ResolvedTransactionDefinition
→ TransactionShell / TransactionGrid / Lookup Runtime

## Hard rules
- UI never consumes raw config
- Config cannot alter business logic
- Calculations are synchronous and pure
- Async work is isolated to lookup/enrich/validate
- No customer-specific branching in platform code

## Adoption rule
- Build shared foundations in this repo first.
- Extract only the parts that are reused and stable.
- If a boundary is not helping a real screen yet, keep it lightweight.
- Prefer seams that can be moved later over premature package separation.

## Module boundaries
Modules own:
- manifests
- providers
- calculations
- validations
- schema/migrations

Platform owns:
- runtime resolution
- interaction engines
- layout contracts
- caching/orchestration

## Near-term implementation shape
- Shared primitives can initially live in the app codebase.
- Real screens should consume those primitives through explicit interfaces.
- Extraction should be mostly a file-move plus packaging exercise, not a redesign.
