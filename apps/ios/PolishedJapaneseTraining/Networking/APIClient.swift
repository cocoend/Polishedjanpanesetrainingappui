import Foundation

struct APIClient {
    var baseURL: URL
    var anonymousUserID: String = AnonymousUserIDStore.current()

    static let development = APIClient(baseURL: AppConfiguration.apiBaseURL)

    func health() async throws {
        let _: EmptyResponse = try await get("health")
    }

    func getHome() async throws -> HomeResponseDTO {
        try await get("home")
    }

    func getThemes() async throws -> [ThemeListItemDTO] {
        try await get("themes")
    }

    func getThemeDetail(themeID: String) async throws -> ThemeDetailResponseDTO {
        try await get("themes/\(themeID)/detail")
    }

    func getExplanationModels() async throws -> [ExplanationModelSummaryDTO] {
        try await get("explanation-models")
    }

    func getExplanationModel(modelID: String) async throws -> ExplanationModelDetailDTO {
        try await get("explanation-models/\(modelID)")
    }

    func createSession(themeID: String, selectedModelID: String) async throws -> PracticeSessionDetailDTO {
        try await post("sessions", body: CreateSessionDTO(themeId: themeID, selectedModelId: selectedModelID))
    }

    func getSession(sessionID: String) async throws -> PracticeSessionDetailDTO {
        try await get("sessions/\(sessionID)")
    }

    func getLatestUnfinishedSession() async throws -> LatestUnfinishedSessionDTO {
        try await get("sessions/latest-unfinished")
    }

    func updateSessionStatus(sessionID: String, status: PracticeSessionStatus) async throws -> PracticeSessionDetailDTO {
        try await patch("sessions/\(sessionID)/status", body: UpdateSessionStatusDTO(status: status))
    }

    func createAttempt(sessionID: String, attempt: CreateAttemptDTO) async throws -> AttemptDTO {
        try await post("sessions/\(sessionID)/attempts", body: attempt)
    }

    func uploadAttemptAudio(
        sessionID: String,
        audioFileURL: URL,
        audioDurationSec: Int,
        transcriptText: String?
    ) async throws -> AttemptDTO {
        let boundary = "Boundary-\(UUID().uuidString)"
        let audioData = try Data(contentsOf: audioFileURL)
        let url = baseURL.appending(path: "sessions/\(sessionID)/attempts")
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue(anonymousUserID, forHTTPHeaderField: "x-anonymous-user-id")
        request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")
        request.httpBody = MultipartFormDataBuilder(boundary: boundary)
            .addField(name: "audioDurationSec", value: String(audioDurationSec))
            .addField(name: "transcriptText", value: transcriptText ?? "")
            .addFile(
                name: "audio",
                filename: audioFileURL.lastPathComponent,
                mimeType: "audio/mp4",
                data: audioData
            )
            .build()

        return try await send(request)
    }

    func getSessionAttempts(sessionID: String) async throws -> SessionAttemptsResponseDTO {
        try await get("sessions/\(sessionID)/attempts")
    }

    func getAttempt(attemptID: String) async throws -> AttemptDTO {
        try await get("attempts/\(attemptID)")
    }

    func transcribeAttempt(attemptID: String) async throws -> AttemptDTO {
        try await post("attempts/\(attemptID)/transcribe", body: EmptyRequest())
    }

    func createFeedback(attemptID: String) async throws -> FeedbackDTO {
        try await post("attempts/\(attemptID)/feedback", body: EmptyRequest())
    }

    func getFeedback(feedbackID: String) async throws -> FeedbackDTO {
        try await get("feedback/\(feedbackID)")
    }

    func createLearnedCard(sessionID: String) async throws -> LearnedCardDTO {
        try await post("sessions/\(sessionID)/learned-card", body: EmptyRequest())
    }

    func getLearnedCards() async throws -> LearnedCardListResponseDTO {
        try await get("learned-cards")
    }

