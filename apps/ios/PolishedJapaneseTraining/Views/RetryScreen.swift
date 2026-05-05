import SwiftUI

struct RetryScreen: View {
    @EnvironmentObject private var appState: AppState

    private var focusPoints: [String] {
        let points = appState.latestFeedback.improvements
        return points.isEmpty
            ? ["前回の改善ポイントをもう一度意識してみましょう。", "最後に一文でまとめを入れてみましょう。"]
            : points
    }

    var body: some View {
        ZStack(alignment: .bottom) {
            LinearGradient(
                colors: [.white, Color.green.opacity(0.08)],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()

            ScrollView {
                VStack(alignment: .leading, spacing: 22) {
                    AppHeader(
                        title: "もう一度挑戦しよう！",
                        subtitle: "今回は特にこの2つを意識してみましょう"
                    )
                    .padding(.horizontal, -24)

                    EncouragementCard()

                    FocusPointsSection(points: Array(focusPoints.prefix(2)), example: appState.latestFeedback.improvedExample)

                    PreviousAnswerSection(transcript: appState.latestTranscript)

                    ModelReferenceButton(model: appState.selectedModel) {
                        appState.push(.modelIntro(appState.selectedModel.id))
                    }

                    QuickTipsCard()

                    Color.clear.frame(height: 118)
                }
                .padding(.horizontal, 24)
                .padding(.bottom, 24)
            }
            .stableVerticalScroll()

            BottomRetryActions(
                onRecord: {
                    appState.push(.recording)
                },
                onFeedback: {
                    appState.pop()
                }
            )
        }
        .navigationBarTitleDisplayMode(.inline)
    }
}

private struct EncouragementCard: View {
    var body: some View {
        GradientSoftCard(tint: .yellow, endTint: .orange) {
            HStack(alignment: .top, spacing: 14) {
                Image(systemName: "sparkles")
                    .font(.title3.bold())
                    .foregroundStyle(.white)
                    .frame(width: 42, height: 42)
                    .background(Color.yellow, in: RoundedRectangle(cornerRadius: 14, style: .continuous))

                VStack(alignment: .leading, spacing: 8) {
                    Text("前回より確実に良くなります！")
                        .font(.headline)
                        .foregroundStyle(.primary)
                    Text("最初の説明はとても良かったです。今回は少しだけ修正して、さらに上達しましょう。")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .fixedSize(horizontal: false, vertical: true)
                }
            }
        }
    }
}

private struct FocusPointsSection: View {
    let points: [String]
    let example: String

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 8) {
                Image(systemName: "target")
                    .foregroundStyle(.green)
                SectionLabel(text: "今回の改善ポイント")
            }

            VStack(spacing: 12) {
                ForEach(Array(points.enumerated()), id: \.offset) { index, point in
                    FocusPointCard(
                        index: index + 1,
                        title: index == 0 ? "言い方を整える" : "まとめを追加する",
                        point: point,
                        example: index == 0 ? firstExample : secondExample,
                        color: index == 0 ? .red : .blue
                    )
                }
            }
        }
    }

    private var exampleSentences: [String] {
        example
            .split(separator: "。")
            .map { String($0).trimmingCharacters(in: .whitespacesAndNewlines) }
            .filter { !$0.isEmpty }
    }

    private var firstExample: String {
        exampleSentences.first.map { "\($0)。" } ?? "画面を指で触れて操作します"
    }

    private var secondExample: String {
        if exampleSentences.count > 1 {
            return "\(exampleSentences[1])。"
        }
        return "このように、日常生活で使える便利な道具です。"
    }
}

private struct FocusPointCard: View {
    let index: Int
    let title: String
    let point: String
    let example: String
    let color: Color

