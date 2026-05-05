import Foundation
import SwiftUI

struct PracticeTopic: Identifiable, Hashable {
    let id: String
    let level: String
    let category: String
    let title: String
    let description: String
    let estimatedMinutes: Int
    let difficulty: Int
    let tags: [String]
    let tint: Color

    init(
        id: String,
        level: String,
        category: String,
        title: String,
        description: String,
        estimatedMinutes: Int,
        difficulty: Int,
        tags: [String],
        tint: Color
    ) {
        self.id = id
        self.level = level
        self.category = category
        self.title = title
        self.description = description
        self.estimatedMinutes = estimatedMinutes
        self.difficulty = difficulty
        self.tags = tags
        self.tint = tint
    }

    static let sample = PracticeTopic(
        id: "theme-default",
        level: "初級",
        category: "object",
        title: "スマートフォンを説明する",
        description: "身近なものから始めよう",
        estimatedMinutes: 5,
        difficulty: 1,
        tags: ["日常会話"],
        tint: .green
    )

    static let samples = [
        sample,
        PracticeTopic(id: "theme-coffee", level: "初級", category: "object", title: "コーヒーを説明する", description: "特徴や飲む場面を説明しよう", estimatedMinutes: 6, difficulty: 1, tags: ["日常会話"], tint: .green),
        PracticeTopic(id: "theme-ramen", level: "中級", category: "process", title: "ラーメンの作り方", description: "手順を順番に伝えよう", estimatedMinutes: 7, difficulty: 2, tags: ["料理"], tint: .blue),
        PracticeTopic(id: "theme-interview", level: "上級", category: "work", title: "面接での志望動機", description: "理由と具体例を入れよう", estimatedMinutes: 8, difficulty: 3, tags: ["面接"], tint: .purple)
    ]

    init(dto: ThemeListItemDTO) {
        id = dto.id
        level = dto.level
        category = dto.category
        title = dto.title
        description = dto.description
        estimatedMinutes = dto.estimatedMinutes
        difficulty = dto.difficulty
        tags = dto.purposeTags
        tint = PracticeTopic.tint(for: dto.level)
    }

    var difficultyStars: String {
        String(repeating: "★", count: min(max(difficulty, 1), 3)) +
        String(repeating: "☆", count: max(0, 3 - min(max(difficulty, 1), 3)))
    }

    private static func tint(for level: String) -> Color {
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
}

struct ExplanationModel: Identifiable, Hashable {
    let id: String
    let name: String
    let useCase: String
    let description: String
    let steps: [String]
    let features: [String]
    let suitableFor: [String]
    let tint: Color
    let iconName: String

    init(
        id: String,
        name: String,
        useCase: String,
        description: String,
        steps: [String],
        features: [String],
        suitableFor: [String],
        tint: Color,
        iconName: String
    ) {
        self.id = id
        self.name = name
        self.useCase = useCase
        self.description = description
        self.steps = steps
        self.features = features
        self.suitableFor = suitableFor
        self.tint = tint
        self.iconName = iconName
    }

    static let prep = ExplanationModel(
        id: "prep",
        name: "PREP法",
        useCase: "意見や主張を伝える時に最適",
        description: "結論から始めて、理由と例で補強する論理的な話し方",
        steps: ["結論", "理由", "具体例", "まとめ"],
        features: ["説得力が高く、ビジネスシーンで信頼される", "結論が先にあるので、聞き手が理解しやすい", "具体例で補強するため、納得感が強い"],
        suitableFor: ["面接での志望動機や自己PR", "意見や提案を述べる場面", "賛成・反対の理由を説明する"],
        tint: .green,
        iconName: "checkmark.circle.fill"
    )

    static let stepByStep = ExplanationModel(
        id: "stepbystep",
        name: "ステップ解説法",
        useCase: "プロセスや作り方を説明する時",
        description: "時系列で順序立てて、わかりやすく伝える",
        steps: ["第一段階", "第二段階", "第三段階", "完成"],
        features: ["手順や流れが明確で、相手が再現しやすい", "時系列順なので、混乱が少ない", "初心者でも使いやすい基本的な構造"],
        suitableFor: ["料理や作業の手順説明", "道具や製品の使い方", "物事の仕組みやプロセス"],
        tint: .blue,
        iconName: "list.number"
    )

