import { Flame, Star, Play, BookOpen, TrendingUp } from 'lucide-react';

interface HomeScreenProps {
  onNavigate: (screen: string) => void;
}

export default function HomeScreen({ onNavigate }: HomeScreenProps) {
  return (
    <div className="min-h-screen bg-white pb-8">
      {/* Header */}
      <div className="px-6 pt-12 pb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">おはよう!</h1>
        <p className="text-gray-600">今日も説明の練習を頑張ろう</p>
      </div>

      {/* Streak Card */}
      <div className="px-6 mb-6">
        <div className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-3xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Flame className="w-8 h-8" />
              <span className="text-3xl font-bold">7日連続</span>
            </div>
            <Star className="w-6 h-6 fill-white" />
          </div>
          <p className="text-orange-100 text-sm">新記録まであと3日!</p>
        </div>
      </div>

      {/* Today's Practice */}
      <div className="px-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3">今日のおすすめ</h2>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-6 border-2 border-green-200 shadow-md">
          <div className="flex items-start justify-between mb-3">
            <div>
              <span className="inline-block bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-2">
                初級
              </span>
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                スマートフォンを説明する
              </h3>
              <p className="text-gray-600 text-sm">身近なものから始めよう</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
            <span className="bg-white px-3 py-1 rounded-full">⏱️ 5分</span>
            <span className="bg-white px-3 py-1 rounded-full">💬 日常会話</span>
          </div>
          <button
            onClick={() => onNavigate('topic')}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-2xl shadow-lg transition-colors flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5 fill-white" />
            練習を始める
          </button>
        </div>
      </div>

      {/* Continue Practice */}
      <div className="px-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3">続きから</h2>
        <div className="bg-blue-50 rounded-2xl p-5 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-gray-900">面接での自己紹介</h3>
            <span className="text-xs text-blue-600 font-semibold">65%</span>
          </div>
          <div className="w-full bg-white rounded-full h-2 mb-3">
            <div className="bg-blue-500 h-2 rounded-full" style={{ width: '65%' }}></div>
          </div>
          <button
            onClick={() => onNavigate('topic')}
            className="text-blue-600 font-semibold text-sm flex items-center gap-1"
          >
            続ける →
          </button>
        </div>
      </div>

      {/* Weak Points */}
      <div className="px-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-coral-500" />
          強化ポイント
        </h2>
        <div className="flex flex-wrap gap-2">
          <span className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-medium border border-yellow-200">
            接続詞の使い方
          </span>
          <span className="bg-pink-100 text-pink-800 px-4 py-2 rounded-full text-sm font-medium border border-pink-200">
            比較表現
          </span>
          <span className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium border border-purple-200">
            理由の説明
          </span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6">
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => onNavigate('topic')}
            className="bg-white border-2 border-gray-200 rounded-2xl p-5 hover:border-green-300 transition-colors"
          >
            <div className="bg-green-100 w-12 h-12 rounded-xl flex items-center justify-center mb-3">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-bold text-gray-900 text-sm mb-1">レベル別練習</h3>
            <p className="text-xs text-gray-500">初級〜上級</p>
          </button>
          <button
            onClick={() => onNavigate('modelList')}
            className="bg-white border-2 border-gray-200 rounded-2xl p-5 hover:border-blue-300 transition-colors"
          >
            <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center mb-3">
              <Star className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900 text-sm mb-1">説明モデル</h3>
            <p className="text-xs text-gray-500">お手本を見る</p>
          </button>
        </div>
      </div>
    </div>
  );
}
