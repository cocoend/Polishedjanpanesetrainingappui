# Polished Japanese Training iOS

Native SwiftUI client for the Japanese explanation training app.

## Architecture

The iOS app uses the same main backend as the Web app:

```text
apps/web  ┐
          ├─ apps/api
apps/ios  ┘
```

Do not put OpenAI API keys in the iOS app. Audio transcription and feedback generation must go through `apps/api`.

## Open in Xcode

Open:

```text
apps/ios/PolishedJapaneseTraining.xcodeproj
```

## Generate Xcode Project

This project uses XcodeGen. After changing `project.yml`, regenerate the Xcode project:

```bash
cd apps/ios
xcodegen generate
```

## Current Scope

This project currently contains a SwiftUI client for:

- Home
- Topic selection
- Topic detail
- Model list
- Model intro
- Recording
- Feedback
- Retry
- Learned Box

See `../../docs/ios-navigation-flow.md` for the page list, navigation flow, and API connection order.

## API Base URL

The API base URL is configured through `APP_API_BASE_URL` in `project.yml`.

Default:

```text
http://127.0.0.1:3001/api
```

This works for local iOS Simulator development when `apps/api` is running on the same Mac. For a real iPhone, set this to the Mac's LAN IP address or a reachable staging/production API URL, then run `xcodegen generate`.

## Next Steps

1. Refine static UI screen by screen to match the current Web design.
2. Test API flows on a real device.
3. Add production API base URL configuration.
4. Add app icon and launch assets.
5. Finalize App Store privacy policy and data deletion flow.