    static let scqa = ExplanationModel(
        id: "scqa",
        name: "SCQA法",
        useCase: "問題解決や提案を説明する時",
        description: "状況を設定し、課題から解決策へ導く",
        steps: ["状況", "課題", "疑問", "答え"],
        features: ["ストーリー性があり、聞き手を引き込める", "問題意識を共有してから解決策を示す", "コンサルティングやビジネス提案に強い"],
        suitableFor: ["問題解決の提案", "プロジェクトの背景説明", "改善案やアイデアの提示"],
        tint: .purple,
        iconName: "lightbulb.fill"
    )

    static let all = [prep, stepByStep, scqa]

    init(dto: ExplanationModelSummaryDTO) {
        id = dto.id
        name = dto.nameJa
        useCase = dto.shortDescription
        description = dto.longDescription
        steps = dto.steps
        features = dto.features
        suitableFor = dto.suitableFor
        tint = ExplanationModel.tint(for: dto.slug)
        iconName = ExplanationModel.iconName(for: dto.slug)
    }

    private static func tint(for slug: ExplanationModelSlug) -> Color {
        switch slug {
        case .prep:
            return .green
        case .stepByStep:
            return .blue
        case .scqa:
            return .purple
        }
    }

    private static func iconName(for slug: ExplanationModelSlug) -> String {
        switch slug {
        case .prep:
            return "checkmark.circle.fill"
        case .stepByStep:
            return "list.number"
        case .scqa:
            return "lightbulb.fill"
        }
    }
}

struct TopicDetailContent: Hashable {
    struct UsefulExpression: Hashable {
        let title: String
        let subtitle: String
    }

    let goal: String
    let keywords: [String]
    let usefulExpressions: [UsefulExpression]
    let hints: [String]

    static let sample = TopicDetailContent(
        goal: "日本語を知らない人に、スマートフォンとは何か、何ができるのかを伝えましょう",
        keywords: ["携帯電話", "画面", "インターネット", "アプリ", "便利"],
        usefulExpressions: [
            UsefulExpression(title: "〜というのは...", subtitle: "定義を説明する"),
            UsefulExpression(title: "例えば、〜", subtitle: "具体例を出す"),
            UsefulExpression(title: "〜ができます", subtitle: "機能を説明する")
        ],
        hints: [
            "最初に「スマートフォンとは何か」を一言で説明しよう",
            "次に、どんなことができるか2〜3個例を挙げよう",
            "最後に、なぜ便利なのかをまとめよう"
        ]
    )

    init(dto: ThemeDetailDTO) {
        goal = dto.explanationGoal
        keywords = dto.keywords
        usefulExpressions = dto.usefulExpressions.map {
            UsefulExpression(title: $0, subtitle: "説明に入れると自然な表現")
        }
        hints = dto.hints
    }

    init(
        goal: String,
        keywords: [String],
        usefulExpressions: [UsefulExpression],
        hints: [String]
    ) {
        self.goal = goal
        self.keywords = keywords
        self.usefulExpressions = usefulExpressions
        self.hints = hints
    }
}

struct FeedbackResult: Hashable {
    let score: Int
    let reason: String
    let strengths: [String]
    let improvements: [String]
    let improvedExample: String

    static let sample = FeedbackResult(
        score: 78,
        reason: "良いスタートです。構造を意識して説明できています。",
        strengths: ["テーマに沿って説明できています。", "聞き手に伝えようとする意図が明確です。"],
        improvements: ["最後に一文でまとめを入れると、説明全体が締まります。", "具体的なキーワードをあと1〜2個加えると、内容の網羅性が上がります。"],
        improvedExample: "スマートフォンというのは、小型の携帯端末です。画面を指で触れて操作でき、調べ物や連絡、写真撮影などに使えます。このように、日常生活を支える便利な道具です。"
    )

    init(dto: FeedbackDTO) {
        score = dto.totalScore
        reason = dto.recommendReason ?? "説明内容をもとに、AIフィードバックを作成しました。"
        strengths = dto.strengths
        improvements = dto.improvementPoints
        improvedExample = dto.improvedAnswerExample
    }

