import { ArrowLeft, CheckCircle2, AlertCircle, Lightbulb, RotateCcw, BookOpen, ChevronDown, Star, TrendingUp } from 'lucide-react';
import { useState } from 'react';

interface FeedbackScreenProps {
  onNavigate: (screen: string) => void;
}

export default function FeedbackScreen({ onNavigate }: FeedbackScreenProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="min-h-screen bg-white pb-8">
      {/* Header */}
      <div className="px-6 pt-12 pb-6 sticky top-0 bg-white z-10 border-b border-gray-100">
        <button
          onClick={() => onNavigate('recording')}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">戻る</span>
        </button>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">AIフィードバック</h1>
        <p className="text-gray-600 text-sm">あなたの説明を分析しました</p>
      </div>

      {/* Overall Score Card */}
      <div className="px-6 pt-6 pb-4">
        <div className="bg-gradient-to-br from-green-400 to-green-500 rounded-3xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-green-100 text-sm mb-1">総合評価</p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold">78</span>
                <span className="text-2xl text-green-100">/100</span>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
              <Star className="w-12 h-12 fill-white" />
            </div>
          </div>
          <p className="text-green-50 leading-relaxed">
            良いスタートです！構造を意識して説明できています。いくつかの改善点を見てみましょう。
          </p>
        </div>
      </div>

      {/* Good Points */}
      <div className="px-6 pb-4">
        <h2 className="text-sm font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          よくできた点
        </h2>
        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-start gap-3">
            <div className="bg-green-500 rounded-full p-1 flex-shrink-0 mt-0.5">
              <CheckCircle2 className="w-3 h-3 text-white" />
            </div>
            <p className="text-gray-900 text-sm">
              <strong>構造が明確:</strong> ステップ解説法に沿って順序立てて説明できています
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-green-500 rounded-full p-1 flex-shrink-0 mt-0.5">
              <CheckCircle2 className="w-3 h-3 text-white" />
            </div>
            <p className="text-gray-900 text-sm">
              <strong>キーワード使用:</strong> 「携帯電話」「画面」「アプリ」など重要な単語を使えています
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-green-500 rounded-full p-1 flex-shrink-0 mt-0.5">
              <CheckCircle2 className="w-3 h-3 text-white" />
            </div>
            <p className="text-gray-900 text-sm">
              <strong>発音:</strong> 聞き取りやすい速度で話せています
            </p>
          </div>
        </div>
      </div>

      {/* Top Improvements */}
      <div className="px-6 pb-4">
        <h2 className="text-sm font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-orange-500" />
          改善ポイント Top 3
        </h2>
        <div className="space-y-3">
          {/* Issue 1 - Grammar */}
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5">
            <div className="flex items-start gap-3 mb-3">
              <div className="bg-red-500 rounded-xl px-2 py-1 flex-shrink-0">
                <span className="text-white text-xs font-bold">1</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    文法
                  </span>
                  <span className="text-xs text-red-700 font-medium">重要度: 高</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">助詞の使い方</h3>
                <p className="text-gray-700 text-sm mb-3">
                  「画面を指で触って」→「画面を指で触れて」が自然です
                </p>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-2">改善例:</p>
              <p className="text-gray-900 text-sm">
                画面を指で<span className="bg-green-200 px-1 rounded">触れて</span>操作することができます
              </p>
            </div>
          </div>

          {/* Issue 2 - Wording */}
          <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-5">
            <div className="flex items-start gap-3 mb-3">
              <div className="bg-orange-500 rounded-xl px-2 py-1 flex-shrink-0">
                <span className="text-white text-xs font-bold">2</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    表現
                  </span>
                  <span className="text-xs text-orange-700 font-medium">重要度: 中</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">より自然な言い回し</h3>
                <p className="text-gray-700 text-sm mb-3">
                  「携帯電話の一つです」より「小型の携帯端末です」の方がより正確
                </p>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-2">改善例:</p>
              <p className="text-gray-900 text-sm">
                スマートフォンというのは、<span className="bg-green-200 px-1 rounded">小型の携帯端末</span>です
              </p>
            </div>
          </div>

          {/* Issue 3 - Structure */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5">
            <div className="flex items-start gap-3 mb-3">
              <div className="bg-blue-500 rounded-xl px-2 py-1 flex-shrink-0">
                <span className="text-white text-xs font-bold">3</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    構成
                  </span>
                  <span className="text-xs text-blue-700 font-medium">重要度: 中</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">まとめの追加</h3>
                <p className="text-gray-700 text-sm">
                  最後に「だから便利です」のようなまとめがあるとより良い
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transcript Section */}
      <div className="px-6 pb-4">
        <button
          onClick={() => toggleSection('transcript')}
          className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl p-5 hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 uppercase">あなたの回答全文</h2>
            <ChevronDown
              className={`w-5 h-5 text-gray-500 transition-transform ${
                expandedSection === 'transcript' ? 'rotate-180' : ''
              }`}
            />
          </div>
        </button>
        {expandedSection === 'transcript' && (
          <div className="mt-3 bg-white border-2 border-gray-200 rounded-2xl p-5">
            <p className="text-gray-900 leading-relaxed">
              スマートフォンというのは、携帯電話の一つです。画面を指で
              <span className="bg-red-100 text-red-900 px-1 rounded mx-0.5 font-medium">触って</span>
              操作することができます。例えば、インターネットで調べ物をしたり、友達とメッセージを送ったり、写真を撮ったりすることができます。
            </p>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-2">色の意味:</p>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="bg-red-100 text-red-900 px-2 py-1 rounded-full">文法エラー</span>
                <span className="bg-orange-100 text-orange-900 px-2 py-1 rounded-full">表現改善</span>
                <span className="bg-blue-100 text-blue-900 px-2 py-1 rounded-full">構成</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Model Answer Section */}
      <div className="px-6 pb-4">
        <button
          onClick={() => toggleSection('model')}
          className="w-full bg-purple-50 border-2 border-purple-200 rounded-2xl p-5 hover:bg-purple-100 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lightbulb className="w-5 h-5 text-purple-600" />
              <h2 className="text-sm font-bold text-gray-900 uppercase">改善例を見る</h2>
            </div>
            <ChevronDown
              className={`w-5 h-5 text-gray-500 transition-transform ${
                expandedSection === 'model' ? 'rotate-180' : ''
              }`}
            />
          </div>
        </button>
        {expandedSection === 'model' && (
          <div className="mt-3 bg-white border-2 border-purple-200 rounded-2xl p-5">
            <p className="text-gray-900 leading-relaxed mb-4">
              スマートフォンというのは、<span className="bg-green-200 px-1 rounded">小型の携帯端末</span>
              です。画面を指で<span className="bg-green-200 px-1 rounded">触れて</span>
              操作することができます。例えば、インターネットで調べ物をしたり、友達とメッセージを送ったり、写真を撮ったりすることができます。
              <span className="bg-green-200 px-1 rounded">このように、いつでもどこでも使える便利な道具です。</span>
            </p>
            <div className="bg-green-50 rounded-xl p-4">
              <p className="text-xs text-green-700 font-medium">
                <span className="bg-green-200 px-1 rounded">ハイライト部分</span>が改善された箇所です
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Recommended Model */}
      <div className="px-6 pb-6">
        <button
          onClick={() => onNavigate('modelList')}
          className="w-full bg-blue-50 border-2 border-blue-200 rounded-2xl p-5 hover:bg-blue-100 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <div className="text-left">
                <h2 className="text-sm font-bold text-gray-900">説明モデルを復習</h2>
                <p className="text-xs text-gray-600">ステップ解説法を確認</p>
              </div>
            </div>
            <span className="text-blue-600 text-sm font-semibold">開く →</span>
          </div>
        </button>
      </div>

      {/* CTA Buttons */}
      <div className="px-6 space-y-3 sticky bottom-0 bg-white pt-4 pb-6 border-t border-gray-100">
        <button
          onClick={() => onNavigate('retry')}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-5 rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
          改善してもう一度挑戦
        </button>
        <button
          onClick={() => onNavigate('learnedBox')}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-md flex items-center justify-center gap-3 transition-colors"
        >
          結果を保存して学んだBOXへ
        </button>
        <button
          onClick={() => onNavigate('home')}
          className="w-full text-gray-600 font-semibold py-3 hover:text-gray-900"
        >
          ホームに戻る
        </button>
      </div>
    </div>
  );
}
