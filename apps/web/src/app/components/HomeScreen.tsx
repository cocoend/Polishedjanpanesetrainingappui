import { Flame, Star, Play, BookOpen, TrendingUp, Archive } from 'lucide-react';
import { useEffect, useState } from 'react';

import type { HomeResponseDto } from '@polished/shared';

import { getHome } from '../lib/api';
import { mapThemeListItemToTopic } from '../lib/mappers';
import { Topic } from './TopicSelectionScreen';

interface HomeScreenProps {
  onNavigate: (screen: string) => void;
  onSelectTopic?: (topic: Topic) => void;
  onResumeSession?: (input: {
    sessionId: string;
    topic: Topic;
    selectedModelId: string | null;
  }) => void;
  unreadLearnedBoxCount?: number;
  refreshKey?: number;
}

export default function HomeScreen({
  onNavigate,
  onSelectTopic,
  onResumeSession,
  unreadLearnedBoxCount = 0,
  refreshKey = 0,
}: HomeScreenProps) {
  // 今日のおすすめトピック
  const recommendedTopic: Topic = {
    id: 'theme-default',
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
  const [homeData, setHomeData] = useState<HomeResponseDto | null>(null);

  useEffect(() => {
    let isMounted = true;

    void getHome()
      .then((response) => {
        if (!isMounted) {
          return;
        }

        setHomeData(response);
      })
      .catch(() => {
        // Preserve the current prototype experience if the home API is unavailable.
      });

    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  const effectiveRecommendedTopic = homeData?.recommendedTheme
    ? mapThemeListItemToTopic(homeData.recommendedTheme)
    : recommendedTopic;
  const continueTopic = homeData?.continueTheme ? mapThemeListItemToTopic(homeData.continueTheme) : null;
  const effectiveUnreadCount = Math.max(
    unreadLearnedBoxCount,
    homeData?.unreadLearnedCardCount ?? 0,
  );
  const streakDays = homeData?.streakDays ?? 0;
  const latestScore = homeData?.latestScore ?? 65;
  const weakPoints = homeData?.weakPoints?.length
    ? homeData.weakPoints.slice(0, 3)
    : ['接続詞の使い方', '比較表現', '理由の説明'];

  const handleStartPractice = () => {
    if (onSelectTopic) {
      onSelectTopic(effectiveRecommendedTopic);
    }
    onNavigate('topicDetail');
  };

  const handleContinuePractice = () => {
    if (
      continueTopic &&
      homeData?.continueSessionId &&
      onResumeSession
    ) {
      onResumeSession({
        sessionId: homeData.continueSessionId,
        topic: continueTopic,
        selectedModelId: homeData.continueSelectedModelId,
      });
      return;
    }

    onNavigate('topic');
  };
  return (
    <div className="min-h-screen bg-white pb-8">
      {/* Header */}
      <div className="px-6 pt-12 pb-6">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">おはよう!</h1>
            <p className="text-gray-600">今日も説明の練習を頑張ろう</p>
          </div>
          <button
            onClick={() => onNavigate('learnedBox')}
            className="bg-gray-100 hover:bg-gray-200 rounded-2xl p-3 transition-colors relative"
          >
            <Archive className="w-6 h-6 text-gray-700" />
            {effectiveUnreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                {effectiveUnreadCount > 9 ? '9+' : effectiveUnreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Streak Card */}
      <div className="px-6 mb-6">
        <div className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-3xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Flame className="w-8 h-8" />
              <span className="text-3xl font-bold">{streakDays}日連続</span>
            </div>
            <Star className="w-6 h-6 fill-white" />
          </div>
          <p className="text-orange-100 text-sm">
            {streakDays > 0 ? '今日も説明練習の流れを続けましょう' : '最初の練習を始めて連続記録を作りましょう'}
          </p>
        </div>
      </div>

      {/* Today's Practice */}
      <div className="px-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3">今日のおすすめ</h2>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-6 border-2 border-green-200 shadow-md">
          <div className="flex items-start justify-between mb-3">
            <div>
              <span className="inline-block bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-2">
                {effectiveRecommendedTopic.level}
              </span>
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {effectiveRecommendedTopic.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {homeData?.recommendReason ?? effectiveRecommendedTopic.description}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
            <span className="bg-white px-3 py-1 rounded-full">⏱️ {effectiveRecommendedTopic.time}</span>
            <span className="bg-white px-3 py-1 rounded-full">💬 {effectiveRecommendedTopic.tags[0] ?? '日常会話'}</span>
          </div>
          <button
            onClick={handleStartPractice}
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
            <h3 className="font-bold text-gray-900">{continueTopic?.title ?? '面接での自己紹介'}</h3>
            <span className="text-xs text-blue-600 font-semibold">
              {homeData?.continueProgressPercent ?? latestScore}%
            </span>
          </div>
          <div className="w-full bg-white rounded-full h-2 mb-3">
            <div
              className="bg-blue-500 h-2 rounded-full"
              style={{ width: `${homeData?.continueProgressPercent ?? latestScore}%` }}
            ></div>
          </div>
          <button
            onClick={handleContinuePractice}
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
          {weakPoints.map((point, index) => {
            const colorStyles = [
              'bg-yellow-100 text-yellow-800 border-yellow-200',
              'bg-pink-100 text-pink-800 border-pink-200',
              'bg-purple-100 text-purple-800 border-purple-200',
            ][index] ?? 'bg-gray-100 text-gray-800 border-gray-200';

            return (
              <span
                key={point}
                className={`${colorStyles} px-4 py-2 rounded-full text-sm font-medium border`}
              >
                {point}
              </span>
            );
          })}
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
