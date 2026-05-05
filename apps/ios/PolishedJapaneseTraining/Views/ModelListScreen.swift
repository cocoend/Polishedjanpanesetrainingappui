import SwiftUI

struct ModelListScreen: View {
    @EnvironmentObject private var appState: AppState

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                AppHeader(title: "説明モデルを選ぶ", subtitle: "話し方の型を使って、わかりやすく伝えよう")

                infoCard

                VStack(spacing: 16) {
                    ForEach(appState.explanationModels) { model in
                        modelCard(model)
                    }
                }
                .padding(.horizontal, 24)
            }
            .padding(.bottom, 32)
        }
        .stableVerticalScroll()
        .background(Color.white)
        .task {
            await appState.loadExplanationModels()
        }
    }

    private var infoCard: some View {
        HStack(alignment: .top, spacing: 12) {
            Image(systemName: "message.fill")
                .font(.headline)
                .foregroundStyle(Color.yellow.opacity(0.85))
                .padding(.top, 2)
            VStack(alignment: .leading, spacing: 4) {
                Text("モデルとは？")
                    .font(.subheadline.bold())
                    .foregroundStyle(.primary)
                Text("説明の「型」です。型に沿って話すことで、初めてのトピックでも整理された説明ができます。")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
        .padding(20)
        .background(Color.yellow.opacity(0.14), in: RoundedRectangle(cornerRadius: 20, style: .continuous))
        .overlay {
            RoundedRectangle(cornerRadius: 20, style: .continuous)
                .stroke(Color.yellow.opacity(0.35), lineWidth: 2)
        }
        .padding(.horizontal, 24)
    }

    private func modelCard(_ model: ExplanationModel) -> some View {
        GradientSoftCard(tint: model.tint, cornerRadius: 28) {
            VStack(alignment: .leading, spacing: 16) {
                HStack(alignment: .top) {
                    Image(systemName: model.iconName)
                        .font(.title2)
                        .foregroundStyle(model.tint)
                        .frame(width: 52, height: 52)
                        .background(model.tint.opacity(0.14), in: RoundedRectangle(cornerRadius: 16))
                    VStack(alignment: .leading, spacing: 4) {
                        Text(model.name)
                            .font(.title3.bold())
                        Text(model.useCase)
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                    Spacer()
                    MoreExplanationButton(color: model.tint) {
                        appState.push(.modelIntro(model.id))
                    }
                }

                Text(model.description)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .fixedSize(horizontal: false, vertical: true)

                VStack(alignment: .leading, spacing: 10) {
                    SectionLabel(text: "構造")
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 8) {
                            ForEach(Array(model.steps.enumerated()), id: \.offset) { index, step in
                                HStack(spacing: 8) {
                                    Text(step)
                                        .font(.caption.bold())
                                        .foregroundStyle(.primary)
                                        .padding(.horizontal, 14)
                                        .padding(.vertical, 9)
                                        .background(.white, in: RoundedRectangle(cornerRadius: 12))
                                        .overlay {
                                            RoundedRectangle(cornerRadius: 12)
                                                .stroke(Color.gray.opacity(0.12), lineWidth: 1)
                                        }
                                    if index < model.steps.count - 1 {
                                        Image(systemName: "chevron.right")
                                            .font(.caption.bold())
                                            .foregroundStyle(.secondary.opacity(0.65))
                                    }
                                }
                            }
                        }
                    }
                }

                VStack(alignment: .leading, spacing: 10) {
                    SectionLabel(text: "特徴")
                    VStack(alignment: .leading, spacing: 9) {
                        ForEach(model.features, id: \.self) { feature in
                            HStack(alignment: .top, spacing: 8) {
                                Text("✓")
                                    .font(.subheadline.bold())
                                    .foregroundStyle(.green)
                                Text(feature)
                                    .font(.subheadline)
                                    .foregroundStyle(.secondary)
                                    .fixedSize(horizontal: false, vertical: true)
                            }
                        }
                    }
                    .padding(16)
                    .background(Color.white, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
                    .overlay {
                        RoundedRectangle(cornerRadius: 16, style: .continuous)
                            .stroke(Color.gray.opacity(0.14), lineWidth: 1)
                    }
                }

                VStack(alignment: .leading, spacing: 10) {
                    SectionLabel(text: "適している説明")
                    LazyVGrid(
                        columns: [GridItem(.adaptive(minimum: 112), spacing: 8, alignment: .leading)],
                        alignment: .leading,
                        spacing: 8
                    ) {
                        ForEach(model.suitableFor, id: \.self) { item in
                            Text(item)
                                .font(.caption.weight(.medium))
                                .foregroundStyle(.secondary)
                                .lineLimit(2)
                                .minimumScaleFactor(0.82)
                                .padding(.horizontal, 12)
                                .padding(.vertical, 9)
                                .frame(maxWidth: .infinity)
                                .background(Color.white, in: Capsule())
                                .overlay {
                                    Capsule()
                                        .stroke(Color.gray.opacity(0.14), lineWidth: 1)
                                }
                        }
                    }
                }

                PrimaryButton(title: "このモデルを使う", color: model.tint) {
                    appState.selectModel(model)
                    appState.push(.topicDetail)
                }
            }
        }
    }
}
