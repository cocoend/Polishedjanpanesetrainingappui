# Backend Maintenance Guide

This document explains how to understand, manage, and maintain the backend for the Japanese explanation training app. The backend should stay as one shared core API used by both Web and future iOS clients.

## Recommended Architecture

Keep one main backend:

```text
apps/web  ┐
          ├─ apps/api
apps/ios  ┘

packages/shared
prisma
```

Do not create separate Web and iOS backends at this stage. Web and iOS should call the same API contract. If one client later needs special aggregation, add it to the core API first. Only consider a client-specific BFF after the product and traffic patterns are stable.

## Backend Stack

- Runtime: Node.js
- Framework: NestJS
- Database ORM: Prisma
- Database: PostgreSQL
- Shared DTOs and schemas: `packages/shared`
- API app: `apps/api`
- Database schema and seed data: `prisma`

## Important Commands

```bash
npm run dev:api
npm run build:api
npm run typecheck
npm run db:generate
npm run db:migrate
npm run db:seed
npm run db:studio
```

Run `npm run db:seed` whenever master data changes, such as themes or explanation model text. The app reads master data from the database when Prisma is available, so changing `master-data.ts` alone is not enough after the database has already been seeded.

## Environment Variables

The backend reads configuration from `.env`.

Common variables:

```bash
DATABASE_URL=
PORT=3001
WEB_ORIGIN=http://localhost:5173

OPENAI_API_KEY=
TRANSCRIPTION_PROVIDER=openai
OPENAI_TRANSCRIPTION_MODEL=gpt-4o-mini-transcribe

FEEDBACK_PROVIDER=openai
OPENAI_FEEDBACK_MODEL=gpt-4.1-mini
```

Never put `OPENAI_API_KEY` in Web or iOS apps. Clients should call `apps/api`, and the backend should call OpenAI.

## Module Map

### `health`

Files:

- `apps/api/src/modules/health/health.controller.ts`

Purpose:

- Basic API health check.

Main endpoint:

- `GET /api/health`

### `home`

Files:

- `apps/api/src/modules/home/home.controller.ts`
- `apps/api/src/modules/home/home.service.ts`

Purpose:

- Builds HomeScreen data.
- Computes latest score, recommended theme, continue session, weak points, streak days, and unread learned card count.

Notes:

- Streak days reset to `0` if the user has no practice attempt today.
- Unread learned card count comes from `LearnedCard.isRead`.

### `themes`

Files:

- `apps/api/src/modules/themes/themes.controller.ts`

Purpose:

- Lists practice themes.
- Returns theme detail for TopicDetailScreen.

Main endpoints:

- `GET /api/themes`
- `GET /api/themes/:themeId`
- `GET /api/themes/:themeId/detail`

### `explanation-models`

Files:

- `apps/api/src/modules/explanation-models/explanation-models.controller.ts`

Purpose:

- Lists explanation models.
- Returns model details for model introduction screens.

Main endpoints:

- `GET /api/explanation-models`
- `GET /api/explanation-models/:modelId`

### `master-data`

Files:

- `apps/api/src/modules/master-data/master-data.ts`
- `apps/api/src/modules/master-data/master-data.service.ts`

Purpose:

- Defines fallback master data.
- Reads master data from Prisma when the database is available.

Important:

- Database data takes priority over fallback data.
- After editing `master-data.ts`, run `npm run db:seed`.

### `sessions`

Files:

- `apps/api/src/modules/sessions/sessions.controller.ts`
- `apps/api/src/modules/sessions/session-store.service.ts`

Purpose:

- Creates and manages practice sessions.
- Tracks selected theme, selected explanation model, status, and latest attempt.

Main endpoints:

- `POST /api/sessions`
- `GET /api/sessions/:sessionId`
- `PATCH /api/sessions/:sessionId/status`
- `GET /api/sessions/latest-unfinished`

### `attempts`

Files:

- `apps/api/src/modules/attempts/attempts.controller.ts`
- `apps/api/src/modules/attempts/attempt-store.service.ts`

Purpose:

