import SwiftUI

struct SettingsScreen: View {
    @EnvironmentObject private var appState: AppState
    @AppStorage("polished.dailyReminderEnabled") private var dailyReminderEnabled = true
    @AppStorage("polished.notificationsEnabled") private var notificationsEnabled = true
    @State private var microphonePermissionGranted = true
    @State private var showOnboardingResetAlert = false

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                header
                accountSection
                practiceSection
                permissionsSection
                helpSection
                privacySection
                appInfoSection
            }
            .padding(.horizontal, 24)
            .padding(.bottom, 32)
        }
        .stableVerticalScroll()
        .background(Color.white)
        .task {
            microphonePermissionGranted = await AudioRecorder.microphonePermissionGranted()
        }
        .alert("ようこそ画面は未実装です", isPresented: $showOnboardingResetAlert) {
            Button("OK", role: .cancel) {}
        } message: {
            Text("onboarding 実装後に、ここから再表示できるように接続します。")
        }
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 14) {
            Button {
                appState.pop()
            } label: {
                HStack(spacing: 8) {
                    Image(systemName: "chevron.left")
                    Text("戻る")
                        .fontWeight(.medium)
                }
                .foregroundStyle(.secondary)
            }
            .buttonStyle(.plain)

            Text("設定")
                .font(.title.bold())
                .foregroundStyle(.primary)
                .frame(maxWidth: .infinity, alignment: .leading)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.top, 20)
    }

    private var accountSection: some View {
        settingsSection(title: "アカウント") {
            settingsButtonRow(
                icon: "person.fill",
                iconTint: .gray,
                title: "ログインしていません",
                subtitle: "ログイン機能は今後追加予定です",
                trailingSystemName: "arrow.right.circle"
            ) {}
        }
    }

    private var practiceSection: some View {
        settingsSection(title: "練習設定") {
            VStack(spacing: 0) {
                settingsButtonRow(
                    title: "日本語レベル",
                    subtitle: "N3（中級）",
                    trailingSystemName: "chevron.right"
                ) {}

                divider

                settingsButtonRow(
                    title: "学習目標",
                    subtitle: "面接・仕事",
                    trailingSystemName: "chevron.right"
                ) {}

                divider

                settingsToggleRow(
                    icon: "bell.fill",
                    title: "毎日のリマインダー",
                    subtitle: "20:00",
                    isOn: $dailyReminderEnabled
                )
            }
        }
    }

    private var permissionsSection: some View {
        settingsSection(title: "権限") {
            VStack(spacing: 0) {
                HStack(spacing: 12) {
                    Image(systemName: "mic.fill")
                        .foregroundStyle(.gray)
                        .frame(width: 28)

                    VStack(alignment: .leading, spacing: 4) {
                        Text("マイク権限")
                            .font(.subheadline.bold())
                        Text(microphonePermissionGranted ? "許可済み" : "未許可")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }

                    Spacer()

                    Text(microphonePermissionGranted ? "有効" : "無効")
                        .font(.caption.bold())
                        .foregroundStyle(microphonePermissionGranted ? .green : .red)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 6)
                        .background((microphonePermissionGranted ? Color.green : Color.red).opacity(0.12), in: Capsule())
                }
                .padding(.vertical, 18)
                .padding(.horizontal, 18)

                divider

                settingsToggleRow(
                    icon: "bell.badge.fill",
                    title: "通知",
                    subtitle: notificationsEnabled ? "通知を受け取る" : "通知はオフ",
                    isOn: $notificationsEnabled
                )
            }
        }
    }

    private var helpSection: some View {
        settingsSection(title: "ヘルプ") {
            VStack(spacing: 0) {
                settingsButtonRow(
                    icon: "sparkles",
                    title: "ようこそ画面を再表示",
                    trailingSystemName: "chevron.right"
                ) {
                    showOnboardingResetAlert = true
                }

                divider

                settingsButtonRow(
                    icon: "questionmark.circle.fill",
                    title: "使い方ガイド",
                    subtitle: "準備中",
                    trailingSystemName: "chevron.right"
                ) {}

                divider

                settingsButtonRow(
                    icon: "book.fill",
                    title: "説明モデルについて",
                    trailingSystemName: "chevron.right"
                ) {
                    appState.push(.modelList)
                }
            }
        }
    }

    private var privacySection: some View {
        settingsSection(title: "プライバシー") {
            VStack(spacing: 0) {
                settingsButtonRow(
                    icon: "shield.fill",
                    title: "利用規約",
                    subtitle: "準備中",
                    trailingSystemName: "chevron.right"
                ) {}

                divider

                settingsButtonRow(
                    icon: "hand.raised.fill",
                    title: "プライバシーポリシー",
                    subtitle: "準備中",
                    trailingSystemName: "chevron.right"
                ) {}
            }
        }
    }

    private var appInfoSection: some View {
        VStack(spacing: 4) {
            Text("バージョン \(appVersion)")
            Text("© 2026 Explain Japanese")
        }
        .font(.footnote)
        .foregroundStyle(.secondary)
        .padding(.top, 6)
        .padding(.bottom, 12)
    }

    private func settingsSection<Content: View>(title: String, @ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            Text(title)
                .font(.caption.bold())
                .foregroundStyle(.secondary)
                .textCase(.uppercase)

            VStack(spacing: 0) {
                content()
            }
            .background(Color.white, in: RoundedRectangle(cornerRadius: 22, style: .continuous))
            .overlay {
                RoundedRectangle(cornerRadius: 22, style: .continuous)
                    .stroke(Color.gray.opacity(0.18), lineWidth: 2)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private func settingsButtonRow(
        icon: String? = nil,
        iconTint: Color = .gray,
        title: String,
        subtitle: String? = nil,
        trailingSystemName: String,
        action: @escaping () -> Void
    ) -> some View {
        Button(action: action) {
            HStack(spacing: 12) {
                if let icon {
                    Image(systemName: icon)
                        .foregroundStyle(iconTint)
                        .frame(width: 28)
                }

                VStack(alignment: .leading, spacing: 4) {
                    Text(title)
                        .font(.subheadline.bold())
                        .foregroundStyle(.primary)
                    if let subtitle {
                        Text(subtitle)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }

                Spacer()

                Image(systemName: trailingSystemName)
                    .foregroundStyle(.gray.opacity(0.8))
            }
            .padding(.vertical, 18)
            .padding(.horizontal, 18)
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
    }

    private func settingsToggleRow(
        icon: String,
        title: String,
        subtitle: String? = nil,
        isOn: Binding<Bool>
    ) -> some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .foregroundStyle(.gray)
                .frame(width: 28)

            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.subheadline.bold())
                if let subtitle {
                    Text(subtitle)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }

            Spacer()

            Toggle("", isOn: isOn)
                .labelsHidden()
                .tint(.green)
        }
        .padding(.vertical, 18)
        .padding(.horizontal, 18)
    }

    private var divider: some View {
        Rectangle()
            .fill(Color.gray.opacity(0.16))
            .frame(height: 1)
            .padding(.horizontal, 18)
    }

    private var appVersion: String {
        let version = Bundle.main.object(forInfoDictionaryKey: "CFBundleShortVersionString") as? String ?? "1.0.0"
        let build = Bundle.main.object(forInfoDictionaryKey: "CFBundleVersion") as? String ?? "1"
        return "\(version) (\(build))"
    }
}
