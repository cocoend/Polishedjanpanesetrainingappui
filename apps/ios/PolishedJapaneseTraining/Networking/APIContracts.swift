import Foundation

struct HomeResponseDTO: Decodable {
    let latestScore: Int?
    let shouldContinueCurrentTheme: Bool
    let recommendReason: String
    let completionThreshold: Int
    let recommendedTheme: ThemeListItemDTO?
    let continueSessionId: String?
    let continueTheme: ThemeListItemDTO?
    let continueSelectedModelId: String?
    let continueProgressPercent: Int
    let weakPoints: [String]
    let streakDays: Int
    let unreadLearnedCardCount: Int
}

struct ThemeListItemDTO: Decodable, Identifiable {
    let id: String
    let slug: String
    let level: String
    let category: String
    let title: String
    let description: String
    let estimatedMinutes: Int
    let difficulty: Int
    let purposeTags: [String]
    let isActive: Bool
}

struct ThemeDetailResponseDTO: Decodable {
    let theme: ThemeDetailDTO
    let recommendedModel: ExplanationModelSummaryDTO
}

struct ThemeDetailDTO: Decodable, Identifiable {
    let id: String
    let slug: String
    let level: String
    let category: String
    let title: String
    let description: String
    let estimatedMinutes: Int
    let difficulty: Int
    let purposeTags: [String]
    let isActive: Bool
    let promptText: String
    let explanationGoal: String
    let recommendedModelId: String
    let keywords: [String]
    let usefulExpressions: [String]
    let hints: [String]
    let nextThemeId: String?
}

struct ExplanationModelSummaryDTO: Decodable, Identifiable {
    let id: String
    let slug: ExplanationModelSlug
    let nameJa: String
    let shortDescription: String
    let longDescription: String
    let structureLabel: String
    let steps: [String]
    let features: [String]
    let suitableFor: [String]
}

struct ExplanationModelDetailDTO: Decodable, Identifiable {
    let id: String
    let slug: ExplanationModelSlug
    let nameJa: String
    let shortDescription: String
    let longDescription: String
    let structureLabel: String
    let steps: [String]
    let features: [String]
    let suitableFor: [String]
    let isActive: Bool
}

enum ExplanationModelSlug: String, Decodable {
    case prep
    case stepByStep = "stepbystep"
    case scqa
}

struct CreateSessionDTO: Encodable {
    let themeId: String
    let selectedModelId: String
}

struct PracticeSessionDetailDTO: Decodable, Identifiable {
    let id: String
    let anonymousUserId: String
    let themeId: String
    let selectedModelId: String
    let status: PracticeSessionStatus
    let latestAttemptId: String?
    let completionThreshold: Int
    let startedAt: String
    let completedAt: String?
    let createdAt: String
    let updatedAt: String
}

enum PracticeSessionStatus: String, Codable {
    case draft
    case recording
    case uploaded
    case transcribed
    case feedbackReady = "feedback_ready"
    case completed
    case abandoned
}

struct LatestUnfinishedSessionDTO: Decodable {
    let session: PracticeSessionDetailDTO?
}

struct UpdateSessionStatusDTO: Encodable {
    let status: PracticeSessionStatus
    let completedAt: String?

    init(status: PracticeSessionStatus, completedAt: String? = nil) {
        self.status = status
        self.completedAt = completedAt
    }
}

struct CreateAttemptDTO: Encodable {
    let transcriptText: String
    let audioMimeType: String
    let audioDurationSec: Int
    let audioFileSizeBytes: Int
}

struct AttemptDTO: Decodable, Identifiable {
    let id: String
    let sessionId: String
    let attemptIndex: Int
    let audioMimeType: String
    let audioDurationSec: Int
    let audioFileSizeBytes: Int
    let transcriptText: String
    let transcriptionStatus: TranscriptionStatus
    let submittedAt: String
}

enum TranscriptionStatus: String, Decodable {
    case pending
    case processing
    case completed
    case failed
}

struct SessionAttemptsResponseDTO: Decodable {
    let attempts: [AttemptDTO]
}

struct FeedbackDTO: Decodable, Identifiable {
    let id: String
    let sessionId: String
    let attemptId: String
    let totalScore: Int
    let modelFitScore: Int
    let topicCoverageScore: Int
    let structureScore: Int
    let grammarScore: Int
    let clarityScore: Int
    let strengths: [String]
    let improvementPoints: [String]
    let retryFocusPoints: [String]
    let improvedAnswerExample: String
    let recommendReason: String?
    let isPerfectScore: Bool
    let completionThresholdSnapshot: Int
    let aiProvider: String
    let aiModel: String
    let promptVersion: String
    let rubricVersion: String
    let generationStatus: FeedbackGenerationStatus
    let createdAt: String
}

enum FeedbackGenerationStatus: String, Decodable {
    case pending
    case processing
    case completed
    case failed
}

struct LearnedCardDTO: Decodable, Identifiable {
    let id: String
    let sessionId: String
    let feedbackId: String
    let themeId: String
    let themeLevel: String
    let selectedModelId: String
    let title: String
    let summary: String
    let keyTakeaways: [String]
    let examplePhrases: [String]
    let purposeTags: [String]
    let latestScore: Int
    let bestScore: Int
    let attemptCount: Int
    let improvementFromFirstScore: Int
    let isRead: Bool
    let savedAt: String
    let readAt: String?
}

struct LearnedCardListResponseDTO: Decodable {
    let cards: [LearnedCardDTO]
}

struct DeleteMyDataResponseDTO: Decodable {
    let success: Bool
    let anonymousUserId: String
    let deletedSessions: Int
    let deletedAttempts: Int
    let deletedFeedback: Int
    let deletedLearnedCards: Int
    let deletedUsers: Int
}
