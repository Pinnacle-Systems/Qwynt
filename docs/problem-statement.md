# Problem Statement

Current ERP applications have grown through copy-paste reuse of forms and screens.

This has created:
- inconsistent UX
- duplicated logic
- dead code kept “just in case”
- fear of changing deployed apps
- slow customer onboarding
- config toggles backed by duplicated code instead of reusable modules

This project will solve that by introducing:
- a two-layer contract (manifest + instance config)
- reusable shells and interaction engines
- module-owned business logic
- safe runtime resolution

## Delivery constraint

The final solution should be extractable into a reusable library, but the pattern must be proven inside MuthuPrinters first.

That means:
- new foundations should be built in the current app, not beside it
- extraction is a milestone after validation, not the first deliverable
- abstractions should follow real usage on 1-2 transaction flows
- reusable boundaries matter from day one, but speculative platform work should be minimized
