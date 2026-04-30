export type ExplanationModelRecord = {
  id: string;
  slug: 'prep' | 'stepbystep' | 'scqa';
  nameJa: string;
  shortDescription: string;
  longDescription: string;
  structureLabel: string;
  steps: string[];
  features: string[];
  suitableFor: string[];
  isActive: boolean;
};

export type PracticeThemeRecord = {
  id: string;
  slug: string;
  level: string;
  category: string;
  title: string;
  description: string;
  promptText: string;
  explanationGoal: string;
  recommendedModelId: string;
  keywords: string[];
  usefulExpressions: string[];
  hints: string[];
  estimatedMinutes: number;
  difficulty: number;
  purposeTags: string[];
  nextThemeId: string | null;
  isActive: boolean;
};

export type ThemeListItemRecord = {
  id: string;
  slug: string;
  level: string;
  category: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  difficulty: number;
  purposeTags: string[];
  isActive: boolean;
};

function mapThemeRecordToListItem(theme: PracticeThemeRecord): ThemeListItemRecord {
  return {
    id: theme.id,
    slug: theme.slug,
    level: theme.level,
    category: theme.category,
    title: theme.title,
    description: theme.description,
    estimatedMinutes: theme.estimatedMinutes,
    difficulty: theme.difficulty,
    purposeTags: theme.purposeTags,
    isActive: theme.isActive,
  };
}

export type ExplanationModelSummaryRecord = {
  id: string;
  slug: 'prep' | 'stepbystep' | 'scqa';
  nameJa: string;
  shortDescription: string;
  longDescription: string;
  structureLabel: string;
  steps: string[];
  features: string[];
  suitableFor: string[];
};

export const explanationModels: ExplanationModelRecord[] = [
  {
    id: 'model-prep',
    slug: 'prep',
    nameJa: 'PREP法',
    shortDescription: '結論から始めて理由と例で補強する',
    longDescription: '結論から始めて、理由と例で補強する論理的な話し方',
    structureLabel: 'Point → Reason → Example → Point',
    steps: ['結論', '理由', '具体例', 'まとめ'],
    features: [
      '説得力が高く、ビジネスシーンで信頼される',
      '結論が先にあるので、聞き手が理解しやすい',
      '具体例で補強するため、納得感が強い',
    ],
    suitableFor: [
      '面接での志望動機や自己PR',
      '意見や提案を述べる場面',
      '賛成・反対の理由を説明する',
      'ビジネスプレゼンテーション',
    ],
    isActive: true,
  },
  {
    id: 'model-stepbystep',
    slug: 'stepbystep',
    nameJa: 'ステップ解説法',
    shortDescription: '順序立てて説明する',
    longDescription: '時系列で順序立てて、わかりやすく伝える',
    structureLabel: '手順1 → 手順2 → 手順3 → 完成',
    steps: ['第一段階', '第二段階', '第三段階', '完成'],
    features: [
      '手順や流れが明確で、相手が再現しやすい',
      '時系列順なので、混乱が少ない',
      '初心者でも使いやすい基本的な構造',
    ],
    suitableFor: [
      '料理や作業の手順説明',
      '道具や製品の使い方',
      '物事の仕組みやプロセス',
      '日常生活の説明',
    ],
    isActive: true,
  },
  {
    id: 'model-scqa',
    slug: 'scqa',
    nameJa: 'SCQA法',
    shortDescription: '状況から課題、解決策へ導く',
    longDescription: '状況を設定し、課題から解決策へ導く',
    structureLabel: 'Situation → Complication → Question → Answer',
    steps: ['状況', '課題', '疑問', '答え'],
    features: [
      'ストーリー性があり、聞き手を引き込める',
      '問題意識を共有してから解決策を示す',
      'コンサルティングやビジネス提案に強い',
    ],
    suitableFor: [
      '問題解決の提案',
      'プロジェクトの背景説明',
      '改善案やアイデアの提示',
      '論理的な説明が求められる場面',
    ],
    isActive: true,
  },
];

