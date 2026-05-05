import SwiftUI

struct RootView: View {
    @EnvironmentObject private var appState: AppState

    var body: some View {
        NavigationStack(path: $appState.path) {
            HomeScreen()
                .navigationDestination(for: AppRoute.self) { route in
                    switch route {
                    case .topicSelection:
                        TopicSelectionScreen()
                    case .topicDetail:
                        TopicDetailScreen()
                    case .modelList:
                        ModelListScreen()
                    case .modelIntro(let modelID):
                        ModelIntroScreen(modelID: modelID)
                    case .recording:
                        RecordingScreen()
                    case .feedback(let source):
                        FeedbackScreen(source: source)
                    case .retry:
                        RetryScreen()
                    case .learnedBox:
                        LearnedBoxScreen()
                    }
                }
        }
    }
}
