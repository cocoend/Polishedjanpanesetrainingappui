import { ArrowLeft, Target, Lightbulb, MessageSquare, BookOpen, Mic, CheckCircle2, ListOrdered } from 'lucide-react';
import { Topic } from './TopicSelectionScreen';

interface TopicDetailScreenProps {
  onNavigate: (screen: string) => void;
  selectedModel?: string | null;
  selectedTopic?: Topic | null;
}

const modelData: Record<string, {
  name: string;
  description: string;
  steps: string[];
  color: string;
  iconComponent: typeof CheckCircle2;
}> = {
  prep: {
    name: 'PREP法',
    description: '結論から始めて理由と例で補強する',
    steps: ['結論', '理由', '具体例', 'まとめ'],
    color: 'bg-green-50 border-green-200',
    iconComponent: CheckCircle2
  },
  stepbystep: {
    name: 'ステップ解説法',
    description: '順序立てて説明する',
    steps: ['第一段階', '第二段階', '第三段階', '完成'],
    color: 'bg-blue-50 border-blue-200',
    iconComponent: ListOrdered
  },
  scqa: {
    name: 'SCQA法',
    description: '状況から課題、解決策へ導く',
    steps: ['状況', '課題', '疑問', '答え'],
    color: 'bg-purple-50 border-purple-200',
    iconComponent: Lightbulb
  }
};

export default function TopicDetailScreen({ onNavigate, selectedModel, selectedTopic }: TopicDetailScreenProps) {
  // デフォルト主題
  const defaultTopic: Topic = {
    id: 0,
    level: '初級',
    category: 'object',
    title: 'スマートフォンを説明する',
    description: '身近なものから始めよう',
    time: '5分',
    difficulty: '★☆☆',
    tags: ['日常会話'],
    color: 'bg-green-50 border-green-200',
    badge: 'bg-green-500'
  };

  const topic = selectedTopic || defaultTopic;

  // デフォルトはステップ解説法
  const currentModelId = selectedModel || 'stepbystep';
  const currentModel = modelData[currentModelId] || modelData.stepbystep;
  const ModelIcon = currentModel.iconComponent;
  return (
    <div className="min-h-screen bg-white pb-8">
      {/* Header */}
      <div className="px-6 pt-12 pb-6 sticky top-0 bg-white z-10 border-b border-gray-100">
        <button
          onClick={() => onNavigate('topic')}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">戻る</span>
        </button>
        <div className="flex items-center gap-3 mb-2">
          <span className={`${topic.badge} text-white text-xs font-bold px-3 py-1 rounded-full`}>
            {topic.level}
          </span>
          <span className="text-gray-500 text-sm">⏱️ {topic.time}</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{topic.title}</h1>
      </div>

      {/* Goal Card */}
      <div className="px-6 pt-6 pb-4">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-6 border-2 border-green-200">
          <div className="flex items-start gap-3 mb-3">
            <div className="bg-green-500 rounded-xl p-2">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 mb-1">説明の目標</h2>
              <p className="text-gray-700 leading-relaxed">
                日本語を知らない人に、スマートフォンとは何か、何ができるのかを伝えましょう
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Model */}
      <div className="px-6 pb-4">
        <h2 className="text-sm font-bold text-gray-500 uppercase mb-3">おすすめモデル</h2>
        <div className={`${currentModel.color} border-2 rounded-2xl p-5`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`${
                currentModelId === 'prep' ? 'bg-green-500' :
                currentModelId === 'scqa' ? 'bg-purple-500' : 'bg-blue-500'
              } rounded-xl p-2`}>
                <ModelIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{currentModel.name}</h3>
                <p className="text-sm text-gray-600">{currentModel.description}</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('modelList')}
              className={`${
                currentModelId === 'prep' ? 'text-green-600' :
                currentModelId === 'scqa' ? 'text-purple-600' : 'text-blue-600'
              } text-sm font-semibold`}
            >
              変更
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {currentModel.steps.map((step, i) => (
              <span
                key={i}
                className="bg-white px-3 py-1.5 rounded-full text-xs font-medium text-gray-700 whitespace-nowrap"
              >
                {i + 1}. {step}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Keywords */}
      <div className="px-6 pb-4">
        <h2 className="text-sm font-bold text-gray-500 uppercase mb-3">使うと良いキーワード</h2>
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-5">
          <div className="flex flex-wrap gap-2">
            <span className="bg-yellow-100 text-yellow-900 px-4 py-2 rounded-full text-sm font-medium border border-yellow-200">
              携帯電話
            </span>
            <span className="bg-yellow-100 text-yellow-900 px-4 py-2 rounded-full text-sm font-medium border border-yellow-200">
              画面
            </span>
            <span className="bg-yellow-100 text-yellow-900 px-4 py-2 rounded-full text-sm font-medium border border-yellow-200">
              インターネット
            </span>
            <span className="bg-yellow-100 text-yellow-900 px-4 py-2 rounded-full text-sm font-medium border border-yellow-200">
              アプリ
            </span>
            <span className="bg-yellow-100 text-yellow-900 px-4 py-2 rounded-full text-sm font-medium border border-yellow-200">
              便利
            </span>
          </div>
        </div>
      </div>

      {/* Useful Expressions */}
      <div className="px-6 pb-4">
        <h2 className="text-sm font-bold text-gray-500 uppercase mb-3">役立つ表現</h2>
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-start gap-3">
            <MessageSquare className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
            <div>
              <p className="text-gray-900 font-medium">〜というのは...</p>
              <p className="text-gray-600 text-sm">定義を説明する</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MessageSquare className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
            <div>
              <p className="text-gray-900 font-medium">例えば、〜</p>
              <p className="text-gray-600 text-sm">具体例を出す</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MessageSquare className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
            <div>
              <p className="text-gray-900 font-medium">〜ができます</p>
              <p className="text-gray-600 text-sm">機能を説明する</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="px-6 pb-6">
        <h2 className="text-sm font-bold text-gray-500 uppercase mb-3">ヒント</h2>
        <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-5">
          <div className="flex gap-3">
            <Lightbulb className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-2 text-sm text-gray-700 leading-relaxed">
              <p>• 最初に「スマートフォンとは何か」を一言で説明しよう</p>
              <p>• 次に、どんなことができるか2〜3個例を挙げよう</p>
              <p>• 最後に、なぜ便利なのかをまとめよう</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="px-6 sticky bottom-0 bg-white pt-4 pb-6 border-t border-gray-100">
        <button
          onClick={() => onNavigate('recording')}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-5 rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-colors"
        >
          <Mic className="w-6 h-6" />
          録音を開始する
        </button>
        <button
          onClick={() => onNavigate('modelList')}
          className="w-full mt-3 text-gray-600 font-semibold py-3 hover:text-gray-900"
        >
          説明モデルを見る
        </button>
      </div>
    </div>
  );
}