export const practiceThemes: PracticeThemeRecord[] = [
  {
    id: 'theme-coffee',
    slug: 'describe-coffee',
    level: '初級',
    category: 'object',
    title: 'コーヒーを説明する',
    description: '日常の飲み物を説明してみよう',
    promptText: '日本語を知らない人に、コーヒーとは何か、どんな特徴があるかを説明してください。',
    explanationGoal: '日本語を知らない人に、コーヒーの特徴や飲まれる場面をわかりやすく伝えましょう。',
    recommendedModelId: 'model-stepbystep',
    keywords: ['飲み物', '苦い', '香り', '豆', 'カフェ'],
    usefulExpressions: ['〜というのは...', '例えば、〜', '〜ができます'],
    hints: [
      '最初に「コーヒーとは何か」を短く言いましょう',
      '次に味や香りなどの特徴を伝えましょう',
      '最後にどんな時に飲むかをまとめましょう',
    ],
    estimatedMinutes: 5,
    difficulty: 1,
    purposeTags: ['日常会話'],
    nextThemeId: 'theme-bicycle',
    isActive: true,
  },
  {
    id: 'theme-bicycle',
    slug: 'describe-bicycle-usage',
    level: '初級',
    category: 'object',
    title: '自転車の使い方',
    description: '移動手段について説明する',
    promptText: '日本語を知らない人に、自転車の使い方や便利な点を説明してください。',
    explanationGoal: '自転車の基本的な使い方と便利さを、順序立てて説明しましょう。',
    recommendedModelId: 'model-stepbystep',
    keywords: ['乗る', 'ペダル', '移動', '便利', 'ヘルメット'],
    usefulExpressions: ['まず、〜します', '次に、〜します', '最後に、〜です'],
    hints: [
      'どうやって乗るかを順番で説明しましょう',
      '安全に使うポイントも入れてみましょう',
      '最後に便利な理由をまとめましょう',
    ],
    estimatedMinutes: 6,
    difficulty: 1,
    purposeTags: ['日常会話'],
    nextThemeId: 'theme-ramen',
    isActive: true,
  },
  {
    id: 'theme-ramen',
    slug: 'explain-how-to-make-ramen',
    level: '中級',
    category: 'process',
    title: 'ラーメンの作り方',
    description: 'プロセスを順序立てて説明',
    promptText: 'ラーメンの作り方を、手順が伝わるように説明してください。',
    explanationGoal: '材料から完成までの流れを、聞き手が再現できるように説明しましょう。',
    recommendedModelId: 'model-stepbystep',
    keywords: ['麺', 'スープ', '具', '煮る', '完成'],
    usefulExpressions: ['最初に、〜', 'その後、〜', 'こうして、〜が完成します'],
    hints: [
      '材料の準備から説明を始めましょう',
      'スープと麺の順番を意識しましょう',
      '最後に完成形を一言でまとめましょう',
    ],
    estimatedMinutes: 8,
    difficulty: 2,
    purposeTags: ['料理', '手順'],
    nextThemeId: 'theme-train-bus',
    isActive: true,
  },
  {
    id: 'theme-train-bus',
    slug: 'compare-train-and-bus',
    level: '中級',
    category: 'comparison',
    title: '電車とバスの違い',
    description: '2つのものを比較する',
    promptText: '電車とバスの違いを、わかりやすく比較して説明してください。',
    explanationGoal: '共通点と違いを整理して、聞き手が比較できるように説明しましょう。',
    recommendedModelId: 'model-prep',
    keywords: ['速い', '安い', '便利', '混む', '路線'],
    usefulExpressions: ['結論から言うと、〜', '一方で、〜', '例えば、〜'],
    hints: [
      '先に大きな違いを一言で伝えましょう',
      'それぞれの良い点を比べましょう',
      '最後にどんな人に向いているかをまとめましょう',
    ],
    estimatedMinutes: 7,
    difficulty: 2,
    purposeTags: ['比較', '日常'],
    nextThemeId: 'theme-job-motivation',
    isActive: true,
  },
  {
    id: 'theme-job-motivation',
    slug: 'job-interview-motivation',
    level: '上級',
    category: 'work',
    title: '面接での志望動機',
    description: '自分の考えを論理的に',
    promptText: '面接での志望動機を、論理的で伝わりやすく説明してください。',
    explanationGoal: '志望理由、背景、具体例を入れながら、納得感のある説明を目指しましょう。',
    recommendedModelId: 'model-prep',
    keywords: ['志望動機', '経験', '強み', '成長', '貢献'],
    usefulExpressions: ['結論から言うと、〜です', '理由は、〜からです', '例えば、〜です'],
    hints: [
      '最初に志望理由を一言で言いましょう',
      '自分の経験を具体例として加えましょう',
      '最後に会社でどう貢献したいかをまとめましょう',
    ],
    estimatedMinutes: 10,
    difficulty: 3,
    purposeTags: ['面接', 'ビジネス'],
    nextThemeId: 'theme-project-status',
    isActive: true,
  },
  {
    id: 'theme-project-status',
    slug: 'project-status-report',
    level: '上級',
    category: 'work',
    title: 'プロジェクト進捗報告',
    description: '業務内容を正確に伝える',
    promptText: 'プロジェクトの進捗状況を、課題や次の対応も含めて報告してください。',
    explanationGoal: '現状、課題、次のアクションが伝わるように報告しましょう。',
    recommendedModelId: 'model-scqa',
    keywords: ['進捗', '課題', '対応', '予定', '共有'],
    usefulExpressions: ['現在、〜という状況です', 'しかし、〜という課題があります', 'そのため、〜します'],
    hints: [
      'まず現状を短く伝えましょう',
      '課題を一つに絞って明確にしましょう',
      '最後に次の対応を伝えましょう',
    ],
    estimatedMinutes: 12,
    difficulty: 3,
    purposeTags: ['ビジネス', '報告'],
    nextThemeId: null,
    isActive: true,
  },
];

