import SwiftUI

struct FeedbackScreen: View {
    @EnvironmentObject private var appState: AppState
    let source: FeedbackSource
    @State private var showTranscript = false
    @State private var showImprovedExample = false
    @State private var saved = false
    @State private var isSaving = false

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                AppHeader(title: "AIフィードバック", subtitle: "あなたの説明を分析しました")
                VStack(spacing: 16) {
                    scoreCard
                    strengthsCard
                    improvementCards
                    transcriptDisclosure
                    improvedExampleDisclosure
                    modelReviewCard
                }
                .padding(.horizontal, 24)
                .padding(.top, 24)
                .padding(.bottom, 196)
            }
        }
        .stableVerticalScroll()
        .background(Color.white)
        .safeAreaInset(edge: .bottom) {
            bottomActions
        }
    }

    private var saveButtonTitle: String {
        if saved || source == .learnedBox {
            return "保存できました！"
        }

        return isSaving ? "保存中" : "学んだBOXに保存する"
    }

    private var scoreCard: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 6) {
                    Text("総合評価")
                        .font(.subheadline)
                        .foregroundStyle(.white.opacity(0.85))
                    HStack(alignment: .lastTextBaseline, spacing: 6) {
                        Text("\(appState.latestFeedback.score)")
                            .font(.system(size: 56, weight: .bold, design: .rounded))
                        Text("/100")
                            .font(.title2)
                            .foregroundStyle(.white.opacity(0.85))
                    }
                }
                Spacer()
                Image(systemName: "star.fill")
                    .font(.system(size: 44))
                    .foregroundStyle(.white)
                    .frame(width: 72, height: 72)
                    .background(Color.white.opacity(0.20), in: RoundedRectangle(cornerRadius: 20, style: .continuous))
            }
            Text(appState.latestFeedback.reason)
                .font(.subheadline)
                .foregroundStyle(.white.opacity(0.92))
                .fixedSize(horizontal: false, vertical: true)
        }
        .foregroundStyle(.white)
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(24)
        .background(Color.green.gradient, in: RoundedRectangle(cornerRadius: 28, style: .continuous))
        .shadow(color: Color.green.opacity(0.28), radius: 12, y: 7)
    }

    private var strengthsCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 8) {
                Image(systemName: "checkmark.circle.fill")
                    .foregroundStyle(.green)
                SectionLabel(text: "よくできた点")
            }
            SoftCard(tint: .green, cornerRadius: 20, borderWidth: 2) {
                VStack(alignment: .leading, spacing: 12) {
                    ForEach(appState.latestFeedback.strengths, id: \.self) { item in
                        HStack(alignment: .top, spacing: 10) {
                            Image(systemName: "checkmark.circle.fill")
                                .font(.caption)
                                .foregroundStyle(.white)
                                .frame(width: 18, height: 18)
                                .background(Color.green, in: Circle())
                            Text(item)
                                .font(.subheadline)
                                .foregroundStyle(.primary)
                                .fixedSize(horizontal: false, vertical: true)
                        }
                    }
                }
            }
        }
    }

    private var improvementCards: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 8) {
                Image(systemName: "chart.line.uptrend.xyaxis")
                    .foregroundStyle(.orange)
                SectionLabel(text: "改善ポイント Top 3")
            }
            VStack(spacing: 12) {
                ForEach(Array(appState.latestFeedback.improvements.prefix(3).enumerated()), id: \.offset) { index, item in
                    improvementCard(index: index, text: item)
                }
            }
        }
    }

    private func improvementCard(index: Int, text: String) -> some View {
        let colors = [Color.red, Color.orange, Color.blue]
        let color = colors.indices.contains(index) ? colors[index] : .gray

        return HStack(alignment: .top, spacing: 12) {
            Text("\(index + 1)")
                .font(.caption.bold())
                .foregroundStyle(.white)
                .padding(.horizontal, 9)
                .padding(.vertical, 6)
                .background(color, in: RoundedRectangle(cornerRadius: 10, style: .continuous))
            VStack(alignment: .leading, spacing: 10) {
                HStack(spacing: 8) {
                    Text("改善")
                        .font(.caption2.bold())
                        .foregroundStyle(.white)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(color, in: Capsule())
                    Text("重要度: 中")
                        .font(.caption.weight(.medium))
                        .foregroundStyle(color)
                }
                Text("改善ポイント \(index + 1)")
                    .font(.headline.bold())
                Text(text)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
        .padding(20)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(color.opacity(0.10), in: RoundedRectangle(cornerRadius: 20, style: .continuous))
        .overlay {
            RoundedRectangle(cornerRadius: 20, style: .continuous)
                .stroke(color.opacity(0.28), lineWidth: 2)
        }
    }

    private var transcriptDisclosure: some View {
        disclosure(title: "あなたの回答全文", tint: .gray, isExpanded: $showTranscript) {
            VStack(alignment: .leading, spacing: 14) {
                Text(appState.latestTranscript)
                    .font(.subheadline)
                    .foregroundStyle(.primary)
                    .fixedSize(horizontal: false, vertical: true)
                Divider()
                HStack(spacing: 8) {
                    InlinePill(text: "文法エラー", foreground: .red, background: .red.opacity(0.12))
                    InlinePill(text: "表現改善", foreground: .orange, background: .orange.opacity(0.12))
                }
            }
        }
    }

    private var improvedExampleDisclosure: some View {
        disclosure(title: "改善例を見る", icon: "lightbulb.fill", tint: .purple, isExpanded: $showImprovedExample) {
            VStack(alignment: .leading, spacing: 14) {
                Text(appState.latestFeedback.improvedExample)
                    .font(.subheadline)
                    .foregroundStyle(.primary)
                    .fixedSize(horizontal: false, vertical: true)
                Text("ハイライト部分が改善された箇所です")
                    .font(.caption.weight(.medium))
                    .foregroundStyle(.green)
                    .padding(12)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color.green.opacity(0.10), in: RoundedRectangle(cornerRadius: 12, style: .continuous))
            }
        }
    }

    private var modelReviewCard: some View {
        Button {
            appState.push(.modelList)
        } label: {
            HStack(spacing: 12) {
                Image(systemName: "book.fill")
                    .foregroundStyle(.blue)
                VStack(alignment: .leading, spacing: 3) {
                    Text("説明モデルを復習")
                        .font(.subheadline.bold())
                        .foregroundStyle(.primary)
                    Text("\(appState.selectedModel.name)を確認")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                Spacer()
                Text("開く →")
                    .font(.subheadline.bold())
                    .foregroundStyle(.blue)
            }
            .padding(20)
            .background(Color.blue.opacity(0.10), in: RoundedRectangle(cornerRadius: 20, style: .continuous))
            .overlay {
                RoundedRectangle(cornerRadius: 20, style: .continuous)
                    .stroke(Color.blue.opacity(0.28), lineWidth: 2)
            }
            .contentShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
        }
        .buttonStyle(.plain)
    }

    private func disclosure<Content: View>(
        title: String,
        icon: String? = nil,
        tint: Color,
        isExpanded: Binding<Bool>,
        @ViewBuilder content: () -> Content
    ) -> some View {
        VStack(spacing: 10) {
            Button {
                isExpanded.wrappedValue.toggle()
            } label: {
                HStack {
                    if let icon {
                        Image(systemName: icon)
                            .foregroundStyle(tint)
                    }
                    Text(title)
                        .font(.subheadline.bold())
                        .textCase(.uppercase)
                    Spacer()
                    Image(systemName: "chevron.down")
                        .rotationEffect(.degrees(isExpanded.wrappedValue ? 180 : 0))
                }
                .foregroundStyle(.primary)
                .frame(maxWidth: .infinity, alignment: .leading)
                .contentShape(Rectangle())
            }
            .buttonStyle(.plain)

            if isExpanded.wrappedValue {
                content()
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(20)
                    .background(Color.white, in: RoundedRectangle(cornerRadius: 20))
                    .overlay {
                        RoundedRectangle(cornerRadius: 20)
                            .stroke(tint.opacity(0.25), lineWidth: 2)
                    }
            }
        }
        .padding(20)
        .background(tint.opacity(tint == .gray ? 0.08 : 0.10), in: RoundedRectangle(cornerRadius: 20))
        .overlay {
            RoundedRectangle(cornerRadius: 20)
                .stroke(tint.opacity(tint == .gray ? 0.18 : 0.28), lineWidth: 2)
        }
    }

    private var bottomActions: some View {
        VStack(spacing: 12) {
            PrimaryButton(title: "改善してもう一度挑戦", icon: "arrow.counterclockwise", color: .green) {
                appState.push(.retry)
            }

            PrimaryButton(
                title: saveButtonTitle,
                icon: saved || source == .learnedBox ? "checkmark.circle.fill" : "book.fill",
                color: saved || source == .learnedBox ? .green : .blue
            ) {
                saveToLearnedBox()
            }
            .disabled(saved || source == .learnedBox || isSaving)

            Button {
                appState.goHome()
            } label: {
                Text("ホームに戻る")
                    .font(.subheadline.bold())
                    .foregroundStyle(.secondary)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 8)
                    .contentShape(Rectangle())
            }
            .buttonStyle(.plain)
        }
        .padding(.horizontal, 24)
        .padding(.top, 14)
        .padding(.bottom, 10)
        .background(Color.white)
        .overlay(alignment: .top) {
            Rectangle()
                .fill(Color.gray.opacity(0.12))
                .frame(height: 1)
        }
    }

    private func saveToLearnedBox() {
        isSaving = true
        Task {
            await appState.saveLatestFeedbackToLearnedBox()
            saved = true
            isSaving = false
        }
    }
}