- Creates answer attempts.
- Accepts transcript-only attempts or uploaded audio attempts.
- Stores uploaded audio under `uploads/attempt-audio`.

Main endpoints:

- `POST /api/sessions/:sessionId/attempts`
- `GET /api/sessions/:sessionId/attempts`
- `GET /api/attempts/:attemptId`
- `POST /api/attempts/:attemptId/transcribe`

Audio contract:

- Max duration: 10 minutes
- Max size: 10 MB
- Accepted MIME types: `audio/webm`, `video/webm`, `audio/mp4`, `audio/m4a`, `audio/aac`, `audio/x-m4a`

iOS note:

- iOS records `.m4a` with `audio/mp4` MIME type and uploads it as multipart form data.

### `transcription`

Files:

- `apps/api/src/modules/transcription/transcription.service.ts`

Purpose:

- Converts uploaded audio into transcript text.

Providers:

- `template`: fallback/demo text
- `openai`: real OpenAI transcription

Important:

- Use `TRANSCRIPTION_PROVIDER=openai` for real transcription.
- If the provider falls back to template mode, the user may see generated sample text instead of their spoken content.

### `feedback`

Files:

- `apps/api/src/modules/feedback/feedback.controller.ts`
- `apps/api/src/modules/feedback/feedback-store.service.ts`
- `apps/api/src/modules/feedback/feedback-generation.service.ts`

Purpose:

- Generates structured feedback for an attempt.
- Stores score breakdown, strengths, improvement points, retry focus points, improved answer example, AI metadata, and prompt/rubric versions.

Main endpoints:

- `POST /api/attempts/:attemptId/feedback`
- `GET /api/feedback/:feedbackId`

### `user-data`

Files:

- `apps/api/src/modules/user-data/user-data.controller.ts`
- `apps/api/src/modules/user-data/user-data.service.ts`

Purpose:

- Deletes the current anonymous user's practice data for privacy and App Store data deletion support.
- Deletes learned cards, feedback, attempts, sessions, and the anonymous user row when Prisma is available.
- Clears matching in-memory fallback caches when Prisma is unavailable.

Main endpoint:

- `DELETE /api/me/data`

Required header:

- `x-anonymous-user-id`

Important:

- This endpoint deletes user-generated practice data only.
- It does not delete master data such as themes or explanation models.

Providers:

- `rule`: local rule-based feedback
- `openai`: OpenAI feedback, with rule fallback

Important:

- Feedback is one-to-one with an attempt.
- The backend checks for existing feedback before generating again.
- RecordingScreen should wait for feedback generation before navigating to FeedbackScreen to avoid stale UI.

### `learned-cards`

Files:

- `apps/api/src/modules/learned-cards/learned-cards.controller.ts`
- `apps/api/src/modules/learned-cards/learned-cards.service.ts`

Purpose:

- Saves feedback snapshots into 学んだBOX.
- Lists saved cards.
- Marks cards as read.
- Deletes cards.

Main endpoints:

- `POST /api/sessions/:sessionId/learned-card`
- `GET /api/learned-cards`
- `GET /api/learned-cards/:cardId`
- `PATCH /api/learned-cards/:cardId/read`
- `DELETE /api/learned-cards/:cardId`

Important:

- HomeScreen unread red dot depends on `isRead`.
- When a saved card is opened from 学んだBOX, call `PATCH /api/learned-cards/:cardId/read`.

### `retry`

Files:

- `apps/api/src/modules/retry/retry.controller.ts`

Purpose:

- Provides previous feedback context for retry practice.

Main endpoint:

- `GET /api/sessions/:sessionId/retry-context`

## Core Data Lifecycle

```text
1. Client creates or reuses anonymous user id.
2. Client selects theme and explanation model.
3. Client creates PracticeSession.
4. Client records audio.
5. Client uploads audio as AnswerAttempt.
6. Backend transcribes audio.
7. Backend generates Feedback for the attempt.
8. Client displays FeedbackScreen.
9. User may save result as LearnedCard.
10. User may retry, creating another AnswerAttempt under the same session.
```

## Database Tables

Defined in `prisma/schema.prisma`.

