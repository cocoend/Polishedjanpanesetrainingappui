import SwiftUI

struct TopicDetailScreen: View {
    @EnvironmentObject private var appState: AppState
    @State private var isStartingSession = false

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                header
                VStack(spacing: 18) {
                    goalCard
                    modelSection
                    keywordCard
                    usefulExpressionsCard
                    hintsCard
                }
                .padding(.horizontal, 24)
                .padding(.top, 24)
                .padding(.bottom, 132)
            }
        }
        .stableVerticalScroll()
        .background(Color.white)
        .safeAreaInset(edge: .bottom) {
            bottomActions
        }
        .task(id: appState.selectedTopic.id) {
            await appState.loadSelectedTopicDetail()
        }
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 10) {
                Pill(text: appState.selectedTopic.level, color: appState.selectedTopic.tint)
                Text("⏱️ \(appState.selectedTopic.estimatedMinutes)分")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                Spacer()
            }
            Text(appState.selectedTopic.title)
                .font(.title2.bold())
                .foregroundStyle(.primary)
                .frame(maxWidth: .infinity, alignment: .leading)
        }
        .padding(.horizontal, 24)
        .padding(.top, 18)
        .padding(.bottom, 20)
        .background(Color.white)
        .overlay(alignment: .bottom) {
            Rectangle()
                .fill(Color.gray.opacity(0.12))
                .frame(height: 1)
        }
    }

    private var goalCard: some View {
        GradientSoftCard(tint: .green, endTint: .mint) {
            HStack(alignment: .top, spacing: 12) {
                Image(systemName: "target")
                    .font(.headline)
                    .foregroundStyle(.white)
                    .frame(width: 36, height: 36)
                    .background(Color.green, in: RoundedRectangle(cornerRadius: 12, style: .continuous))
                VStack(alignment: .leading, spacing: 6) {
                    Text("説明の目標")
                        .font(.headline.bold())
                    Text(appState.selectedTopicDetail.goal)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .fixedSize(horizontal: false, vertical: true)
                }
            }
        }
    }

    private var modelSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            SectionLabel(text: "おすすめモデル")
            modelCard
        }
    }

    private var modelCard: some View {
        SoftCard(tint: appState.selectedModel.tint, cornerRadius: 20, borderWidth: 2) {
            VStack(alignment: .leading, spacing: 12) {
                HStack(alignment: .top) {
                    HStack(alignment: .top, spacing: 12) {
                        Image(systemName: appState.selectedModel.iconName)
                            .font(.headline)
                            .foregroundStyle(.white)
                            .frame(width: 36, height: 36)
                            .background(appState.selectedModel.tint, in: RoundedRectangle(cornerRadius: 12, style: .continuous))
                        VStack(alignment: .leading, spacing: 4) {
                            Text(appState.selectedModel.name)
                                .font(.headline.bold())
                                .foregroundStyle(.primary)
                            Text(appState.selectedModel.description)
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                        }
                    }
                    Spacer()
                    MoreExplanationButton(color: appState.selectedModel.tint) {
                        appState.push(.modelIntro(appState.selectedModel.id))
                    }
                }
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(Array(appState.selectedModel.steps.enumerated()), id: \.offset) { index, step in
                            Text("\(index + 1). \(step)")
                                .font(.caption.bold())
                                .foregroundStyle(.secondary)
                                .padding(.horizontal, 12)
                                .padding(.vertical, 7)
                                .background(.white, in: Capsule())
                        }
                    }
                }
                Button {
                    appState.push(.modelList)
                } label: {
                    Text("ほかのモデルを見る")
                        .font(.subheadline.weight(.medium))
                        .foregroundStyle(.secondary)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 11)
                        .background(Color.white, in: RoundedRectangle(cornerRadius: 12, style: .continuous))
                        .overlay {
                            RoundedRectangle(cornerRadius: 12, style: .continuous)
                                .stroke(Color.gray.opacity(0.28), lineWidth: 1)
                        }
                }
                .buttonStyle(.plain)
            }
        }
    }

    private var keywordCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            SectionLabel(text: "使うと良いキーワード")
            VStack(alignment: .leading, spacing: 12) {
                LazyVGrid(
                    columns: [GridItem(.adaptive(minimum: 92), spacing: 8, alignment: .leading)],
                    alignment: .leading,
                    spacing: 8
                ) {
                    ForEach(appState.selectedTopicDetail.keywords, id: \.self) { keyword in
                        InlinePill(
                            text: keyword,
                            foreground: Color(red: 0.45, green: 0.28, blue: 0.03),
                            background: Color.yellow.opacity(0.22)
                        )
                        .overlay {
                            Capsule()
                                .stroke(Color.yellow.opacity(0.34), lineWidth: 1)
                        }
                    }
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(20)
            .background(Color.white, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
            .overlay {
                RoundedRectangle(cornerRadius: 20, style: .continuous)
                    .stroke(Color.gray.opacity(0.18), lineWidth: 2)
            }
        }
    }

    private var usefulExpressionsCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            SectionLabel(text: "役立つ表現")
            VStack(alignment: .leading, spacing: 12) {
                ForEach(appState.selectedTopicDetail.usefulExpressions, id: \.self) { expression in
                    HStack(alignment: .top, spacing: 10) {
                        Image(systemName: "message.fill")
                            .font(.caption)
                            .foregroundStyle(.green)
                            .frame(width: 18)
                        VStack(alignment: .leading, spacing: 2) {
                            Text(expression.title)
                                .font(.subheadline.weight(.medium))
                            Text(expression.subtitle)
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                    }
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(20)
            .background(Color.white, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
            .overlay {
                RoundedRectangle(cornerRadius: 20, style: .continuous)
                    .stroke(Color.gray.opacity(0.18), lineWidth: 2)
            }
        }
    }

    private var hintsCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            SectionLabel(text: "ヒント")
            SoftCard(tint: .purple, cornerRadius: 20, borderWidth: 2) {
                HStack(alignment: .top, spacing: 12) {
                    Image(systemName: "lightbulb.fill")
                        .font(.headline)
                        .foregroundStyle(.purple)
                        .padding(.top, 2)
                    VStack(alignment: .leading, spacing: 8) {
                        ForEach(appState.selectedTopicDetail.hints, id: \.self) { hint in
                            Text("• \(hint)")
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                                .fixedSize(horizontal: false, vertical: true)
                        }
                    }
                }
            }
        }
    }

    private var bottomActions: some View {
        VStack(spacing: 12) {
            PrimaryButton(
                title: isStartingSession ? "準備中" : "録音を開始する",
                icon: isStartingSession ? "hourglass" : "mic.fill",
                color: isStartingSession ? .blue : .green
            ) {
                startRecording()
            }
            .disabled(isStartingSession)

            Button {
                appState.push(.modelList)
            } label: {
                Text("説明モデルを見る")
                    .font(.subheadline.bold())
                    .foregroundStyle(.secondary)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 8)
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

    private func startRecording() {
        isStartingSession = true
        Task {
            await appState.startRecordingSession()
            isStartingSession = false
        }
    }
}