    func getLearnedCard(cardID: String) async throws -> LearnedCardDTO {
        try await get("learned-cards/\(cardID)")
    }

    func markLearnedCardRead(cardID: String) async throws -> LearnedCardDTO {
        try await patch("learned-cards/\(cardID)/read", body: EmptyRequest())
    }

    func deleteMyData() async throws -> DeleteMyDataResponseDTO {
        try await delete("me/data")
    }

    private func get<Response: Decodable>(_ path: String) async throws -> Response {
        try await send(path: path, method: "GET", body: Optional<EmptyRequest>.none)
    }

    private func post<Request: Encodable, Response: Decodable>(_ path: String, body: Request) async throws -> Response {
        try await send(path: path, method: "POST", body: body)
    }

    private func patch<Request: Encodable, Response: Decodable>(_ path: String, body: Request) async throws -> Response {
        try await send(path: path, method: "PATCH", body: body)
    }

    private func delete<Response: Decodable>(_ path: String) async throws -> Response {
        try await send(path: path, method: "DELETE", body: Optional<EmptyRequest>.none)
    }

    private func send<Request: Encodable, Response: Decodable>(
        path: String,
        method: String,
        body: Request?
    ) async throws -> Response {
        let url = baseURL.appending(path: path)
        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue(anonymousUserID, forHTTPHeaderField: "x-anonymous-user-id")

        if let body {
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            request.httpBody = try JSONEncoder().encode(body)
        }

        return try await send(request)
    }

    private func send<Response: Decodable>(_ request: URLRequest) async throws -> Response {
        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }

        guard (200..<300).contains(httpResponse.statusCode) else {
            throw APIError.httpStatus(httpResponse.statusCode)
        }

        if Response.self == EmptyResponse.self {
            return EmptyResponse() as! Response
        }

        return try JSONDecoder().decode(Response.self, from: data)
    }
}

enum APIError: Error {
    case invalidResponse
    case httpStatus(Int)
}

private struct EmptyRequest: Encodable {}

private struct EmptyResponse: Decodable {}

private struct MultipartFormDataBuilder {
    private let boundary: String
    private var data = Data()

    init(boundary: String) {
        self.boundary = boundary
    }

    func addField(name: String, value: String) -> MultipartFormDataBuilder {
        var builder = self
        builder.data.appendString("--\(boundary)\r\n")
        builder.data.appendString("Content-Disposition: form-data; name=\"\(name)\"\r\n\r\n")
        builder.data.appendString("\(value)\r\n")
        return builder
    }

    func addFile(name: String, filename: String, mimeType: String, data fileData: Data) -> MultipartFormDataBuilder {
        var builder = self
        builder.data.appendString("--\(boundary)\r\n")
        builder.data.appendString("Content-Disposition: form-data; name=\"\(name)\"; filename=\"\(filename)\"\r\n")
        builder.data.appendString("Content-Type: \(mimeType)\r\n\r\n")
        builder.data.append(fileData)
        builder.data.appendString("\r\n")
        return builder
    }

    func build() -> Data {
        var finalData = data
        finalData.appendString("--\(boundary)--\r\n")
        return finalData
    }
}

private extension Data {
    mutating func appendString(_ string: String) {
        if let encoded = string.data(using: .utf8) {
            append(encoded)
        }
    }
}

private enum AnonymousUserIDStore {
    private static let key = "polished.anonymousUserID"

    static func current() -> String {
        if let existing = UserDefaults.standard.string(forKey: key), !existing.isEmpty {
            return existing
        }

        let created = "ios_anon_\(UUID().uuidString)"
        UserDefaults.standard.set(created, forKey: key)
        return created
    }
}

private enum AppConfiguration {
    static var apiBaseURL: URL {
        if let value = Bundle.main.object(forInfoDictionaryKey: "APP_API_BASE_URL") as? String,
           let url = URL(string: value),
           !value.isEmpty {
            return url
        }

        return URL(string: "http://127.0.0.1:3001/api")!
    }
}
