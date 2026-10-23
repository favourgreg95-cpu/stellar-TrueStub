# GraphQL Wiring Status

This document tracks the frontend flows that are still **mocked** — i.e. they
contain a `// TODO: Replace with actual API call` / GraphQL-wiring marker and
have not yet been connected to the real backend. It exists so that anyone can
get an accurate, current picture of which flows are real vs. mocked without
running a fresh repo-wide grep.

> **Keeping this current:** when you add a new
> `// TODO: Replace with actual API call` (or equivalent GraphQL-wiring)
> marker, add a row below and file a tracking issue for it. When you remove
> the last marker from a file, delete its row. See the note in
> [`CONTRIBUTING.md`](../CONTRIBUTING.md).
>
> **Paths are checked in CI:** every backtick-quoted repo path in this file
> must exist. `node scripts/check-wiring-status-paths.mjs` runs in
> `frontend-ci.yml` and fails the build if one doesn't. Always write full
> paths from the repo root, starting with `apps/`.
>
> **Last verified:** 2026-10-22, by grepping `apps/frontend/src` for wiring
> markers. Re-run that grep if this date is old:
>
> ```bash
> grep -rn "TODO: Replace with actual API call\|TODO: wire" apps/frontend/src
> ```

## Status legend

| Status | Meaning |
| --- | --- |
| 🔴 Mocked | Still returns hard-coded / placeholder data; not wired to the API. |
| 🟡 Partial | Some calls are real, but at least one flow is still mocked. |
| 🟢 Real | Fully wired to the backend; no wiring TODOs remain. |

## Current wiring gaps

| Flow / file | Status | Markers | Tracking issue |
| --- | --- | --- | --- |
| `apps/frontend/src/components/events/TicketEscrowIntegration.tsx` | 🔴 Mocked | 4 | [#319](https://github.com/frienzy514-png/stellar-TrueStub/issues/319) |
| `apps/frontend/src/components/ticket-listing/TicketEscrowWrapper.tsx` | 🔴 Mocked | 3 | [#319](https://github.com/frienzy514-png/stellar-TrueStub/issues/319) |
| `apps/frontend/src/app/dashboard/events/new/page.tsx` (create event → `INSERT INTO public.events`) | 🔴 Mocked | 1 (`TODO: wire to Hasura mutation`) | _none filed_ |

## No longer mocked

These files were listed in earlier versions of this table (some under old
paths that no longer exist). They have no wiring marker any more. Paths
below are their current locations.

| File | Notes |
| --- | --- |
| `apps/frontend/src/components/auth/NewPassword.tsx` | Uses Firebase `confirmPasswordReset`. |
| `apps/frontend/src/components/dashboard/UserProfileCard.tsx` | Moved from the old `profile/` directory. |
| `apps/frontend/src/components/dashboard/profile/NotificationPreferences.tsx` | Calls `/api/graphql`. Moved from the old `settings/` directory. |
| `apps/frontend/src/components/notifications/NotificationPreferences.tsx` | Live preference toggle; no marker. |
| `apps/frontend/src/core/store/data/favorites.store.ts` | Moved from the old top-level `stores/` directory. No marker, but it still seeds from `STUB_EVENTS` mock data. |
| `apps/frontend/src/app/dashboard/earnings` | No marker. |
| `apps/frontend/src/app/dashboard/escrow/[id]/receipt` | No marker. |
| `apps/frontend/src/app/dashboard/listings/[id]/offers` | No marker. |

## Notes

- The `TicketEscrow*` components used to exist twice each
  (`events/` + `ticket-events/`, `ticket-listing/` + `ticket-purchase/`).
  They were merged into the two files listed above (#364). The deleted
  `ticket-events/` and `ticket-purchase/` copies held a half-applied attempt
  to call `apps/frontend/src/lib/booking-escrow-api.ts` that didn't compile
  (it mixed the old booking/room names with the ticket-purchase ones), so
  the working copies were kept. Wiring them for real is #319.
  There has never been a `TicketEscrow*` file under `components/escrow/`.
- `apps/frontend/src/components/escrow/views/EscrowJustification.tsx` has a
  `TODO: wire PDF generation` marker. That is a feature gap, not a GraphQL
  wiring gap, so it isn't listed.
- If you find a marker that is missing from this table, add it (and file an
  issue) rather than leaving it untracked.
