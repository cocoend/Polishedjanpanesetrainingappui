# Phase 0 Architecture Freeze

## Decisions Frozen

- Monorepo with `apps/web`, `apps/api`, `packages/shared`, and root `prisma`
- Backend stack: NestJS + Prisma + PostgreSQL
- Anonymous-first user identity with future migration path to registered users
- Shared DTOs and schemas live in `packages/shared`
- Recommendation completion threshold is configurable and defaults to 100
- Audio contract targets `webm/opus`, max 10 minutes, max 10 MB

## Core Lifecycle

1. Frontend creates or loads `anonymousUserId` from local storage.
2. Frontend creates a `PracticeSession` for a selected theme and explanation model.
3. User uploads an audio attempt under the session.
4. Backend stores audio, generates transcript, and then generates structured feedback.
5. User can retry within the same session, creating another `AnswerAttempt`.
6. User may save a `LearnedCard` snapshot from session feedback.

## State Boundaries

- `PracticeSession` is the aggregate root for a theme practice flow.
- `AnswerAttempt` represents each retry or submission under the same session.
- `Feedback` is generated per attempt and stores both score breakdown and AI metadata.
- `LearnedCard` is a user-saved learning snapshot and does not replace the original feedback.
