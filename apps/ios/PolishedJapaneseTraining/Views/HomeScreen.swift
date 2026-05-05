import SwiftUI

struct HomeScreen: View {
    @EnvironmentObject private var appState: AppState

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                AppHeader(title: "おはよう!", subtitle: "今日も説明の練習を頑張ろう") {
                    Button {
                        appState.push(.learnedBox)
                    } label: {
                        ZStack(alignment: .topTrailing) {
                            Image(systemName: "archivebox.fill")
                                .font(.title3)
                                .foregroundStyle(.gray)
                                .frame(width: 48, height: 48)
                                .background(Color.gray.opacity(0.12), in: RoundedRectangle(cornerRadius: 16))
                            if appState.unreadLearnedRecordCount > 0 {
                                Text(appState.unreadLearnedRecordCount > 9 ? "9+" : "\(appState.unreadLearnedRecordCount)")
                                    .font(.caption2.bold())
                                    .foregroundStyle(.white)
                                    .frame(width: 20, height: 20)
                                    .background(.red, in: Circle())
                                    .offset(x: 6, y: -6)
                            }
                        }
                    }
                    .buttonStyle(.plain)
                }

                streakCard
                recommendedCard
                continueCard
                weakPointSection
                quickActions
            }
            .padding(.bottom, 32)
        }
        .stableVerticalScroll()
        .background(Color.white)
        .task {
            await appState.loadHome()
        }
    }

    private var streakCard: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Image(systemName: "flame.fill")
                    .font(.largeTitle)
                Text("\(appState.streakDays)日連続")
                    .font(.largeTitle.bold())
                Spacer()
                Image(systemName: "star.fill")
            }
            Text(appState.streakDays > 0 ? "今日も説明練習の流れを続けましょう" : "最初の練習を始めて連続記録を作りましょう")
                .font(.subheadline)
                .foregroundStyle(.white.opacity(0.85))
        }
        .foregroundStyle(.white)
        .padding(24)
        .background(
            LinearGradient(
                colors: [Color.orange.opacity(0.92), Color.orange],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            ),
            in: RoundedRectangle(cornerRadius: 28, style: .continuous)
        )
        .shadow(color: Color.orange.opacity(0.28), radius: 12, y: 7)
        .padding(.horizontal, 24)
    }

    private var recommendedCard: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("今日のおすすめ")
                .font(.headline)
            GradientSoftCard(tint: .green, endTint: .mint) {
                VStack(alignment: .leading, spacing: 14) {
                    HStack(alignment: .top) {
                        VStack(alignment: .leading, spacing: 10) {
                            Pill(text: appState.recommendedTopic.level)
                            Text(appState.recommendedTopic.title)
                                .font(.title3.bold())
                                .foregroundStyle(.primary)
                            Text(appState.recommendReason)
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                        }
                        Spacer(minLength: 12)
                    }
                    HStack(spacing: 8) {
                        InlinePill(text: "⏱️ \(appState.recommendedTopic.estimatedMinutes)分")
                        InlinePill(text: "💬 \(appState.recommendedTopic.tags.first ?? "日常会話")")
                    }
                    PrimaryButton(title: "練習を始める", icon: "play.fill", color: .green) {
                        appState.selectTopic(appState.recommendedTopic)
                        appState.push(.topicDetail)
                    }
                }
            }
        }
        .padding(.horizontal, 24)
    }

    private var continueCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("続きから")
                .font(.headline)
            SoftCard(tint: .blue, cornerRadius: 20, borderWidth: 1) {
                VStack(alignment: .leading, spacing: 12) {
                    HStack(alignment: .firstTextBaseline) {
                        Text(appState.continueTopic?.title ?? "面接での自己紹介")
                            .font(.headline)
                            .foregroundStyle(.primary)
                        Spacer()
                        Text("\(appState.continueProgressPercent)%")
                            .font(.caption.bold())
                            .foregroundStyle(.blue)
                    }
                    progressBar(value: appState.continueProgressPercent)
                    Button {
                        if let continueTopic = appState.continueTopic {
                            appState.selectTopic(continueTopic)
                            appState.push(.topicDetail)
                        } else {
                            appState.push(.topicSelection)
                        }
                    } label: {
                        Text("続ける →")
                            .font(.subheadline.bold())
                            .foregroundStyle(.blue)
                    }
                    .buttonStyle(.plain)
                }
            }
        }
        .padding(.horizontal, 24)
    }

    private func progressBar(value: Int) -> some View {
        GeometryReader { proxy in
            ZStack(alignment: .leading) {
                Capsule()
                    .fill(Color.white)
                Capsule()
                    .fill(Color.blue)
                    .frame(width: proxy.size.width * CGFloat(min(max(value, 0), 100)) / 100)
            }
        }
        .frame(height: 8)
    }

    private var weakPointSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Label("強化ポイント", systemImage: "chart.line.uptrend.xyaxis")
                .font(.headline)
                .foregroundStyle(.primary)
            FlowPills(items: appState.weakPoints)
        }
        .padding(.horizontal, 24)
    }

    private var quickActions: some View {
        HStack(spacing: 14) {
            Button {
                appState.push(.topicSelection)
            } label: {
                quickAction(title: "レベル別練習", subtitle: "初級〜上級", icon: "book.fill", color: .green)
            }
            Button {
                appState.push(.modelList)
            } label: {
                quickAction(title: "説明モデル", subtitle: "お手本を見る", icon: "star.fill", color: .blue)
            }
        }
        .buttonStyle(.plain)
        .padding(.horizontal, 24)
    }

    private func quickAction(title: String, subtitle: String, icon: String, color: Color) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            Image(systemName: icon)
                .foregroundStyle(color)
                .frame(width: 44, height: 44)
                .background(color.opacity(0.14), in: RoundedRectangle(cornerRadius: 14))
            Text(title)
                .font(.subheadline.bold())
            Text(subtitle)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(16)
        .background(Color.white, in: RoundedRectangle(cornerRadius: 20))
        .overlay {
            RoundedRectangle(cornerRadius: 20)
                .stroke(Color.gray.opacity(0.18), lineWidth: 2)
        }
    }
}
