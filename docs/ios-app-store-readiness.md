# iOS App Store Readiness

This document tracks the iOS release items needed before submitting Polished to App Store Connect.

## Current Configuration

- Bundle identifier: `com.polished.japanesetraining`
- Display name: `Polished`
- Deployment target: iOS 17.0
- Development API base URL: `http://127.0.0.1:3001/api`
- Microphone permission text:
  `録音した音声を文字起こしし、AIフィードバックを作成するためにマイクを使用します。`
- Privacy manifest file:
  `apps/ios/PolishedJapaneseTraining/App/PrivacyInfo.xcprivacy`

## Privacy Manifest

The app declares:

- No tracking.
- Audio data collection for recording and transcription.
- Other user content collection for transcripts, explanations, feedback, and saved learned-box records.
- User ID collection for the anonymous app user ID used to associate sessions and learned cards.
- `UserDefaults` required reason API usage with reason `CA92.1`, because the app stores an app-only anonymous user ID locally.

Before release, review this file whenever the app adds analytics, crash reporting SDKs, login, purchases, push notifications, or any third-party SDK.

## App Store Privacy Nutrition Label Draft

Use this as the first App Store Connect privacy questionnaire draft. Final answers must match production behavior.

| Data Type | Linked to User | Used for Tracking | Purpose |
| --- | --- | --- | --- |
| Audio Data | No | No | App Functionality |
| Other User Content | No | No | App Functionality |
| User ID | No | No | App Functionality |

Notes:

- Audio is uploaded to the backend for transcription and AI feedback.
- Transcript and feedback content can be stored as learned-box records.
- The current app uses an anonymous user ID, not a sign-in account.
- OpenAI API keys stay only on the backend and must never be bundled in the iOS app.

## User-Facing Privacy Policy Points

The public privacy policy should explain:

- The app records audio only when the user starts recording.
- Recorded audio is sent to the backend to create transcription and AI feedback.
- Transcripts, feedback, scores, sessions, and learned-box records may be stored to provide app functionality.
- The app uses an anonymous user ID to keep local app data connected to backend records.
- The app does not use collected data for advertising tracking.
- The user can request deletion of their stored records.
- Contact email for privacy/data deletion requests.
- The backend provides `DELETE /api/me/data` for anonymous user data deletion.

## Account and Data Handling

Current model:

- No login account.
- Anonymous user ID generated on device and stored in `UserDefaults`.
- Backend records are associated with that anonymous ID.
- Learned-box records remain accessible from the same app installation.
- Data deletion is handled by `DELETE /api/me/data` with the current anonymous user ID.

Release risk:

- If the app is deleted, the anonymous ID may be lost and records may no longer be recoverable.
- If account sync is added later, the privacy policy and App Store privacy answers must be updated.

## Remaining Release Tasks

- Set the Apple Developer Team ID in `apps/ios/project.yml`.
- Replace `APP_API_BASE_URL` with the production API URL for release builds.
- Add app icon and launch assets.
- Prepare App Store screenshots.
- Finalize privacy policy URL.
- Add a user-facing settings/privacy screen that calls `DELETE /api/me/data`.
- Decide contact email for privacy and deletion requests.
- Test microphone permission flow on a real device.
- Archive and upload a signed build from Xcode.
