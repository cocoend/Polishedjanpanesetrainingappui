import SwiftUI

struct RecordingScreen: View {
    @EnvironmentObject private var appState: AppState
    @StateObject private var audioRecorder = AudioRecorder()
    @State private var isProcessing = false
    @State private var isTranscribing = false

    private var hasRecorded: Bool {
        audioRecorder.recordedFileURL != nil
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                header
                modelReferenceCard
                recordingArea

                if hasRecorded || audioRecorder.isRecording || audioRecorder.errorMessage != nil {
                    transcriptCard
                }

                actionButtons

                if !audioRecorder.isRecording && !hasRecorded {
                    tipsCard
                }
            }
            .padding(.horizontal, 24)
            .padding(.bottom, 32)
        }
        .stableVerticalScroll()
        .background(
            LinearGradient(
                colors: [Color.white, Color.green.opacity(0.10)],
                startPoint: .top,
                endPoint: .bottom
            )
        )
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text(appState.selectedTopic.title)
                .font(.title3.bold())
                .foregroundStyle(.primary)
            HStack(spacing: 8) {
                Pill(text: appState.selectedTopic.level, color: appState.selectedTopic.tint)
                Text("•")
                    .foregroundStyle(.secondary)
                Text(appState.selectedModel.name)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.top, 18)
    }

    private var modelReferenceCard: some View {
        SoftCard(tint: appState.selectedModel.tint, cornerRadius: 20, borderWidth: 2) {
            HStack(spacing: 12) {
                Image(systemName: "book.fill")
                    .font(.headline)
                    .foregroundStyle(appState.selectedModel.tint)
                    .frame(width: 22)
                VStack(alignment: .leading, spacing: 3) {
                    Text(appState.selectedModel.name)
                        .font(.subheadline.bold())
                        .foregroundStyle(.primary)
                    Text("説明モデルを参考に話そう")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                Spacer()
                MoreExplanationButton(color: appState.selectedModel.tint) {
                    appState.push(.modelIntro(appState.selectedModel.id))
                }
            }
        }
    }

    private var recordingArea: some View {
        VStack(spacing: 24) {
            VStack(spacing: 8) {
                Text(audioRecorder.formattedDuration)
                    .font(.system(size: 56, weight: .bold, design: .rounded))
                    .foregroundStyle(.primary)
                    .monospacedDigit()
                recordingStatus
            }

            Button {
                Task {
                    let wasRecording = audioRecorder.isRecording
                    await audioRecorder.toggleRecording()

                    if wasRecording, hasRecorded {
                        await transcribeRecordedAudio()
                    }
                }
            } label: {
                ZStack {
                    Circle()
                        .fill(audioRecorder.isRecording ? Color.red.gradient : Color.green.gradient)
                        .frame(width: 128, height: 128)
                        .shadow(
                            color: (audioRecorder.isRecording ? Color.red : Color.green).opacity(0.32),
                            radius: 18,
                            y: 10
                        )

                    if audioRecorder.isRecording {
                        Circle()
                            .stroke(Color.red.opacity(0.22), lineWidth: 18)
                            .frame(width: 156, height: 156)
                    }

                    Image(systemName: audioRecorder.isRecording ? "stop.fill" : hasRecorded ? "checkmark" : "mic.fill")
                        .font(.system(size: 54, weight: .bold))
                        .foregroundStyle(.white)
                }
            }
            .buttonStyle(.plain)
            .disabled(isProcessing)

            if !audioRecorder.isRecording && !hasRecorded {
                Text("リラックスして、自分の言葉で説明してみましょう！")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 24)
            }
        }
        .frame(maxWidth: .infinity)
    }

    @ViewBuilder
    private var recordingStatus: some View {
        if audioRecorder.isRecording {
            HStack(spacing: 8) {
                Circle()
                    .fill(Color.red)
                    .frame(width: 8, height: 8)
                Text("録音中")
                    .font(.subheadline.weight(.medium))
                    .foregroundStyle(.red)
            }
        } else if hasRecorded {
            Text("録音完了")
                .font(.subheadline.weight(.medium))
                .foregroundStyle(.secondary)
        } else {
            Text("タップして録音開始")
                .font(.subheadline.weight(.medium))
                .foregroundStyle(.secondary)
        }
    }

    private var transcriptCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 8) {
                Image(systemName: "sparkles")
                    .font(.caption.bold())
                    .foregroundStyle(.purple)
                SectionLabel(text: "音声認識")
            }

            VStack(alignment: .leading, spacing: 10) {
                if let errorMessage = audioRecorder.errorMessage {
                    Text(errorMessage)
                        .font(.subheadline)
                        .foregroundStyle(.red)
                        .fixedSize(horizontal: false, vertical: true)
                } else if isTranscribing {
                    HStack(spacing: 10) {
                        ProgressView()
                            .controlSize(.small)
                        Text("音声認識中...")
                            .font(.headline.bold())
                    }
                    Text("録音した音声をAIで文字起こししています。")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                } else if !appState.latestTranscript.isEmpty {
                    Text(appState.latestTranscript)
                        .font(.subheadline)
                        .foregroundStyle(.primary)
                        .lineSpacing(4)
                        .fixedSize(horizontal: false, vertical: true)
                } else if let feedbackLoadingError = appState.feedbackLoadingError, hasRecorded {
                    Text(feedbackLoadingError)
                        .font(.subheadline)
                        .foregroundStyle(.red)
                        .fixedSize(horizontal: false, vertical: true)
                } else if hasRecorded {
                    Text("録音完了")
                        .font(.headline.bold())
                    Text("音声認識の準備ができました。")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                } else {
                    Text("話した内容がここに表示されます...")
                        .font(.subheadline)
                        .italic()
                        .foregroundStyle(.secondary.opacity(0.75))
                }
            }
            .frame(maxWidth: .infinity, minHeight: 116, alignment: .topLeading)
        }
        .padding(24)
        .background(Color.white, in: RoundedRectangle(cornerRadius: 28, style: .continuous))
        .overlay {
            RoundedRectangle(cornerRadius: 28, style: .continuous)
                .stroke(Color.gray.opacity(0.18), lineWidth: 2)
        }
        .shadow(color: Color.black.opacity(0.04), radius: 6, y: 3)
    }

    @ViewBuilder
    private var actionButtons: some View {
        if hasRecorded {
            VStack(spacing: 12) {
                ProcessingButton(isProcessing: isProcessing) {
                    startFeedbackProcessing()
                }
                PrimaryButton(title: "もう一度録音する", icon: "arrow.counterclockwise", color: .gray) {
                    audioRecorder.reset()
                    isProcessing = false
                    isTranscribing = false
                    appState.resetCurrentRecordingResult()
                }
                .disabled(isProcessing)
            }
        }
    }

    private var tipsCard: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("💡 録音のコツ")
                .font(.subheadline.bold())
                .foregroundStyle(.primary)
            VStack(alignment: .leading, spacing: 6) {
                Text("• 静かな場所で録音しましょう")
                Text("• ゆっくり、はっきり話しましょう")
                Text("• 完璧である必要はありません")
            }
            .font(.subheadline)
            .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(20)
        .background(Color.yellow.opacity(0.14), in: RoundedRectangle(cornerRadius: 20, style: .continuous))
        .overlay {
            RoundedRectangle(cornerRadius: 20, style: .continuous)
                .stroke(Color.yellow.opacity(0.34), lineWidth: 2)
        }
    }

    private func startFeedbackProcessing() {
        isProcessing = true
        Task {
            if appState.latestTranscript.isEmpty {
                await transcribeRecordedAudio()
            }

            await appState.generateFeedbackFromLatestRecording(
                audioFileURL: audioRecorder.recordedFileURL,
                audioDurationSec: audioRecorder.durationSec
            )
            isProcessing = false
        }
    }

    private func transcribeRecordedAudio() async {
        guard !isTranscribing else {
            return
        }

        isTranscribing = true
        await appState.transcribeLatestRecording(
            audioFileURL: audioRecorder.recordedFileURL,
            audioDurationSec: audioRecorder.durationSec
        )
        isTranscribing = false
    }
}
