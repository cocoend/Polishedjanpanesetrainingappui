# Schema V1 Summary

## Core Tables

- `User`
- `PracticeTheme`
- `ExplanationModel`
- `PracticeSession`
- `AnswerAttempt`
- `Feedback`
- `LearnedCard`

## Key Principles

- One session belongs to one theme and one selected explanation model.
- One session can have multiple attempts.
- One attempt can have one feedback record.
- Learned cards are user-saved snapshots tied back to feedback and session history.
- Completion uses a configurable threshold rather than hardcoded `100` checks scattered across services.
