import SwiftUI

struct LoginRequiredScreen: View {
    @EnvironmentObject private var appState: AppState

    let action: ProtectedAction

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                header
                heroCard
                benefitCard
                actionButtons
            }
            .padding(.horizontal, 24)
            .padding(.bottom, 32)
        }
        .stableVerticalScroll()
        .background(
            LinearGradient(
                colors: [Color.white, Color.blue.opacity(0.08)],
                startPoint: .top,
                endPoint: .bottom
            )
        )
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 14) {
            Button {
                appState.continueAsGuest()
            } label: {
                HStack(spacing: 8) {
                    Image(systemName: "chevron.left")
                    Text("戻る")
                        .fontWeight(.medium)
                }
                .foregroundStyle(.secondary)
            }
            .buttonStyle(.plain)

            Text("この機能はログインが必要です")
                .font(.title.bold())
                .foregroundStyle(.primary)
                .frame(maxWidth: .infinity, alignment: .leading)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.top, 20)
    }

    private var heroCard: some View {
        GradientSoftCard(tint: .blue, endTint: .mint) {
            VStack(alignment: .leading, spacing: 16) {
                HStack(spacing: 12) {
                    Image(systemName: "lock.shield.fill")
                        .font(.title2)
                        .foregroundStyle(.blue)
                        .frame(width: 52, height: 52)
                        .background(Color.white, in: RoundedRectangle(cornerRadius: 18, style: .continuous))

                    VStack(alignment: .leading, spacing: 4) {
                        Text(titleText)
                            .font(.headline.bold())
                            .foregroundStyle(.primary)
                        Text("ログインすると記録を安全に残して、あとで見返せます。")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                }

                Text(descriptionText)
                    .font(.subheadline)
                    .foregroundStyle(.primary)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
    }

    private var benefitCard: some View {
        SoftCard(tint: .green, cornerRadius: 24, borderWidth: 2) {
            VStack(alignment: .leading, spacing: 12) {
                SectionLabel(text: "ログインするとできること")

                benefitRow("学んだBOXにフィードバックを保存")
                benefitRow("あとから自分の成長を見返す")
                benefitRow("今後の同期・プロフィール機能に対応")
            }
        }
    }

    private func benefitRow(_ text: String) -> some View {
        HStack(alignment: .top, spacing: 10) {
            Image(systemName: "checkmark.circle.fill")
                .foregroundStyle(.green)
            Text(text)
                .font(.subheadline)
                .foregroundStyle(.primary)
                .fixedSize(horizontal: false, vertical: true)
        }
    }

    private var actionButtons: some View {
        VStack(spacing: 12) {
            PrimaryButton(title: "開発用: ログイン状態にする", icon: "person.crop.circle.badge.checkmark", color: .blue) {
                appState.enablePrototypeLogin()
            }

            PrimaryButton(title: "あとでログインする", icon: "arrow.uturn.backward", color: .gray) {
                appState.continueAsGuest()
            }

            Text("本番のログイン機能は今後接続予定です。現在は受限フロー確認用の仮ログインです。")
                .font(.footnote)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
                .padding(.top, 4)
        }
    }

    private var titleText: String {
        switch action {
        case .saveToLearnedBox:
            return "保存するにはログインが必要です"
        case .openLearnedBox:
            return "Learned Box を開くにはログインが必要です"
        case .deleteMyData:
            return "データ削除にはログインが必要です"
        }
    }

    private var descriptionText: String {
        switch action {
        case .saveToLearnedBox:
            return "保存したフィードバックをあとから確実に見返せるように、ログインしてから Learned Box に保存します。"
        case .openLearnedBox:
            return "Learned Box は保存済みの練習記録をまとめて確認する場所です。個人データに紐づくため、先にログインが必要です。"
        case .deleteMyData:
            return "クラウド上の個人データ削除は本人確認が必要になるため、ログイン後に実行します。"
        }
    }
}
