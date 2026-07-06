# Vision

MuthuPrinters will develop an extraction-ready ERP transaction foundation inside the product first, then pull proven patterns into a reusable library.

The long-term goal is still a modular platform for customer-specific deployments. The near-term delivery path is different:
- build reusable interaction primitives directly in this repo
- validate them on real transaction flows before extracting
- keep contracts strong enough for later library adoption
- improve keyboard-first transaction UX without waiting for a separate platform track

## What this replaces
- copy-paste transaction forms
- screen-specific interaction rules
- duplicated lookup and validation behavior
- ad hoc config toggles that drift into business logic

## Success criteria
- A real transaction screen in this repo is rebuilt from shared primitives instead of copied form code.
- At least one interaction pattern is reused across more than one workflow before extraction.
- Common UX changes can be made once in shared code and observed in multiple screens.
- Transaction entry feels fast and predictable for power users.
- The extracted library boundary is obvious because the pattern has already been proven in production code.
