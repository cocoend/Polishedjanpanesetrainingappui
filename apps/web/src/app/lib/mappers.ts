import type {
  ExplanationModelDetailDto,
  ThemeDetailResponseDto,
  ThemeListItemDto,
} from '@polished/shared';

import type { Topic } from '../components/TopicSelectionScreen';

export interface TopicDetailViewModel {
  goal: string;
  recommendedModel: {
    id: string;
    slug: string;
    name: string;
    description: string;
    steps: string[];
  };
  keywords: string[];
  usefulExpressions: Array<{
    title: string;
    subtitle: string;
  }>;
  hints: string[];
}

export interface ExplanationModelCardViewModel {
  id: string;
  name: string;
  structure: string;
  useCase: string;
  description: string;
  steps: string[];
  features: string[];
  suitableFor: string[];
  color: string;
  bgColor: string;
  borderColor: string;
  iconBg: string;
  iconColor: string;
}

const levelStyleMap: Record<string, { color: string; badge: string }> = {
  初級: {
    color: 'bg-green-50 border-green-200',
    badge: 'bg-green-500',
  },
  中級: {
    color: 'bg-blue-50 border-blue-200',
    badge: 'bg-blue-500',
  },
  上級: {
    color: 'bg-purple-50 border-purple-200',
    badge: 'bg-purple-500',
  },
};

const modelStyleMap: Record<string, Omit<ExplanationModelCardViewModel, 'id' | 'name' | 'structure' | 'useCase' | 'description' | 'steps' | 'features' | 'suitableFor'>> = {
  prep: {
    color: 'from-green-400 to-emerald-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
  },
  stepbystep: {
    color: 'from-blue-400 to-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  scqa: {
    color: 'from-purple-400 to-purple-500',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
  },
};

function difficultyToStars(difficulty: number) {
  return '★'.repeat(difficulty) + '☆'.repeat(Math.max(0, 3 - difficulty));
}

function buildTopicTagList(theme: ThemeListItemDto) {
  return theme.purposeTags.length > 0 ? theme.purposeTags : [theme.category];
}

export function mapThemeListItemToTopic(theme: ThemeListItemDto): Topic {
  const levelStyle = levelStyleMap[theme.level] ?? levelStyleMap.初級;

  return {
    id: theme.id,
    level: theme.level,
    category: theme.category,
    title: theme.title,
    description: theme.description,
    time: `${theme.estimatedMinutes}分`,
    difficulty: difficultyToStars(theme.difficulty),
    tags: buildTopicTagList(theme),
    color: levelStyle.color,
    badge: levelStyle.badge,
  };
}

export function mapThemeDetailResponseToViewModel(response: ThemeDetailResponseDto): TopicDetailViewModel {
  return {
    goal: response.theme.explanationGoal,
    recommendedModel: {
      id: response.recommendedModel.id,
      slug: response.recommendedModel.slug,
      name: response.recommendedModel.nameJa,
      description: response.recommendedModel.shortDescription,
      steps: response.recommendedModel.steps,
    },
    keywords: response.theme.keywords,
    usefulExpressions: response.theme.usefulExpressions.map((expression) => ({
      title: expression,
      subtitle: '练习时可以自然地放进说明里',
    })),
    hints: response.theme.hints,
  };
}

function buildUseCase(model: ExplanationModelDetailDto) {
  return model.suitableFor[0] ?? model.shortDescription;
}

export function mapExplanationModelToCard(model: ExplanationModelDetailDto): ExplanationModelCardViewModel {
  const style = modelStyleMap[model.slug];

  return {
    id: model.slug,
    name: model.nameJa,
    structure: model.structureLabel,
    useCase: buildUseCase(model),
    description: model.longDescription,
    steps: model.steps,
    features: model.features,
    suitableFor: model.suitableFor,
    color: style.color,
    bgColor: style.bgColor,
    borderColor: style.borderColor,
    iconBg: style.iconBg,
    iconColor: style.iconColor,
  };
}
