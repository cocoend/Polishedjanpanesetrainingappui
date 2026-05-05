import Foundation

@MainActor
final class AppState: ObservableObject {
    @Published var path: [AppRoute] = []
    @Published var selectedTopic = PracticeTopic.sample
    @Published var topics = PracticeTopic.samples
    @Published var recommendedTopic = PracticeTopic.sample
    @Published var continueTopic: PracticeTopic?
    @Published var selectedModel = ExplanationModel.stepByStep
    @Published var selectedModelIsUserChoice = false
    @Published var selectedTopicDetail = TopicDetailContent.sample
    @Published var explanationModels = ExplanationModel.all
    @Published var currentSession: PracticeSessionDetailDTO?
    @Published var currentAttempt: AttemptDTO?
    @Published var currentFeedback: FeedbackDTO?
    @Published var learnedRecords = LearnedRecord.samples
    @Published var unreadLearnedRecordCount = 1
    @Published var streakDays = 0
    @Published var latestScore = 65
    @Published var recommendReason = PracticeTopic.sample.description
    @Published var continueProgressPercent = 65
    @Published var weakPoints = ["接続詞の使い方", "比較表現", "理由の説明"]
    @Published var homeLoadingError: String?
    @Published var topicsLoadingError: String?
    @Published var modelsLoadingError: String?
    @Published var topicDetailLoadingError: String?
    @Published var sessionLoadingError: String?
    @Published var feedbackLoadingError: String?
    @Published var learnedBoxLoadingError: String?
    @Published var latestTranscript = ""
    @Published var latestFeedback = FeedbackResult.sample

    private let apiClient = APIClient.development

    func goHome() {
        path.removeAll()
    }

    func push(_ route: AppRoute) {
        path.append(route)
    }

    func pop() {
        _ = path.popLast()
    }

    func openLearnedRecord(_ record: LearnedRecord) {
        markLocalLearnedRecordRead(record.id)

        if let cardId = record.cardId {
            Task {
                _ = try? await apiClient.markLearnedCardRead(cardID: cardId)
                await loadLearnedCards()
            }
        } else {
            unreadLearnedRecordCount = max(0, unreadLearnedRecordCount - 1)
        }

        latestFeedback = record.feedback
        latestTranscript = record.transcript
        push(.feedback(source: .learnedBox))
    }

    private func markLocalLearnedRecordRead(_ recordId: LearnedRecord.ID) {
        learnedRecords = learnedRecords.map { record in
            guard record.id == recordId else {
                return record
            }

            return LearnedRecord(
                id: record.id,
                cardId: record.cardId,
                title: record.title,
                level: record.level,
                modelName: record.modelName,
                score: record.score,
                savedDate: record.savedDate,
                transcript: record.transcript,
                feedback: record.feedback,
                isRead: true
            )
        }
        unreadLearnedRecordCount = learnedRecords.filter { !$0.isRead }.count
    }

    func saveLatestFeedbackToLearnedBox() async {
        guard let currentSession else {
            unreadLearnedRecordCount = max(unreadLearnedRecordCount, 1)
            learnedBoxLoadingError = "Session is unavailable. Saved state is local only."
            return
        }

        do {
            let card = try await apiClient.createLearnedCard(sessionID: currentSession.id)
            let record = LearnedRecord(dto: card)
            learnedRecords.removeAll { $0.id == record.id }
            learnedRecords.insert(record, at: 0)
            unreadLearnedRecordCount = learnedRecords.filter { !$0.isRead }.count
            learnedBoxLoadingError = nil
        } catch {
            unreadLearnedRecordCount = max(unreadLearnedRecordCount, 1)
            learnedBoxLoadingError = "Learned Box API is unavailable. Saved state is local only."
        }
    }

    func selectTopic(_ topic: PracticeTopic) {
        selectedTopic = topic
        selectedTopicDetail = .sample
        selectedModelIsUserChoice = false
        currentSession = nil
        currentAttempt = nil
        currentFeedback = nil
        latestTranscript = ""
    }

    func selectModel(_ model: ExplanationModel) {
        selectedModel = model
        selectedModelIsUserChoice = true
    }

    func resetCurrentRecordingResult() {
        currentAttempt = nil
        currentFeedback = nil
        latestTranscript = ""
        feedbackLoadingError = nil
    }

    func model(for modelID: ExplanationModel.ID) -> ExplanationModel {
        explanationModels.first { $0.id == modelID } ??
            ExplanationModel.all.first { $0.id == modelID } ??
            selectedModel
    }

    func loadHome() async {
        do {
            let response = try await apiClient.getHome()
            if let recommendedTheme = response.recommendedTheme {
                recommendedTopic = PracticeTopic(dto: recommendedTheme)
            }
            continueTopic = response.continueTheme.map(PracticeTopic.init(dto:))
            streakDays = response.streakDays
            latestScore = response.latestScore ?? latestScore
            recommendReason = response.recommendReason
            continueProgressPercent = response.continueProgressPercent
            weakPoints = response.weakPoints.isEmpty ? weakPoints : Array(response.weakPoints.prefix(3))
            unreadLearnedRecordCount = max(unreadLearnedRecordCount, response.unreadLearnedCardCount)
            homeLoadingError = nil
        } catch {
            homeLoadingError = "Home API is unavailable. Static sample data is displayed."
        }
    }

    func loadTopics() async {
        do {
            let response = try await apiClient.getThemes()
            let activeTopics = response
                .filter(\.isActive)
                .map(PracticeTopic.init(dto:))

            if !activeTopics.isEmpty {
                topics = activeTopics
            }

            topicsLoadingError = nil
        } catch {
            topicsLoadingError = "Theme API is unavailable. Static sample topics are displayed."
        }
    }

