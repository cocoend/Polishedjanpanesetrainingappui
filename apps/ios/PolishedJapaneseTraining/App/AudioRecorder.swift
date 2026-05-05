import AVFoundation
import Foundation

@MainActor
final class AudioRecorder: NSObject, ObservableObject, AVAudioRecorderDelegate {
    @Published private(set) var isRecording = false
    @Published private(set) var durationSec = 0
    @Published private(set) var recordedFileURL: URL?
    @Published var errorMessage: String?

    private var recorder: AVAudioRecorder?
    private var timer: Timer?
    private let audioSession = AVAudioSession.sharedInstance()

    var formattedDuration: String {
        let minutes = durationSec / 60
        let seconds = durationSec % 60
        return String(format: "%d:%02d", minutes, seconds)
    }

    func toggleRecording() async {
        if isRecording {
            stopRecording()
            return
        }

        await startRecording()
    }

    func reset() {
        stopTimer()
        recorder?.stop()
        recorder = nil
        isRecording = false
        durationSec = 0
        recordedFileURL = nil
        errorMessage = nil
    }

    private func startRecording() async {
        do {
            let isAllowed = await requestMicrophonePermission()

            guard isAllowed else {
                errorMessage = "マイクの使用が許可されていません。設定アプリでマイク許可を確認してください。"
                return
            }

            try audioSession.setCategory(.playAndRecord, mode: .spokenAudio, options: [.defaultToSpeaker])
            try audioSession.setActive(true)

            let fileURL = makeRecordingURL()
            let settings: [String: Any] = [
                AVFormatIDKey: Int(kAudioFormatMPEG4AAC),
                AVSampleRateKey: 44_100,
                AVNumberOfChannelsKey: 1,
                AVEncoderAudioQualityKey: AVAudioQuality.high.rawValue,
            ]

            recorder = try AVAudioRecorder(url: fileURL, settings: settings)
            recorder?.delegate = self
            recorder?.record()

            recordedFileURL = nil
            durationSec = 0
            errorMessage = nil
            isRecording = true
            startTimer()
        } catch {
            errorMessage = "録音を開始できませんでした。もう一度試してください。"
            isRecording = false
        }
    }

    private func stopRecording() {
        guard isRecording else {
            return
        }

        recorder?.stop()
        recordedFileURL = recorder?.url
        recorder = nil
        isRecording = false
        stopTimer()
        try? audioSession.setActive(false)
    }

    private func requestMicrophonePermission() async -> Bool {
        await withCheckedContinuation { continuation in
            AVAudioApplication.requestRecordPermission { isAllowed in
                continuation.resume(returning: isAllowed)
            }
        }
    }

    private func makeRecordingURL() -> URL {
        FileManager.default.temporaryDirectory
            .appendingPathComponent("polished-recording-\(UUID().uuidString)")
            .appendingPathExtension("m4a")
    }

    private func startTimer() {
        stopTimer()
        timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { [weak self] _ in
            Task { @MainActor in
                self?.durationSec += 1
            }
        }
    }

    private func stopTimer() {
        timer?.invalidate()
        timer = nil
    }
}
