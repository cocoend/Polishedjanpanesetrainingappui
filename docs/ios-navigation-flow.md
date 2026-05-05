# iOS Page List and Navigation Flow

This document describes the first SwiftUI implementation target for the iOS app.

## Architecture Direction

- Keep `apps/api` as the single main backend.
- Keep the iOS client in `apps/ios`.
- Web and iOS should call the same API contracts.
- Shared DTO definitions should live in `packages/shared` where practical.
- Do not store OpenAI API keys in the iOS app.
- Add an iOS-specific BFF only if native requirements diverge enough to justify it later.

## Page List

| Page | SwiftUI file | Purpose |
| --- | --- | --- |
| Home | `HomeScreen.swift` | Entry point, streak, recommendation, continue card, learned box badge, quick actions |
| Topic Selection | `TopicSelectionScreen.swift` | Select a practice theme by level/topic |
| Topic Detail | `TopicDetailScreen.swift` | Confirm theme, explanation goal, selected model, recording tips |
| Model List | `ModelListScreen.swift` | Select an explanation model and open model intro |
| Model Intro | `ModelIntroScreen.swift` | Explain how a model works before practice |
| Recording | `RecordingScreen.swift` | Recording state, transcript display, feedback processing state |
| Feedback | `FeedbackScreen.swift` | Score, strengths, improvements, transcript, improved example, save/retry actions |
| Retry | `RetryScreen.swift` | Retry guidance before returning to recording |
| Learned Box | `LearnedBoxScreen.swift` | Saved feedback records and record detail navigation |

## Main Navigation Flow

```text
Home
├─ Topic Selection
│  └─ Topic Detail
│     ├─ Model Intro
│     └─ Recording
│        └─ Feedback
│           ├─ Retry
│           │  └─ Recording
│           └─ Save to Learned Box
├─ Model List
│  ├─ Model Intro
│  └─ Topic Detail
└─ Learned Box
   └─ Feedback
```

## Current Behavior

- Recording uses native `AVAudioRecorder` and saves an `.m4a` file locally before feedback generation.
- Tapping "AIフィードバックを受ける" uploads the recorded audio, requests backend transcription, then opens Feedback after feedback generation.
- The feedback save button changes from "学んだBOXに保存する" to disabled "保存できました！".
- Feedback opened from Learned Box shows disabled "保存できました！" because the record is already saved.
- Tapping a Learned Box record clears the Home learned-box unread badge.

## API Connection Order

1. Home API: streak, recommendation, continue practice, unread learned-box count. `HomeScreen` now has the first fallback-safe connection.
2. Theme API: topic list and topic detail. `TopicSelectionScreen` now loads the theme list with static fallback. `TopicDetailScreen` now loads theme detail with static fallback.
3. Model API: explanation model list and intro content. `ModelListScreen` and `ModelIntroScreen` now load the model list with static fallback.
4. Session API: create/resume practice session. `TopicDetailScreen` now creates a session and marks it as `recording` before opening `RecordingScreen`.
5. Recording upload/transcription API. `RecordingScreen` now records native `.m4a` audio, uploads it as multipart form data, requests transcription, and keeps the recognized transcript in app state.
6. Feedback API: generated feedback and saved learned-box record. `RecordingScreen` now calls feedback generation after attempt creation and updates `FeedbackScreen` state.
7. Learned Box API: saved records, read/unread status, record detail. `FeedbackScreen` now saves to Learned Box, and `LearnedBoxScreen` now loads records and marks opened records as read.

## iOS API Layer

- Swift DTOs live in `apps/ios/PolishedJapaneseTraining/Networking/APIContracts.swift`.
- The API client lives in `apps/ios/PolishedJapaneseTraining/Networking/APIClient.swift`.
- The client sends `x-anonymous-user-id` with every request.
- The anonymous user ID is generated once and stored in `UserDefaults`.
- The API base URL is configured through `APP_API_BASE_URL` in `apps/ios/project.yml`.
- The default development API base URL is `http://127.0.0.1:3001/api`.
- For real-device testing, replace it with the Mac's LAN IP address or a reachable staging API URL, then run `xcodegen generate`.
- iOS audio uploads use `.m4a` files with `audio/mp4` MIME type; the backend accepts `webm`, `m4a`, `mp4`, and `aac`.
- When adding new Swift files, run `xcodegen generate` from `apps/ios` before building.

## App Store Readiness Items

- Microphone permission text is configured in `apps/ios/project.yml`.
- Privacy manifest is configured in `apps/ios/PolishedJapaneseTraining/App/PrivacyInfo.xcprivacy`.
- Privacy policy, data collection, deletion, and anonymous-user handling notes are tracked in `docs/ios-app-store-readiness.md`.
- App icon and launch assets.
- Production API URL, signing team, and App Store Connect setup.
