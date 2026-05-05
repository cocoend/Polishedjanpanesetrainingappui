import SwiftUI

struct TopicSelectionScreen: View {
    @EnvironmentObject private var appState: AppState
    @State private var selectedLevel = "初級"
    @State private var selectedCategory = "all"

    private let levels = ["初級", "中級", "上級"]
    private let categories: [TopicCategory] = [
        TopicCategory(id: "all", label: "すべて", icon: nil),
        TopicCategory(id: "object", label: "モノ説明", icon: "cup.and.saucer.fill"),
        TopicCategory(id: "process", label: "手順説明", icon: "message.fill"),
        TopicCategory(id: "comparison", label: "比較", icon: nil),
        TopicCategory(id: "work", label: "仕事/面接", icon: "briefcase.fill")
    ]

    private var filteredTopics: [PracticeTopic] {
        appState.topics.filter { topic in
            topic.level == selectedLevel &&
            (selectedCategory == "all" || topic.category == selectedCategory)
        }
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                AppHeader(title: "練習トピックを選ぶ", subtitle: "レベルとカテゴリーから選ぼう")
                levelTabs
                    .padding(.horizontal, 24)
                    .padding(.top, 4)
                    .padding(.bottom, 14)
                categoryChips
                    .padding(.bottom, 14)
                topicList
                    .padding(.horizontal, 24)
                    .padding(.bottom, 32)
            }
        }
        .stableVerticalScroll()
        .background(Color.white)
        .navigationBarBackButtonHidden(false)
        .task {
            await appState.loadTopics()
        }
    }

    private var levelTabs: some View {
        HStack(spacing: 4) {
            ForEach(levels, id: \.self) { level in
                Button {
                    selectedLevel = level
                } label: {
                    Text(level)
                        .font(.subheadline.bold())
                        .foregroundStyle(selectedLevel == level ? .primary : .secondary)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                        .background(
                            selectedLevel == level ? Color.white : Color.clear,
                            in: RoundedRectangle(cornerRadius: 14, style: .continuous)
                        )
                        .shadow(
                            color: selectedLevel == level ? Color.black.opacity(0.12) : .clear,
                            radius: 7,
                            y: 3
                        )
                }
                .buttonStyle(.plain)
            }
        }
        .padding(4)
        .background(Color.gray.opacity(0.12), in: RoundedRectangle(cornerRadius: 18, style: .continuous))
    }

    private var categoryChips: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(categories) { category in
                    Button {
                        selectedCategory = category.id
                    } label: {
                        HStack(spacing: 6) {
                            if let icon = category.icon {
                                Image(systemName: icon)
                                    .font(.caption)
                            }
                            Text(category.label)
                                .font(.subheadline.weight(.medium))
                        }
                        .foregroundStyle(selectedCategory == category.id ? .white : .primary)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 10)
                        .background(
                            selectedCategory == category.id ? Color.green : Color.gray.opacity(0.12),
                            in: Capsule()
                        )
                        .shadow(
                            color: selectedCategory == category.id ? Color.green.opacity(0.25) : .clear,
                            radius: 7,
                            y: 3
                        )
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.horizontal, 24)
        }
    }

    private var topicList: some View {
        VStack(spacing: 16) {
            ForEach(filteredTopics) { topic in
                topicCard(topic)
            }

            if filteredTopics.isEmpty {
                Text("このカテゴリーにはトピックがありません")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 48)
            }
        }
    }

    private func topicCard(_ topic: PracticeTopic) -> some View {
        GradientSoftCard(tint: topic.tint, cornerRadius: 28) {
            VStack(alignment: .leading, spacing: 14) {
                HStack(alignment: .top) {
                    VStack(alignment: .leading, spacing: 8) {
                        HStack(spacing: 8) {
                            Pill(text: topic.level, color: topic.tint)
                            Text(topic.difficultyStars)
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                        Text(topic.title)
                            .font(.headline.bold())
                            .foregroundStyle(.primary)
                        Text(topic.description)
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                    Spacer(minLength: 12)
                }

                HStack(spacing: 8) {
                    InlinePill(text: "⏱ \(topic.estimatedMinutes)分")
                    ForEach(topic.tags, id: \.self) { tag in
                        InlinePill(text: tag)
                    }
                }

                PrimaryButton(title: "この練習を始める", color: .black) {
                    appState.selectTopic(topic)
                    appState.push(.topicDetail)
                }
            }
        }
    }
}

private struct TopicCategory: Identifiable {
    let id: String
    let label: String
    let icon: String?
}
