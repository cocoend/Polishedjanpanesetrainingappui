# API Contract V1 Outline

## Core Endpoints

- `GET /api/health`
- `GET /api/home`
- `GET /api/themes`
- `GET /api/themes/:themeId`
- `GET /api/themes/:themeId/detail`
- `GET /api/explanation-models`
- `GET /api/explanation-models/:modelId`
- `POST /api/sessions`
- `GET /api/sessions/:sessionId`
- `PATCH /api/sessions/:sessionId/status`
- `GET /api/sessions/latest-unfinished`
- `POST /api/sessions/:sessionId/attempts`
- `GET /api/sessions/:sessionId/attempts`
- `GET /api/attempts/:attemptId`
- `POST /api/attempts/:attemptId/feedback`
- `GET /api/feedback/:feedbackId`
- `GET /api/sessions/:sessionId/retry-context`
- `POST /api/sessions/:sessionId/learned-card`
- `GET /api/learned-cards`
- `GET /api/learned-cards/:cardId`
- `PATCH /api/learned-cards/:cardId/read`
- `DELETE /api/learned-cards/:cardId`

## Contract Rules

- Anonymous identity is supplied via `x-anonymous-user-id`.
- Theme and explanation model data are treated as master data.
- Feedback responses must be structured JSON, not free-form text only.
- Audio upload APIs must remain compatible with future async processing.
