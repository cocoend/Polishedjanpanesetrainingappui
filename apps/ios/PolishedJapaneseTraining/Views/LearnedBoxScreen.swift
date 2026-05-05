import SwiftUI

struct LearnedBoxScreen: View {
    @EnvironmentObject private var appState: AppState

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                AppHeader(title: "学んだBOX", subtitle: "あなたの学習記録と成長を振り返ろう")

                HStack(spacing: 12) {
                    stat(title: "完了", value: "\(appState.learnedRecords.count)", color: .green)
                    stat(title: "平均", value: "\(averageScore)", color: .blue)
                    stat(title: "未読", value: "\(appState.unreadLearnedRecordCount)", color: .purple)
                }

                ForEach(appState.learnedRecords) { record in
                    learnedRecordCard(record)
                }
            }
            .padding(.horizontal, 24)
            .padding(.bottom, 32)
        }
        .stableVerticalScroll()
        .background(Color.white)
        .task {
            await appState.loadLearnedCards()
        }
    }

    private var averageScore: Int {
        guard !appState.learnedRecords.isEmpty else {
            return 0
        }

        let total = appState.learnedRecords.reduce(0) { $0 + $1.score }
        return total / appState.learnedRecords.count
    }

    private func stat(title: String, value: String, color: Color) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(value)
                .font(.title2.bold())
                .foregroundStyle(.primary)
            Text(title)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(color.opacity(0.10), in: RoundedRectangle(cornerRadius: 18, style: .continuous))
        .overlay {
            RoundedRectangle(cornerRadius: 18, style: .continuous)
                .stroke(color.opacity(0.20), lineWidth: 1)
        }
    }

    private func learnedRecordCard(_ record: LearnedRecord) -> some View {
        Button {
            appState.openLearnedRecord(record)
        } label: {
            GradientSoftCard(tint: .green, cornerRadius: 24) {
                VStack(alignment: .leading, spacing: 14) {
                    HStack(alignment: .center) {
                        Pill(text: record.level)
                        Text(record.modelName)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                        Spacer()
                        Text("\(record.score)/100")
                            .font(.headline.bold())
                            .foregroundStyle(.green)
                    }

                    Text(record.title)
                        .font(.headline.bold())
                        .foregroundStyle(.primary)
                        .frame(maxWidth: .infinity, alignment: .leading)

                    HStack(spacing: 8) {
                        Text(record.savedDate)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                        if !record.isRead {
                            Text("NEW")
                                .font(.caption2.bold())
                                .foregroundStyle(.white)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 4)
                                .background(.red, in: Capsule())
                        }
                    }

                    HStack(spacing: 6) {
                        Text("詳細を見る")
                            .font(.subheadline.bold())
                        Image(systemName: "chevron.right")
                            .font(.caption.bold())
                    }
                    .foregroundStyle(.green)
                }
            }
        }
        .buttonStyle(.plain)
    }
}