- `User`: anonymous or registered user identity.
- `PracticeTheme`: theme master data.
- `ExplanationModel`: explanation model master data.
- `PracticeSession`: one practice flow for one theme and model.
- `AnswerAttempt`: one recording/submission attempt.
- `Feedback`: one feedback result per attempt.
- `LearnedCard`: saved feedback snapshot for 学んだBOX.

## Shared Contract Strategy

Keep shared schemas and DTOs in `packages/shared`.

The Web and iOS clients should follow the same backend response shapes:

- `HomeResponseDto`
- `ThemeListItemDto`
- `ThemeDetailResponseDto`
- `ExplanationModelDetailDto`
- `CreateSessionResponseDto`
- `AttemptDto`
- `FeedbackDto`
- `LearnedCardDto`
- `RetryContextDto`

When changing API responses:

1. Update `packages/shared`.
2. Update backend controller/service return shape.
3. Update Web client.
4. Update iOS client.
5. Run `npm run typecheck`.

## Web and iOS Client Rules

Both clients should:

- Send `x-anonymous-user-id`.
- Never call OpenAI directly.
- Never store OpenAI API keys.
- Upload recordings to the backend.
- Let backend own transcription and feedback generation.
- Treat backend IDs as source of truth.

iOS should use the same logical flow as Web:

```text
Home
TopicSelection
TopicDetail
ModelList
ModelIntro
Recording
Feedback
Retry
LearnedBox
```

## Common Maintenance Tasks

### Update explanation model text

1. Edit `apps/api/src/modules/master-data/master-data.ts`.
2. Run:

```bash
npm run db:seed
```

3. Restart API if needed:

```bash
npm run dev:api
```

4. Refresh Web or iOS client.

### Add a new theme

1. Add the theme in `master-data.ts`.
2. Ensure `recommendedModelId` points to an existing explanation model.
3. Run `npm run db:seed`.
4. Verify `GET /api/themes` and `GET /api/themes/:themeId/detail`.

### Debug stale UI data

Check in this order:

1. Is the API server running?
2. Does the frontend proxy point to the correct API host?
3. What does the API return via curl?
4. Is data coming from Prisma instead of fallback master data?
5. Does the client keep local state from a previous screen?

### Debug transcription showing fake text

Check:

1. `.env` has `TRANSCRIPTION_PROVIDER=openai`.
2. `.env` has `OPENAI_API_KEY`.
3. Uploaded audio file exists and has non-zero size.
4. `POST /api/attempts/:attemptId/transcribe` returns real transcript.
5. RecordingScreen displays the returned transcript, not a template.

### Debug FeedbackScreen showing old feedback

Expected flow:

```text
RecordingScreen button click
  -> create or reuse attempt
  -> POST /api/attempts/:attemptId/feedback
  -> store active feedback in client state
  -> navigate to FeedbackScreen
```

FeedbackScreen should not start with mock feedback. It should either receive current feedback or show loading.

### Debug 学んだBOX unread red dot

Expected flow:

```text
Open saved card
  -> PATCH /api/learned-cards/:cardId/read
  -> refresh Home data
  -> unreadLearnedCardCount becomes 0
```

If the red dot remains, inspect `GET /api/home`.

## App Store Notes

For iOS App Store submission, the backend helps keep sensitive work server-side.

iOS app should include:

- Microphone permission purpose text.
- Privacy policy explaining audio upload, transcription, AI feedback, and learned cards.
- Clear data handling explanation.

Backend should provide:

- Secure API access.
- No OpenAI key exposure.
- Predictable deletion/read-state behavior for user data.

## Verification Checklist

Before merging backend changes:

```bash
npm run typecheck
npm run build
```

For master data changes:

```bash
npm run db:seed
```

For API behavior:

```bash
curl -s http://127.0.0.1:3001/api/health
curl -s http://127.0.0.1:3001/api/home
curl -s http://127.0.0.1:3001/api/explanation-models
```

## Current Recommendation

Keep the backend as a single core API:

```text
Web client -> apps/api
iOS client -> apps/api
```

This is simpler, easier to maintain, and safer for App Store readiness than creating separate Web and iOS backends now.
