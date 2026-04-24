import { ArrowLeft, Clock, Briefcase, Coffee, MessageSquare } from 'lucide-react';
import { useState } from 'react';

interface TopicSelectionScreenProps {
  onNavigate: (screen: string) => void;
  onSelectTopic?: (topic: Topic) => void;
  onGoBack: () => void;
}

export interface Topic {
  id: number;
  level: string;
  category: string;
  title: string;
  description: string;
  time: string;
  difficulty: string;
  tags: string[];
  color: string;
  badge: string;
}

const topics: Topic[] = [
  {
    id: 1,
    level: '初級',
    category: 'object',
    title: 'コーヒーを説明する',
    description: '日常の飲み物を説明してみよう',
    time: '5分',
    difficulty: '★☆☆',
    tags: ['日常会話'],
    color: 'bg-green-50 border-green-200',
    badge: 'bg-green-500'
  },
  {
    id: 2,
    level: '初級',
    category: 'object',
    title: '自転車の使い方',
    description: '移動手段について説明する',
    time: '6分',
    difficulty: '★☆☆',
    tags: ['日常会話'],
    color: 'bg-green-50 border-green-200',
    badge: 'bg-green-500'
  },
  {
    id: 3,
    level: '中級',
    category: 'process',
    title: 'ラーメンの作り方',
    description: 'プロセスを順序立てて説明',
    time: '8分',
    difficulty: '★★☆',
    tags: ['料理', '手順'],
    color: 'bg-blue-50 border-blue-200',
    badge: 'bg-blue-500'
  },
  {
    id: 4,
    level: '中級',
    category: 'comparison',
    title: '電車とバスの違い',
    description: '2つのものを比較する',
    time: '7分',
    difficulty: '★★☆',
    tags: ['比較', '日常'],
    color: 'bg-blue-50 border-blue-200',
    badge: 'bg-blue-500'
  },
  {
    id: 5,
    level: '上級',
    category: 'work',
    title: '面接での志望動機',
    description: '自分の考えを論理的に',
    time: '10分',
    difficulty: '★★★',
    tags: ['面接', 'ビジネス'],
    color: 'bg-purple-50 border-purple-200',
    badge: 'bg-purple-500'
  },
  {
    id: 6,
    level: '上級',
    category: 'work',
    title: 'プロジェクト進捗報告',
    description: '業務内容を正確に伝える',
    time: '12分',
    difficulty: '★★★',
    tags: ['ビジネス', '報告'],
    color: 'bg-purple-50 border-purple-200',
    badge: 'bg-purple-500'
  }
];

export default function TopicSelectionScreen({ onNavigate, onSelectTopic, onGoBack }: TopicSelectionScreenProps) {
  const [selectedLevel, setSelectedLevel] = useState('初級');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const levels = ['初級', '中級', '上級'];
  const categories = [
    { id: 'all', label: 'すべて', icon: null },
    { id: 'object', label: 'モノ説明', icon: Coffee },
    { id: 'process', label: '手順説明', icon: MessageSquare },
    { id: 'comparison', label: '比較', icon: null },
    { id: 'work', label: '仕事/面接', icon: Briefcase }
  ];

  const filteredTopics = topics.filter(topic => {
    const levelMatch = topic.level === selectedLevel;
    const categoryMatch = selectedCategory === 'all' || topic.category === selectedCategory;
    return levelMatch && categoryMatch;
  });

  return (
    <div className="min-h-screen bg-white pb-8">
      {/* Header */}
      <div className="px-6 pt-12 pb-4 sticky top-0 bg-white z-10 border-b border-gray-100">
        <button
          onClick={onGoBack}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">戻る</span>
        </button>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">練習トピックを選ぶ</h1>
        <p className="text-gray-600 text-sm">レベルとカテゴリーから選ぼう</p>
      </div>

      {/* Level Tabs */}
      <div className="px-6 py-4 sticky top-[140px] bg-white z-10">
        <div className="flex gap-2 bg-gray-100 p-1 rounded-2xl">
          {levels.map(level => (
            <button
              key={level}
              onClick={() => setSelectedLevel(level)}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                selectedLevel === level
                  ? 'bg-white text-gray-900 shadow-md'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Category Chips */}
      <div className="px-6 pb-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(cat => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full font-medium text-sm whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-green-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {Icon && <Icon className="w-4 h-4" />}
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Topic Cards */}
      <div className="px-6 space-y-4">
        {filteredTopics.map(topic => (
          <div
            key={topic.id}
            className={`${topic.color} rounded-3xl p-6 border-2 shadow-sm hover:shadow-lg transition-shadow`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`${topic.badge} text-white text-xs font-bold px-3 py-1 rounded-full`}>
                    {topic.level}
                  </span>
                  <span className="text-xs text-gray-500">{topic.difficulty}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {topic.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3">{topic.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-full text-xs text-gray-700 font-medium">
                <Clock className="w-3.5 h-3.5" />
                {topic.time}
              </span>
              {topic.tags.map(tag => (
                <span
                  key={tag}
                  className="bg-white px-3 py-1.5 rounded-full text-xs text-gray-700 font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>

            <button
              onClick={() => {
                if (onSelectTopic) {
                  onSelectTopic(topic);
                }
                onNavigate('topicDetail');
              }}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-3.5 rounded-2xl shadow-md transition-colors"
            >
              この練習を始める
            </button>
          </div>
        ))}
      </div>

      {filteredTopics.length === 0 && (
        <div className="px-6 py-12 text-center">
          <p className="text-gray-500">このカテゴリーにはトピックがありません</p>
        </div>
      )}
    </div>
  );
}