    func loadExplanationModels() async {
        do {
            let response = try await apiClient.getExplanationModels()
            let loadedModels = response.map(ExplanationModel.init(dto:))

            if !loadedModels.isEmpty {
                explanationModels = loadedModels

                if !loadedModels.contains(where: { $0.id == selectedModel.id }) {
                    selectedModel = loadedModels[0]
                }
            }

            modelsLoadingError = nil
        } catch {
            modelsLoadingError = "Model API is unavailable. Static sample models are displayed."
        }
    }

    func loadSelectedTopicDetail() async {
        do {
            let response = try await apiClient.getThemeDetail(themeID: selectedTopic.id)
            selectedTopicDetail = TopicDetailContent(dto: response.theme)

            if !selectedModelIsUserChoice {
                selectedModel = ExplanationModel(dto: response.recommendedModel)
            }

            topicDetailLoadingError = nil
        } catch {
            topicDetailLoadingError = "Theme detail API is unavailable. Static sample detail is displayed."
        }
    }

    func startRecordingSession() async {
        currentAttempt = nil
        currentFeedback = nil
        latestTranscript = ""
        feedbackLoadingError = nil

        do {
            let created = try await apiClient.createSession(
                themeID: selectedTopic.id,
                selectedModelID: selectedModel.id
            )
            let recordingSession = try await apiClient.updateSessionStatus(
                sessionID: created.id,
                status: .recording
            )

            currentSession = recordingSession
            sessionLoadingError = nil
        } catch {
            currentSession = nil
            sessionLoadingError = "Session API is unavailable. Recording continues in local prototype mode."
        }

        push(.recording)
    }

    func transcribeLatestRecording(audioFileURL: URL?, audioDurationSec: Int) async {
        guard let currentSession, let audioFileURL else {
            latestTranscript = ""
            feedbackLoadingError = "録音データを確認できませんでした。もう一度録音してください。"
            return
        }

        do {
            let submittedAttempt = try await apiClient.uploadAttemptAudio(
                sessionID: currentSession.id,
                audioFileURL: audioFileURL,
                audioDurationSec: audioDurationSec,
                transcriptText: nil
            )
            let transcribedAttempt = submittedAttempt.transcriptionStatus == .completed
                ? submittedAttempt
                : try await apiClient.transcribeAttempt(attemptID: submittedAttempt.id)

            currentAttempt = transcribedAttempt
            latestTranscript = transcribedAttempt.transcriptText
            feedbackLoadingError = nil
        } catch {
            currentAttempt = nil
            latestTranscript = ""
            feedbackLoadingError = "音声認識に失敗しました。録音し直すか、API設定を確認してください。"
        }
    }

    func generateFeedbackFromLatestRecording(audioFileURL: URL?, audioDurationSec: Int) async {
        guard let currentSession else {
            try? await Task.sleep(nanoseconds: 2_500_000_000)
            feedbackLoadingError = "セッション情報を確認できませんでした。もう一度録音してください。"
            push(.feedback(source: .recording))
            return
        }

        do {
            let transcribedAttempt: AttemptDTO

            if let currentAttempt, currentAttempt.transcriptionStatus == .completed, !currentAttempt.transcriptText.isEmpty {
                transcribedAttempt = currentAttempt
            } else {
                let submittedAttempt: AttemptDTO

                if let audioFileURL {
                    submittedAttempt = try await apiClient.uploadAttemptAudio(
                        sessionID: currentSession.id,
                        audioFileURL: audioFileURL,
                        audioDurationSec: audioDurationSec,
                        transcriptText: nil
                    )
                } else {
                    submittedAttempt = try await apiClient.createAttempt(
                        sessionID: currentSession.id,
                        attempt: CreateAttemptDTO(
                            transcriptText: latestTranscript,
                            audioMimeType: "audio/mp4",
                            audioDurationSec: audioDurationSec,
                            audioFileSizeBytes: 0
                        )
                    )
                }

                transcribedAttempt = submittedAttempt.transcriptionStatus == .completed
                    ? submittedAttempt
                    : try await apiClient.transcribeAttempt(attemptID: submittedAttempt.id)
            }

            let feedback = try await apiClient.createFeedback(attemptID: transcribedAttempt.id)

            currentAttempt = transcribedAttempt
            currentFeedback = feedback
            latestTranscript = transcribedAttempt.transcriptText
            latestFeedback = FeedbackResult(dto: feedback)
            feedbackLoadingError = nil
        } catch {
            currentAttempt = nil
            currentFeedback = nil
            feedbackLoadingError = "AIフィードバックの作成に失敗しました。API設定を確認してください。"
        }

        push(.feedback(source: .recording))
    }

    func loadLearnedCards() async {
        do {
            let response = try await apiClient.getLearnedCards()
            let records = response.cards.map(LearnedRecord.init(dto:))

            if !records.isEmpty {
                learnedRecords = records
            }

            unreadLearnedRecordCount = learnedRecords.filter { !$0.isRead }.count
            learnedBoxLoadingError = nil
        } catch {
            unreadLearnedRecordCount = learnedRecords.filter { !$0.isRead }.count
            learnedBoxLoadingError = "Learned Box API is unavailable. Static sample records are displayed."
        }
    }
}

enum AppRoute: Hashable {
    case topicSelection
    case topicDetail
    case modelList
    case modelIntro(ExplanationModel.ID)
    case recording
    case feedback(source: FeedbackSource)
    case retry
    case learnedBox
}

enum FeedbackSource: Hashable {
    case recording
    case learnedBox
}
