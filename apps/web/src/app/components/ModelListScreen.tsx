import { ArrowLeft, ArrowRight, CheckCircle2, ListOrdered, MessageSquare, Lightbulb, HelpCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

import { getExplanationModels } from '../lib/api';
import { mapExplanationModelToCard } from '../lib/mappers';

interface ModelListScreenProps {
  onNavigate: (screen: string) => void;
  originScreen?: string;
  onSelectModel?: (modelId: string) => void;
  onViewIntro?: (modelId: string) => void;
}

const models = [
  {
    id: 'prep',
    name: 'PREP法',
    icon: CheckCircle2,
    structure: 'Point → Reason → Example → Point',
    useCase: '意見や主張を伝える時に最適',
    description: '結論から始めて、理由と例で補強する論理的な話し方',
    steps: ['結論', '理由', '具体例', 'まとめ'],
    features: [
      '説得力が高く、ビジネスシーンで信頼される',
      '結論が先にあるので、聞き手が理解しやすい',
      '具体例で補強するため、納得感が強い'
    ],
    suitableFor: [
      '面接での志望動機や自己PR',
      '意見や提案を述べる場面',
      '賛成・反対の理由を説明する',
      'ビジネスプレゼンテーション'
    ],
    color: 'from-green-400 to-emerald-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600'
  },
  {
    id: 'stepbystep',
    name: 'ステップ解説法',
    icon: ListOrdered,
    structure: '手順1 → 手順2 → 手順3 → 完成',
    useCase: 'プロセスや作り方を説明する時',
    description: '時系列で順序立てて、わかりやすく伝える',
    steps: ['第一段階', '第二段階', '第三段階', '完成'],
    features: [
      '手順や流れが明確で、相手が再現しやすい',
      '時系列順なので、混乱が少ない',
      '初心者でも使いやすい基本的な構造'
    ],
    suitableFor: [
      '料理や作業の手順説明',
      '道具や製品の使い方',
      '物事の仕組みやプロセス',
      '日常生活の説明'
    ],
    color: 'from-blue-400 to-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600'
  },
  {
    id: 'scqa',
    name: 'SCQA法',
    icon: Lightbulb,
    structure: 'Situation → Complication → Question → Answer',
    useCase: '問題解決や提案を説明する時',
    description: '状況を設定し、課題から解決策へ導く',
    steps: ['状況', '課題', '疑問', '答え'],
    features: [
      'ストーリー性があり、聞き手を引き込める',
      '問題意識を共有してから解決策を示す',
      'コンサルティングやビジネス提案に強い'
    ],
    suitableFor: [
      '問題解決の提案',
      'プロジェクトの背景説明',
      '改善案やアイデアの提示',
      '論理的な説明が求められる場面'
    ],
    color: 'from-purple-400 to-purple-500',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600'
  }
];

export default function ModelListScreen({ onNavigate, originScreen, onSelectModel, onViewIntro }: ModelListScreenProps) {
  const [hoveredModel, setHoveredModel] = useState<string | null>(null);
  const [pressTimer, setPressTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [apiModels, setApiModels] = useState(models);

  useEffect(() => {
    let isMounted = true;

    void getExplanationModels()
      .then((data) => {
        if (!isMounted) {
          return;
        }

        setApiModels(
          data.map((model) => {
            const mapped = mapExplanationModelToCard(model);
            const fallbackModel = models.find((item) => item.id === mapped.id) ?? models[0];

            return {
              ...fallbackModel,
              ...mapped,
            };
          }),
        );
      })
      .catch(() => {
        // Preserve the current prototype card content if the API is unavailable.
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelectModel = (modelId: string) => {
    if (onSelectModel) {
      onSelectModel(modelId);
    }
    onNavigate('topicDetail');
  };

  const handleHelpPress = (modelId: string) => {
    const timer = setTimeout(() => {
      setHoveredModel(modelId);
    }, 500);
    setPressTimer(timer);
  };

  const handleHelpRelease = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
    setHoveredModel(null);
  };

  const handleHelpClick = (modelId: string) => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
    if (hoveredModel === modelId) {
      setHoveredModel(null);
    }
    if (onViewIntro) {
      onViewIntro(modelId);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-8">
      {/* Header */}
      <div className="px-6 pt-12 pb-6">
        <button
          onClick={() => onNavigate(originScreen || 'home')}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">戻る</span>
        </button>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">説明モデルを選ぶ</h1>
        <p className="text-gray-600">話し方の型を使って、わかりやすく伝えよう</p>
      </div>

      {/* Info Card */}
      <div className="px-6 mb-6">
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-5">
          <div className="flex gap-3">
            <MessageSquare className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-gray-900 text-sm mb-1">モデルとは？</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                説明の「型」です。型に沿って話すことで、初めてのトピックでも整理された説明ができます。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Model Cards */}
      <div className="px-6 space-y-4">
        {apiModels.map((model) => {
          const Icon = model.icon;
          return (
            <div
              key={model.id}
              className={`${model.bgColor} rounded-3xl p-6 border-2 ${model.borderColor} shadow-md relative`}
            >
              {/* Help Button */}
              <div className="absolute top-4 right-4">
                <button
                  onClick={() => handleHelpClick(model.id)}
                  onMouseDown={() => handleHelpPress(model.id)}
                  onMouseUp={handleHelpRelease}
                  onMouseLeave={handleHelpRelease}
                  onTouchStart={() => handleHelpPress(model.id)}
                  onTouchEnd={handleHelpRelease}
                  className="relative bg-white hover:bg-gray-50 rounded-full p-2 shadow-md border border-gray-200 transition-colors"
                >
                  <HelpCircle className="w-5 h-5 text-gray-600" />

                  {/* Tooltip */}
                  {hoveredModel === model.id && (
                    <div className="absolute top-full right-0 mt-2 bg-gray-900 text-white text-xs font-medium py-2 px-3 rounded-lg whitespace-nowrap z-10 shadow-xl">
                      {model.name}とは？
                      <div className="absolute -top-1 right-3 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                    </div>
                  )}
                </button>
              </div>

              {/* Header */}
              <div className="flex items-start gap-4 mb-4 pr-8">
                <div className={`${model.iconBg} w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-7 h-7 ${model.iconColor}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{model.name}</h3>
                  <p className="text-sm text-gray-600">{model.useCase}</p>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-700 mb-4 leading-relaxed">{model.description}</p>

              {/* Structure Flow */}
              <div className="mb-5">
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">構造</h4>
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {model.steps.map((step, index) => (
                    <div key={index} className="flex items-center gap-2 flex-shrink-0">
                      <div className="bg-white rounded-xl px-4 py-2.5 border border-gray-200 shadow-sm">
                        <span className="text-sm font-bold text-gray-900">{step}</span>
                      </div>
                      {index < model.steps.length - 1 && (
                        <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div className="mb-5">
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">特徴</h4>
                <div className="bg-white rounded-2xl p-4 border border-gray-200">
                  <ul className="space-y-2">
                    {model.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-green-500 mt-0.5">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Suitable For */}
              <div className="mb-5">
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">適している説明</h4>
                <div className="flex flex-wrap gap-2">
                  {model.suitableFor.map((item, index) => (
                    <span
                      key={index}
                      className="bg-white px-3 py-2 rounded-full text-xs font-medium text-gray-700 border border-gray-200"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={() => handleSelectModel(model.id)}
                className={`w-full bg-gradient-to-r ${model.color} text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-shadow`}
              >
                このモデルを使う
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