export function getThemeList(filters?: {
  level?: string;
  category?: string;
}): ThemeListItemRecord[] {
  return practiceThemes
    .filter((theme) => {
      if (!theme.isActive) {
        return false;
      }

      if (filters?.level && theme.level !== filters.level) {
        return false;
      }

      if (filters?.category && filters.category !== 'all' && theme.category !== filters.category) {
        return false;
      }

      return true;
    })
    .map(mapThemeRecordToListItem);
}

export function findThemeByIdOrSlug(themeId: string): PracticeThemeRecord | undefined {
  return practiceThemes.find((theme) => theme.id === themeId || theme.slug === themeId);
}

export function getThemeListItemByIdOrSlug(themeId: string): ThemeListItemRecord | undefined {
  const theme = findThemeByIdOrSlug(themeId);

  if (!theme) {
    return undefined;
  }

  return mapThemeRecordToListItem(theme);
}

export function getFirstActiveTheme(): ThemeListItemRecord | undefined {
  const firstTheme = practiceThemes.find((theme) => theme.isActive);

  if (!firstTheme) {
    return undefined;
  }

  return mapThemeRecordToListItem(firstTheme);
}

export function getExplanationModelSummaries(): ExplanationModelSummaryRecord[] {
  return explanationModels
    .filter((model) => model.isActive)
    .map((model) => ({
      id: model.id,
      slug: model.slug,
      nameJa: model.nameJa,
      shortDescription: model.shortDescription,
      longDescription: model.longDescription,
      structureLabel: model.structureLabel,
      steps: model.steps,
      features: model.features,
      suitableFor: model.suitableFor,
    }));
}

export function findExplanationModelByIdOrSlug(modelId: string): ExplanationModelRecord | undefined {
  return explanationModels.find((model) => model.id === modelId || model.slug === modelId);
}
