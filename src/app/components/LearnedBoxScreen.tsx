import { ArrowLeft, Calendar, TrendingUp, Award, Play, ChevronRight, Filter } from 'lucide-react';
import { useState, useEffect } from 'react';

interface LearnedBoxScreenProps {
  onNavigate: (screen: string) => void;
  onMarkAsRead?: () => void;
}

interface LearnedRecord {
  id: number;
  topicTitle: string;
  level: string;
  badge: string;
  model: string;
  score: number;
  date: string;
  attempts: number;
  improvement: number;
  tags: string[];
}

const learnedRecords: LearnedRecord[] = [
  {
    id: 1,
    topicTitle: 'スマートフォンを説明する',
    level: '初級',
    badge: 'bg-green-500',
    model: 'ステップ解説法',
    score: 85,
    date: '2026-04-23',
    attempts: 2,
    improvement: 15,
    tags: ['日常会話', '物品説明']
  },
  {
    id: 2,
    topicTitle: '面接での志望動機',
    level: '上級',
    badge: 'bg-purple-500',
    model: 'PREP法',
    score: 78,
    date: '2026-04-22',
    attempts: 3,
    improvement: 22,
    tags: ['面接', 'ビジネス']
  },
  {
    id: 3,
    topicTitle: 'ラーメンの作り方',
    level: '中級',
    badge: 'bg-blue-500',
    model: 'ステップ解説法',
    score: 92,
    date: '2026-04-21',
    attempts: 1,
    improvement: 0,
    tags: ['料理', '手順']
  },
  {
    id: 4,
    topicTitle: '電車とバスの違い',
    level: '中級',
    badge: 'bg-blue-500',
    model: 'PREP法',
    score: 88,
    date: '2026-04-20',
    attempts: 2,
    improvement: 18,
    tags: ['比較', '日常']
  }
];

export default function LearnedBoxScreen({ onNavigate, onMarkAsRead }: LearnedBoxScreenProps) {
  const [filter, setFilter] = useState<'all' | 'recent' | 'high'>('all');

  // 画面表示時に未読カウントをクリア
  useEffect(() => {
    if (onMarkAsRead) {
      onMarkAsRead();
    }
  }, [onMarkAsRead]);

  const totalRecords = learnedRecords.length;
  const averageScore = Math.round(learnedRecords.reduce((sum, r) => sum + r.score, 0) / totalRecords);
  const totalAttempts = learnedRecords.reduce((sum, r) => sum + r.attempts, 0);

  return (
    <div className="min-h-screen bg-white pb-8">
      {/* Header */}
      <div className="px-6 pt-12 pb-6 sticky top-0 bg-white z-10 border-b border-gray-100">
        <button
          onClick={() => onNavigate('home')}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">戻る</span>
        </button>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">学んだBOX</h1>
        <p className="text-gray-600 text-sm">あなたの学習記録と成長を振り返ろう</p>
      </div>

      {/* Stats Summary */}
      <div className="px-6 pt-6 pb-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border-2 border-green-200">
            <Award className="w-6 h-6 text-green-600 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{totalRecords}</p>
            <p className="text-xs text-gray-600">完了した練習</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-2xl p-4 border-2 border-blue-200">
            <TrendingUp className="w-6 h-6 text-blue-600 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{averageScore}</p>
            <p className="text-xs text-gray-600">平均スコア</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-4 border-2 border-purple-200">
            <Play className="w-6 h-6 text-purple-600 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{totalAttempts}</p>
            <p className="text-xs text-gray-600">総試行回数</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-6 pb-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-gray-500" />
          <h2 className="text-sm font-bold text-gray-500 uppercase">表示</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filter === 'all'
                ? 'bg-green-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            すべて
          </button>
          <button
            onClick={() => setFilter('recent')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filter === 'recent'
                ? 'bg-green-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            最近の練習
          </button>
          <button
            onClick={() => setFilter('high')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filter === 'high'
                ? 'bg-green-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            高得点
          </button>
        </div>
      </div>

      {/* Records List */}
      <div className="px-6 space-y-3">
        {learnedRecords.map((record) => (
          <div
            key={record.id}
            className="bg-white border-2 border-gray-200 rounded-2xl p-5 hover:border-green-300 hover:shadow-md transition-all"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`${record.badge} text-white text-xs font-bold px-2.5 py-1 rounded-full`}>
                    {record.level}
                  </span>
                  <span className="text-xs text-gray-500">{record.model}</span>
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-1">{record.topicTitle}</h3>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{record.date}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-green-100 rounded-xl px-3 py-1 mb-1">
                  <span className="text-2xl font-bold text-green-700">{record.score}</span>
                  <span className="text-sm text-green-600">/100</span>
                </div>
                {record.improvement > 0 && (
                  <div className="flex items-center gap-1 justify-end">
                    <TrendingUp className="w-3 h-3 text-green-600" />
                    <span className="text-xs font-medium text-green-600">+{record.improvement}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              {record.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-gray-100 px-3 py-1 rounded-full text-xs text-gray-700 font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                試行回数: <span className="font-semibold text-gray-900">{record.attempts}回</span>
              </div>
              <button className="flex items-center gap-1 text-green-600 font-semibold text-sm hover:text-green-700">
                詳細を見る
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State (if no records) */}
      {learnedRecords.length === 0 && (
        <div className="px-6 py-12 text-center">
          <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Award className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="font-bold text-gray-900 text-lg mb-2">まだ記録がありません</h3>
          <p className="text-gray-600 text-sm mb-6">練習を完了すると、ここに記録が保存されます</p>
          <button
            onClick={() => onNavigate('home')}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-2xl shadow-lg transition-colors"
          >
            練習を始める
          </button>
        </div>
      )}
    </div>
  );
}