    var body: some View {
        SoftCard(tint: color, cornerRadius: 22) {
            HStack(alignment: .top, spacing: 14) {
                Text("\(index)")
                    .font(.subheadline.bold())
                    .foregroundStyle(.white)
                    .frame(width: 28, height: 28)
                    .background(color, in: RoundedRectangle(cornerRadius: 9, style: .continuous))

                VStack(alignment: .leading, spacing: 12) {
                    VStack(alignment: .leading, spacing: 6) {
                        Text(title)
                            .font(.headline)
                            .foregroundStyle(.primary)
                        Text(point)
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                            .fixedSize(horizontal: false, vertical: true)
                    }

                    VStack(alignment: .leading, spacing: 6) {
                        Text(index == 1 ? "こう言ってみよう:" : "例:")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                        Text(example)
                            .font(.subheadline.weight(.semibold))
                            .foregroundStyle(.primary)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 5)
                            .background(Color.green.opacity(0.18), in: RoundedRectangle(cornerRadius: 8, style: .continuous))
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(12)
                    .background(.white, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
                    .overlay {
                        RoundedRectangle(cornerRadius: 14, style: .continuous)
                            .stroke(color.opacity(0.14), lineWidth: 1)
                    }
                }
            }
        }
    }
}

private struct PreviousAnswerSection: View {
    let transcript: String

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            SectionLabel(text: "前回の回答")

            SoftCard(tint: .gray, cornerRadius: 20, borderWidth: 1) {
                Text(transcript)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .lineSpacing(4)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
    }
}

private struct ModelReferenceButton: View {
    let model: ExplanationModel
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 14) {
                Image(systemName: "book.fill")
                    .font(.title3)
                    .foregroundStyle(.blue)
                    .frame(width: 34, height: 34)
                    .background(Color.blue.opacity(0.12), in: RoundedRectangle(cornerRadius: 11, style: .continuous))

                VStack(alignment: .leading, spacing: 3) {
                    Text("\(model.name)を確認")
                        .font(.headline)
                        .foregroundStyle(.primary)
                    Text("構造をもう一度見る")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                Spacer()

                HStack(spacing: 4) {
                    Text("開く")
                    Image(systemName: "arrow.right")
                }
                .font(.subheadline.bold())
                .foregroundStyle(.blue)
            }
            .padding(20)
            .background(Color.blue.opacity(0.10), in: RoundedRectangle(cornerRadius: 22, style: .continuous))
            .overlay {
                RoundedRectangle(cornerRadius: 22, style: .continuous)
                    .stroke(Color.blue.opacity(0.24), lineWidth: 2)
            }
        }
        .buttonStyle(.plain)
    }
}

private struct QuickTipsCard: View {
    private let tips = [
        "前回の説明をベースに、2つのポイントだけ直せばOK",
        "完璧にしようとしなくて大丈夫です",
        "リラックスして、自然に話しましょう"
    ]

    var body: some View {
        SoftCard(tint: .purple, cornerRadius: 22) {
            HStack(alignment: .top, spacing: 12) {
                Image(systemName: "lightbulb.fill")
                    .font(.title3)
                    .foregroundStyle(.purple)

                VStack(alignment: .leading, spacing: 10) {
                    Text("ちょっとしたコツ")
                        .font(.headline)
                        .foregroundStyle(.primary)

                    VStack(alignment: .leading, spacing: 7) {
                        ForEach(tips, id: \.self) { tip in
                            HStack(alignment: .top, spacing: 8) {
                                Text("•")
                                Text(tip)
                                    .fixedSize(horizontal: false, vertical: true)
                            }
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                        }
                    }
                }
            }
        }
    }
}

private struct BottomRetryActions: View {
    let onRecord: () -> Void
    let onFeedback: () -> Void

    var body: some View {
        VStack(spacing: 12) {
            PrimaryButton(title: "録音を開始する", icon: "mic.fill", color: .green, action: onRecord)

            Button("フィードバックをもう一度見る", action: onFeedback)
                .font(.subheadline.bold())
                .foregroundStyle(.secondary)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 8)
                .buttonStyle(.plain)
        }
        .padding(.horizontal, 24)
        .padding(.top, 18)
        .padding(.bottom, 10)
        .background(
            LinearGradient(
                colors: [.clear, Color.green.opacity(0.08), Color.green.opacity(0.08)],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea(edges: .bottom)
        )
    }
}
