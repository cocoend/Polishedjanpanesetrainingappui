import { ArrowLeft, Target, Lightbulb, Mic, BookOpen, Sparkles } from 'lucide-react';

interface RetryScreenProps {
  onNavigate: (screen: string) => void;
  onGoBack: () => void;
}

export default function RetryScreen({ onNavigate, onGoBack }: RetryScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-green-50 pb-8">
      {/* Header */}
      <div className="px-6 pt-12 pb-6">
        <button
          onClick={onGoBack}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">戻る</span>
        </button>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">もう一度挑戦しよう！</h1>
        <p className="text-gray-600">今回は特にこの2つを意識してみましょう</p>
      </div>

      {/* Encouragement Card */}
      <div className="px-6 pb-6">
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl p-6 border-2 border-yellow-200">
          <div className="flex items-start gap-3">
            <div className="bg-yellow-400 rounded-xl p-2 flex-shrink-0">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 mb-2">前回より確実に良くなります！</h2>
              <p className="text-gray-700 text-sm leading-relaxed">
                最初の説明はとても良かったです。今回は少しだけ修正して、さらに上達しましょう。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Focus Points */}
      <div className="px-6 pb-6">
        <h2 className="text-sm font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
          <Target className="w-4 h-4 text-green-500" />
          今回の改善ポイント
        </h2>
        <div className="space-y-3">
          {/* Focus 1 */}
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <div className="bg-red-500 rounded-xl px-2.5 py-1 flex-shrink-0">
                <span className="text-white text-sm font-bold">1</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-2">助詞「を」の使い方</h3>
                <p className="text-gray-700 text-sm mb-3">
                  「画面を指で触って」→「画面を指で触れて」
                </p>
                <div className="bg-white rounded-xl p-3 border border-red-100">
                  <p className="text-xs text-gray-500 mb-1">こう言ってみよう:</p>
                  <p className="text-gray-900 font-medium text-sm">
                    画面を指で<span className="bg-green-200 px-1 rounded">触れて</span>操作します
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Focus 2 */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <div className="bg-blue-500 rounded-xl px-2.5 py-1 flex-shrink-0">
                <span className="text-white text-sm font-bold">2</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-2">まとめを追加する</h3>
                <p className="text-gray-700 text-sm mb-3">
                  最後に一言、「だから〜」でまとめましょう
                </p>
                <div className="bg-white rounded-xl p-3 border border-blue-100">
                  <p className="text-xs text-gray-500 mb-1">例:</p>
                  <p className="text-gray-900 font-medium text-sm">
                    <span className="bg-green-200 px-1 rounded">このように、いつでも使える便利な道具です</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Previous Transcript Reminder */}
      <div className="px-6 pb-6">
        <h2 className="text-sm font-bold text-gray-500 uppercase mb-3">前回の回答</h2>
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-5">
          <p className="text-gray-700 text-sm leading-relaxed">
            スマートフォンというのは、携帯電話の一つです。画面を指で触って操作することができます。例えば、インターネットで調べ物をしたり、友達とメッセージを送ったり、写真を撮ったりすることができます。
          </p>
        </div>
      </div>

      {/* Model Reference */}
      <div className="px-6 pb-6">
        <button
          onClick={() => onNavigate('modelList')}
          className="w-full bg-blue-50 border-2 border-blue-200 rounded-2xl p-5 hover:bg-blue-100 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <div className="text-left">
                <h2 className="text-sm font-bold text-gray-900">ステップ解説法を確認</h2>
                <p className="text-xs text-gray-600">構造をもう一度見る</p>
              </div>
            </div>
            <span className="text-blue-600 text-sm font-semibold">開く →</span>
          </div>
        </button>
      </div>

      {/* Quick Tips */}
      <div className="px-6 pb-6">
        <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-gray-900 text-sm mb-2">ちょっとしたコツ</h3>
              <ul className="space-y-1.5 text-sm text-gray-700">
                <li>• 前回の説明をベースに、2つのポイントだけ直せばOK</li>
                <li>• 完璧にしようとしなくて大丈夫です</li>
                <li>• リラックスして、自然に話しましょう</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="px-6 sticky bottom-0 bg-gradient-to-b from-transparent to-green-50 pt-8 pb-6">
        <button
          onClick={() => onNavigate('recording')}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-6 rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-colors"
        >
          <Mic className="w-6 h-6" />
          録音を開始する
        </button>
        <button
          onClick={() => onNavigate('feedback')}
          className="w-full mt-3 text-gray-600 font-semibold py-3 hover:text-gray-900"
        >
          フィードバックをもう一度見る
        </button>
      </div>
    </div>
  );
}
