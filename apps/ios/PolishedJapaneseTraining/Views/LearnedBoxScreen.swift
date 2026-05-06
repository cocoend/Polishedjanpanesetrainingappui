import SwiftUI

struct LearnedBoxScreen: View {
    @EnvironmentObject private var appState: AppState
    @State private var filter: LearnedBoxFilter = .all

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                header
                statsSection
                filterSection
                recordsSection
            }
            .padding(.bottom, 32)
        }
        .stableVerticalScroll()
        .background(Color.white)
        .task {
            await appState.loadLearnedCards()
        }
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 0) {
            Button {
                appState.goHome()
            } label: {
                HStack(spacing: 8) {
                    Image(systemName: "chevron.left")
                        .font(.subheadline.bold())
                    Text("戻る")
                        .font(.subheadline.weight(.medium))
                }
                .foregroundStyle(.secondary)
            }
            .buttonStyle(.plain)
            .padding(.bottom, 16)

            Text("学んだBOX")
                .font(.title.bold())
                .foregroundStyle(.primary)
                .padding(.bottom, 4)

            Text("あなたの学習記録と成長を振り返ろう")
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.horizontal, 24)
        .padding(.top, 20)
        .padding(.bottom, 20)
        .background(Color.white)
        .overlay(alignment: .bottom) {
            Rectangle()
                .fill(Color.gray.opacity(0.10))
                .frame(height: 1)
        }
    }

    private var statsSection: some View {
        HStack(spacing: 12) {
            summaryCard(
                title: "完了した練習",
                value: "\(appState.learnedRecords.count)",
                icon: "rosette",
                tint: .green,
                startColor: Color.green.opacity(0.12),
                endColor: Color.mint.opacity(0.10)
            )
            summaryCard(
                title: "平均スコア",
                value: "\(averageScore)",
                icon: "chart.line.uptrend.xyaxis",
                tint: .blue,
                startColor: Color.blue.opacity(0.12),
                endColor: Color.cyan.opacity(0.10)
            )
            summaryCard(
                title: "総試行回数",
                value: "\(totalAttempts)",
                icon: "play.fill",
                tint: .purple,
                startColor: Color.purple.opacity(0.12),
                endColor: Color.indigo.opacity(0.10)
            )
        }
        .padding(.horizontal, 24)
        .padding(.top, 24)
        .padding(.bottom, 18)
    }

    private var filterSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 8) {
                Image(systemName: "line.3.horizontal.decrease.circle")
                    .font(.caption.bold())
                    .foregroundStyle(.secondary)
                Text("表示")
                    .font(.caption.bold())
                    .foregroundStyle(.secondary)
                    .textCase(.uppercase)
            }

            HStack(spacing: 8) {
                ForEach(LearnedBoxFilter.allCases) { item in
                    filterButton(item)
                }
            }
        }
        .padding(.horizontal, 24)
        .padding(.bottom, 18)
    }

    private var recordsSection: some View {
        VStack(spacing: 12) {
            if filteredRecords.isEmpty {
                emptyState
            } else {
                ForEach(filteredRecords) { record in
                    learnedRecordCard(record)
                }
            }
        }
        .padding(.horizontal, 24)
    }

    private var averageScore: Int {
        guard !appState.learnedRecords.isEmpty else {
            return 0
        }

        let total = appState.learnedRecords.reduce(0) { $0 + $1.score }
        return total / appState.learnedRecords.count
    }

    private var totalAttempts: Int {
        filteredOrAllRecords.reduce(0) { $0 + attemptCount(for: $1) }
    }

    private var filteredRecords: [LearnedRecord] {
        switch filter {
        case .all:
            return appState.learnedRecords
        case .recent:
            return appState.learnedRecords.sorted { $0.savedDate > $1.savedDate }
        case .high:
            return appState.learnedRecords
                .filter { $0.score >= 85 }
                .sorted { $0.score > $1.score }
        }
    }

    private var filteredOrAllRecords: [LearnedRecord] {
        filteredRecords.isEmpty ? appState.learnedRecords : filteredRecords
    }

    private func summaryCard(
        title: String,
        value: String,
        icon: String,
        tint: Color,
        startColor: Color,
        endColor: Color
    ) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            Image(systemName: icon)
                .font(.title3.weight(.semibold))
                .foregroundStyle(tint)

            Text(value)
                .font(.system(size: 28, weight: .bold, design: .rounded))
                .foregroundStyle(.primary)

            Text(title)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(16)
        .background(
            LinearGradient(
                colors: [startColor, endColor],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            ),
            in: RoundedRectangle(cornerRadius: 22, style: .continuous)
        )
        .overlay {
            RoundedRectangle(cornerRadius: 22, style: .continuous)
                .stroke(tint.opacity(0.18), lineWidth: 2)
        }
    }

    private func filterButton(_ item: LearnedBoxFilter) -> some View {
        Button {
            filter = item
        } label: {
            Text(item.title)
                .font(.subheadline.weight(.medium))
                .foregroundStyle(filter == item ? .white : .primary)
                .padding(.horizontal, 16)
                .padding(.vertical, 10)
                .background(
                    filter == item ? Color.green : Color.gray.opacity(0.10),
                    in: Capsule()
                )
                .shadow(color: filter == item ? Color.green.opacity(0.22) : .clear, radius: 8, y: 4)
        }
        .buttonStyle(.plain)
    }

    private func learnedRecordCard(_ record: LearnedRecord) -> some View {
        Button {
            appState.openLearnedRecord(record)
        } label: {
            VStack(alignment: .leading, spacing: 14) {
                HStack(alignment: .top, spacing: 12) {
                    VStack(alignment: .leading, spacing: 8) {
                        HStack(spacing: 8) {
                            Pill(text: record.level, color: levelColor(for: record.level))
                            Text(record.modelName)
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }

                        Text(record.title)
                            .font(.headline.bold())
                            .foregroundStyle(.primary)
                            .multilineTextAlignment(.leading)

                        HStack(spacing: 6) {
                            Image(systemName: "calendar")
                                .font(.caption)
                            Text(record.savedDate)
                                .font(.caption)
                        }
                        .foregroundStyle(.secondary)
                    }

                    Spacer(minLength: 12)

                    VStack(alignment: .trailing, spacing: 4) {
                        HStack(alignment: .lastTextBaseline, spacing: 2) {
                            Text("\(record.score)")
                                .font(.system(size: 28, weight: .bold, design: .rounded))
                                .foregroundStyle(.green)
                            Text("/100")
                                .font(.caption)
                                .foregroundStyle(.green.opacity(0.8))
                        }
                        .padding(.horizontal, 12)
                        .padding(.vertical, 8)
                        .background(Color.green.opacity(0.10), in: RoundedRectangle(cornerRadius: 14, style: .continuous))

                        if improvement(for: record) > 0 {
                            HStack(spacing: 4) {
                                Image(systemName: "chart.line.uptrend.xyaxis")
                                    .font(.caption2)
                                Text("+\(improvement(for: record))")
                                    .font(.caption.bold())
                            }
                            .foregroundStyle(.green)
                        }
                    }
                }

                FlowTagRow(tags: tags(for: record))

                HStack {
                    Text("試行回数: ")
                        .font(.subheadline)
                        .foregroundStyle(.secondary) +
                    Text("\(attemptCount(for: record))回")
                        .font(.subheadline.bold())
                        .foregroundStyle(.primary)

                    Spacer()

                    HStack(spacing: 4) {
                        Text("詳細を見る")
                            .font(.subheadline.bold())
                        Image(systemName: "chevron.right")
                            .font(.caption.bold())
                    }
                    .foregroundStyle(.green)
                }
                .padding(.top, 14)
                .overlay(alignment: .top) {
                    Rectangle()
                        .fill(Color.gray.opacity(0.14))
                        .frame(height: 1)
                }
            }
            .padding(20)
            .background(Color.white, in: RoundedRectangle(cornerRadius: 22, style: .continuous))
            .overlay {
                RoundedRectangle(cornerRadius: 22, style: .continuous)
                    .stroke(Color.gray.opacity(0.18), lineWidth: 2)
            }
            .shadow(color: Color.green.opacity(0.06), radius: 10, y: 4)
        }
        .buttonStyle(.plain)
    }

    private var emptyState: some View {
        VStack(spacing: 16) {
            ZStack {
                Circle()
                    .fill(Color.gray.opacity(0.10))
                    .frame(width: 80, height: 80)
                Image(systemName: "rosette")
                    .font(.system(size: 34, weight: .semibold))
                    .foregroundStyle(.gray.opacity(0.7))
            }

            VStack(spacing: 8) {
                Text("まだ記録がありません")
                    .font(.headline.bold())
                Text("練習を完了すると、ここに記録が保存されます")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
            }

            PrimaryButton(title: "練習を始める", color: .green) {
                appState.goHome()
            }
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 40)
    }

    private func levelColor(for level: String) -> Color {
        switch level {
        case "初級":
            return .green
        case "中級":
            return .blue
        case "上級":
            return .purple
        default:
            return .green
        }
    }

    private func attemptCount(for record: LearnedRecord) -> Int {
        max(1, record.feedback.improvements.prefix(3).count)
    }

    private func improvement(for record: LearnedRecord) -> Int {
        let base = max(0, 70 - record.feedback.improvements.count * 6)
        return max(0, record.score - base)
    }

    private func tags(for record: LearnedRecord) -> [String] {
        var values: [String] = []

        if !record.feedback.strengths.isEmpty {
            values.append(record.feedback.strengths[0].tagLabel)
        }

        values.append(contentsOf: record.feedback.improvements.prefix(2).map(\.tagLabel))

        if values.isEmpty {
            values = [record.level, record.modelName]
        }

        return Array(values.prefix(3))
    }
}

private enum LearnedBoxFilter: String, CaseIterable, Identifiable {
    case all
    case recent
    case high

    var id: String { rawValue }

    var title: String {
        switch self {
        case .all:
            return "すべて"
        case .recent:
            return "最近の練習"
        case .high:
            return "高得点"
        }
    }
}

private struct FlowTagRow: View {
    let tags: [String]

    var body: some View {
        HStack(spacing: 8) {
            ForEach(tags, id: \.self) { tag in
                Text(tag)
                    .font(.caption.weight(.medium))
                    .foregroundStyle(.primary)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 7)
                    .background(Color.gray.opacity(0.10), in: Capsule())
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

private extension String {
    var tagLabel: String {
        let separators = CharacterSet(charactersIn: "。、「」,， ")
        let trimmed = components(separatedBy: separators).first { !$0.isEmpty } ?? self
        return String(trimmed.prefix(8))
    }
}
