import SwiftUI

struct ModelIntroScreen: View {
    @EnvironmentObject private var appState: AppState

    let modelID: ExplanationModel.ID

    private var intro: ModelIntroContent {
        ModelIntroContent.content(for: modelID)
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                header
                VStack(spacing: 16) {
                    introductionCard
                    stepCards
                    finalImageCard
                }
                .padding(.horizontal, 24)
                .padding(.top, 24)
                .padding(.bottom, 112)
            }
        }
        .stableVerticalScroll()
        .background(Color.white)
        .safeAreaInset(edge: .bottom) {
            bottomAction
        }
        .task {
            await appState.loadExplanationModels()
        }
    }

    private var header: some View {
        HStack(alignment: .center, spacing: 12) {
            Image(systemName: intro.iconName)
                .font(.title2)
                .foregroundStyle(intro.tint)
                .frame(width: 52, height: 52)
                .background(intro.tint.opacity(0.14), in: RoundedRectangle(cornerRadius: 18, style: .continuous))
            Text(intro.title)
                .font(.title2.bold())
                .foregroundStyle(.primary)
                .fixedSize(horizontal: false, vertical: true)
            Spacer()
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

    private var introductionCard: some View {
        GradientSoftCard(tint: intro.tint, cornerRadius: 28) {
            VStack(alignment: .leading, spacing: 16) {
                Text(intro.intro)
                    .font(.body)
                    .foregroundStyle(.primary)
                    .fixedSize(horizontal: false, vertical: true)

                VStack(spacing: 8) {
                    Text(intro.formula)
                        .font(.title2.bold())
                        .foregroundStyle(.primary)
                        .multilineTextAlignment(.center)
                    Text(intro.formulaDetail)
                        .font(.subheadline.weight(.medium))
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                }
                .frame(maxWidth: .infinity)
                .padding(16)
                .background(Color.white, in: RoundedRectangle(cornerRadius: 18, style: .continuous))

                Text(intro.summary)
                    .font(.body)
                    .foregroundStyle(.primary)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
    }

    private var stepCards: some View {
        VStack(spacing: 16) {
            ForEach(intro.steps) { step in
                VStack(alignment: .leading, spacing: 14) {
                    HStack(spacing: 12) {
                        Text(step.number)
                            .font(.headline.bold())
                            .foregroundStyle(.white)
                            .frame(width: 40, height: 40)
                            .background(intro.tint.gradient, in: RoundedRectangle(cornerRadius: 12, style: .continuous))
                        Text(step.title)
                            .font(.headline.bold())
                            .foregroundStyle(.primary)
                        Spacer()
                    }

                    Text(step.description)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .fixedSize(horizontal: false, vertical: true)

                    if !step.expressions.isEmpty {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("よく使う表現")
                                .font(.subheadline.bold())
                                .foregroundStyle(.primary)
                            ForEach(step.expressions, id: \.self) { expression in
                                HStack(alignment: .top, spacing: 8) {
                                    Text("•")
                                        .foregroundStyle(.blue)
                                    Text(expression)
                                        .font(.subheadline)
                                        .foregroundStyle(.secondary)
                                }
                            }
                        }
                        .padding(16)
                        .background(Color.blue.opacity(0.10), in: RoundedRectangle(cornerRadius: 14, style: .continuous))
                    }

                    Text("💡 コツ：\(step.tip)")
                        .font(.subheadline)
                        .foregroundStyle(.primary)
                        .padding(12)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(Color.yellow.opacity(0.14), in: RoundedRectangle(cornerRadius: 12, style: .continuous))
                        .overlay {
                            RoundedRectangle(cornerRadius: 12, style: .continuous)
                                .stroke(Color.yellow.opacity(0.34), lineWidth: 1)
                        }
                }
                .padding(20)
                .background(Color.white, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
                .overlay {
                    RoundedRectangle(cornerRadius: 20, style: .continuous)
                        .stroke(Color.gray.opacity(0.18), lineWidth: 2)
                }
            }
        }
    }

    private var finalImageCard: some View {
        VStack(spacing: 12) {
            Text("イメージ")
                .font(.headline.bold())
            Text(intro.finalImage)
                .font(.title3.weight(.semibold))
                .multilineTextAlignment(.center)
                .fixedSize(horizontal: false, vertical: true)
        }
        .foregroundStyle(.white)
        .frame(maxWidth: .infinity)
        .padding(24)
        .background(intro.tint.gradient, in: RoundedRectangle(cornerRadius: 28, style: .continuous))
        .shadow(color: intro.tint.opacity(0.28), radius: 12, y: 7)
    }

    private var bottomAction: some View {
        PrimaryButton(title: "戻る", color: intro.tint) {
            appState.pop()
        }
        .padding(.horizontal, 24)
        .padding(.top, 14)
        .padding(.bottom, 12)
        .background(Color.white)
        .overlay(alignment: .top) {
            Rectangle()
                .fill(Color.gray.opacity(0.12))
                .frame(height: 1)
        }
    }
}

private struct ModelIntroContent {
    let title: String
    let iconName: String
    let tint: Color
    let intro: String
    let formula: String
    let formulaDetail: String
    let summary: String
    let steps: [ModelIntroStep]
    let finalImage: String

    static func content(for id: String) -> ModelIntroContent {
        switch id {
        case "prep":
            return prep
        case "scqa":
            return scqa
        default:
            return stepByStep
        }
    }

    private static let prep = ModelIntroContent(
        title: "PREP法ってなに？",
        iconName: "checkmark.circle.fill",
        tint: .green,
        intro: "話がうまくまとまる、4ステップの型です。\n話す順番はこれだけです。",
        formula: "P → R → E → P",
        formulaDetail: "結論 → 理由 → 例 → まとめ",
        summary: "先に答えを言って、理由を言って、例を出して、最後にもう一回まとめる\nこれだけで、ぐっと伝わりやすくなります。",
        steps: [
            ModelIntroStep(number: "1", title: "Point（結論）", description: "まずは何を言いたいかを先に言いましょう。\n最初に結論を言うと、相手が話を追いやすくなります。", expressions: ["私は〜だと思います。", "結論から言うと、〜です。", "〜が大切だと思います。"], tip: "だらだら前置きしないで、先に答えをポン！と出す感じです。"),
            ModelIntroStep(number: "2", title: "Reason（理由）", description: "次に、なぜそう思うのかを伝えます。\n理由を足すと説得力が出ます。", expressions: ["理由は、〜からです。", "なぜなら、〜だからです。", "その理由は、〜です。"], tip: "まずは理由1つでOKです。"),
            ModelIntroStep(number: "3", title: "Example（例）", description: "次は、小さい例を入れましょう。\n例があると、相手がイメージしやすくなります。", expressions: ["例えば、〜です。", "たとえば、〜のときです。", "実際に、〜ことがあります。"], tip: "長い例はいりません。1文だけでも十分です。"),
            ModelIntroStep(number: "4", title: "Point（まとめ）", description: "最後に、もう一度言いたいことをまとめます。\nこれで話がきれいに終わります。", expressions: [], tip: "最初の結論を、最後にやさしくもう一回言えばOKです。")
        ],
        finalImage: "「私はこう思います。なぜなら〜。例えば〜。だからこうです。」"
    )

    private static let stepByStep = ModelIntroContent(
        title: "ステップ解説法ってなに？",
        iconName: "list.number",
        tint: .blue,
        intro: "順番に説明していく、わかりやすい型です。\n手順や流れを伝えるときに使います。",
        formula: "第一段階 → 第二段階 → 第三段階 → 完成",
        formulaDetail: "時系列で順序立てて説明する",
        summary: "「まず〜、次に〜、そして〜、最後に〜」\nこの順番で話せば、相手が混乱しません。",
        steps: [
            ModelIntroStep(number: "1", title: "第一段階（最初）", description: "まず最初に何をするか、何から始まるかを言います。\nスタート地点をはっきり示すことが大事です。", expressions: ["まず、〜します。", "最初に、〜です。", "第一に、〜から始めます。"], tip: "「まず」を使うと、聞き手が最初だとわかります。"),
            ModelIntroStep(number: "2", title: "第二段階（次）", description: "次に何をするか、次はどうなるかを説明します。\n第一段階の後に続くことを話します。", expressions: ["次に、〜します。", "その後、〜です。", "続いて、〜します。"], tip: "「次に」で自然につながります。"),
            ModelIntroStep(number: "3", title: "第三段階（そして）", description: "さらに次の段階を説明します。\n必要なら、ここに追加の情報を入れてもOKです。", expressions: ["そして、〜します。", "さらに、〜です。", "また、〜もあります。"], tip: "段階が2つだけなら、この部分は省略してもOKです。"),
            ModelIntroStep(number: "4", title: "完成（最後）", description: "最後にどうなるか、何が完成するかを伝えます。\nゴールを示すことで、話がすっきり終わります。", expressions: ["最後に、〜です。", "こうして、〜が完成します。", "これで、〜ができます。"], tip: "「最後に」「こうして」で締めると、話が終わったと伝わります。")
        ],
        finalImage: "「まず〜します。次に〜します。そして〜します。最後に〜ができます。」"
    )

    private static let scqa = ModelIntroContent(
        title: "SCQA法ってなに？",
        iconName: "lightbulb.fill",
        tint: .purple,
        intro: "問題を見せてから答えを出す、ストーリー型の説明法です。\nビジネスや提案で使われます。",
        formula: "S → C → Q → A",
        formulaDetail: "状況 → 課題 → 疑問 → 答え",
        summary: "「こういう状況で、こんな問題があって、だからこの答えです」\n問題意識を共有してから解決策を示すので、納得感が強いです。",
        steps: [
            ModelIntroStep(number: "1", title: "Situation（状況）", description: "まず、今どんな状況なのかを説明します。\n背景や現状を共有して、話の土台を作ります。", expressions: ["現在、〜という状況です。", "最近、〜が起きています。", "今、〜という状態です。"], tip: "みんなが知っている状況から始めると、話に入りやすいです。"),
            ModelIntroStep(number: "2", title: "Complication（課題）", description: "次に、その状況の中で何が問題なのかを示します。\n困っていることを明確にします。", expressions: ["しかし、〜という問題があります。", "ところが、〜で困っています。", "その結果、〜という課題が生まれました。"], tip: "「しかし」「ところが」を使うと、問題が際立ちます。"),
            ModelIntroStep(number: "3", title: "Question（疑問）", description: "では、どうすればいいのか？という疑問を投げかけます。\n聞き手と一緒に考える場を作ります。", expressions: ["では、どうすればいいでしょうか。", "この問題をどう解決すればいいでしょうか。", "そこで、〜という疑問が生まれます。"], tip: "この部分は短くてOK。すぐに答えに進みましょう。"),
            ModelIntroStep(number: "4", title: "Answer（答え）", description: "最後に、答えや解決策を示します。\nここまでの流れがあるので、答えが自然に納得されます。", expressions: ["答えは、〜です。", "解決策として、〜を提案します。", "そのために、〜が必要です。"], tip: "問題をしっかり示したあとなので、答えがすっと入ります。")
        ],
        finalImage: "「今こういう状況で、こんな問題があって、どうすればいい？答えは〜です。」"
    )
}

private struct ModelIntroStep: Identifiable {
    let id = UUID()
    let number: String
    let title: String
    let description: String
    let expressions: [String]
    let tip: String
}