    init(learnedCard: LearnedCardDTO) {
        score = learnedCard.latestScore
        reason = learnedCard.summary
        strengths = learnedCard.keyTakeaways.isEmpty
            ? ["保存済みの練習記録です。"]
            : learnedCard.keyTakeaways
        improvements = learnedCard.keyTakeaways
        improvedExample = learnedCard.examplePhrases.first ?? "保存済みカードに改善例はありません。"
    }

    init(
        score: Int,
        reason: String,
        strengths: [String],
        improvements: [String],
        improvedExample: String
    ) {
        self.score = score
        self.reason = reason
        self.strengths = strengths
        self.improvements = improvements
        self.improvedExample = improvedExample
    }
}

struct LearnedRecord: Identifiable, Hashable {
    let id: String
    let cardId: String?
    let title: String
    let level: String
    let modelName: String
    let score: Int
    let savedDate: String
    let transcript: String
    let feedback: FeedbackResult
    let isRead: Bool

    init(
        id: String,
        cardId: String? = nil,
        title: String,
        level: String,
        modelName: String,
        score: Int,
        savedDate: String,
        transcript: String,
        feedback: FeedbackResult,
        isRead: Bool = true
    ) {
        self.id = id
        self.cardId = cardId
        self.title = title
        self.level = level
        self.modelName = modelName
        self.score = score
        self.savedDate = savedDate
        self.transcript = transcript
        self.feedback = feedback
        self.isRead = isRead
    }

    init(dto: LearnedCardDTO) {
        id = dto.id
        cardId = dto.id
        title = dto.title
        level = dto.themeLevel
        modelName = dto.selectedModelId
        score = dto.latestScore
        savedDate = String(dto.savedAt.prefix(10))
        transcript = dto.summary
        feedback = FeedbackResult(learnedCard: dto)
        isRead = dto.isRead
    }

    static let samples = [
        LearnedRecord(
            id: "1",
            cardId: nil,
            title: "スマートフォンを説明する",
            level: "初級",
            modelName: "ステップ解説法",
            score: 85,
            savedDate: "2026-05-02",
            transcript: "スマートフォンというのは、携帯電話の一つです。画面を指で触れて操作できます。例えば、インターネットで調べ物をしたり、友達にメッセージを送ったりできます。",
            feedback: FeedbackResult(
                score: 85,
                reason: "身近な例を使いながら、スマートフォンの特徴をわかりやすく説明できています。",
                strengths: ["基本的な定義が明確です。", "使い方の例が入っていて聞き手が理解しやすいです。"],
                improvements: ["最後に一文でまとめると、説明全体がさらに自然になります。", "便利さだけでなく注意点も少し触れると内容に深みが出ます。"],
                improvedExample: "スマートフォンというのは、画面を指で触って操作する小型の携帯端末です。電話やメッセージだけでなく、調べ物、写真撮影、地図の確認などにも使えます。このように、日常生活の多くの場面を支える便利な道具です。"
            ),
            isRead: false
        ),
        LearnedRecord(
            id: "2",
            cardId: nil,
            title: "コーヒーを説明する",
            level: "初級",
            modelName: "PREP法",
            score: 78,
            savedDate: "2026-05-01",
            transcript: "コーヒーは、豆を焙煎してお湯で抽出する飲み物です。朝に飲む人が多く、香りや苦味を楽しめます。",
            feedback: FeedbackResult(
                score: 78,
                reason: "コーヒーの特徴を簡潔に説明できています。もう少し具体例を足すと、聞き手に伝わりやすくなります。",
                strengths: ["コーヒーの定義が自然です。", "飲む場面に触れられています。"],
                improvements: ["味や香りの特徴をもう少し具体的に説明しましょう。", "最後に自分のまとめの一文を入れると印象に残ります。"],
                improvedExample: "コーヒーは、焙煎した豆から抽出する飲み物です。苦味と香りが特徴で、朝の目覚めや休憩時間によく飲まれます。このように、コーヒーは気分を切り替える身近な飲み物です。"
            )
        )
    ]
}
