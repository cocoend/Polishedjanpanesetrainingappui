import { ArrowLeft, Mic, Square, RotateCcw, Send, BookOpen, Sparkles, HelpCircle } from 'lucide-react';
import { useState } from 'react';
import { Topic } from './TopicSelectionScreen';

interface RecordingScreenProps {
  onNavigate: (screen: string) => void;
  selectedModel?: string | null;
  selectedTopic?: Topic | null;
  onViewModelIntro?: (modelId: string) => void;
}

const modelNames: Record<string, string> = {
  prep: 'PREP法',
  stepbystep: 'ステップ解説法',
  scqa: 'SCQA法'
};

export default function RecordingScreen({ onNavigate, selectedModel, selectedTopic, onViewModelIntro }: RecordingScreenProps) {
  const [showModelTooltip, setShowModelTooltip] = useState(false);
  const [pressTimer, setPressTimer] = useState<NodeJS.Timeout | null>(null);

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
  const currentModelName = selectedModel ? modelNames[selectedModel] || 'ステップ解説法' : 'ステップ解説法';

  const handleHelpPress = () => {
    const timer = setTimeout(() => {
      setShowModelTooltip(true);
    }, 500);
    setPressTimer(timer);
  };

  const handleHelpRelease = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
    setShowModelTooltip(false);
  };

  const handleHelpClick = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
    if (showModelTooltip) {
      setShowModelTooltip(false);
    }
    if (onViewModelIntro) {
      onViewModelIntro(selectedModel || 'stepbystep');
    }
  };
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [hasRecorded, setHasRecorded] = useState(false);

  const handleRecordToggle = () => {
    if (isRecording) {
      setIsRecording(false);
      setHasRecorded(true);
      setTranscript('スマートフォンというのは、携帯電話の一つです。画面を指で触って操作することができます。例えば、インターネットで調べ物をしたり、友達とメッセージを送ったり、写真を撮ったりすることができます。');
    } else {
      setIsRecording(true);
      setRecordingTime(0);
      setTranscript('');
    }
  };

  const handleReset = () => {
    setIsRecording(false);
    setRecordingTime(0);
    setTranscript('');
    setHasRecorded(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-green-50 pb-8">
      {/* Header */}
      <div className="px-6 pt-12 pb-6">
        <button
          onClick={() => onNavigate('topicDetail')}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">戻る</span>
        </button>
        <h1 className="text-xl font-bold text-gray-900 mb-1">{topic.title}</h1>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className={`${topic.badge} text-white text-xs font-bold px-2.5 py-1 rounded-full`}>
            {topic.level}
          </span>
          <span>•</span>
          <span>{currentModelName}</span>
        </div>
      </div>

      {/* Model Reference Card */}
      <div className="px-6 pb-6">
        <div className="relative bg-blue-50 border-2 border-blue-200 rounded-2xl p-4">
          {/* Help Button */}
          <button
            onClick={handleHelpClick}
            onMouseDown={handleHelpPress}
            onMouseUp={handleHelpRelease}
            onMouseLeave={handleHelpRelease}
            onTouchStart={handleHelpPress}
            onTouchEnd={handleHelpRelease}
            className="absolute top-3 right-3 bg-white hover:bg-gray-50 rounded-full p-1.5 shadow-md border border-gray-200 transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-gray-600" />

            {/* Tooltip */}
            {showModelTooltip && (
              <div className="absolute top-full right-0 mt-2 bg-gray-900 text-white text-xs font-medium py-2 px-3 rounded-lg whitespace-nowrap z-10 shadow-xl">
                {currentModelName}とは？
                <div className="absolute -top-1 right-3 w-2 h-2 bg-gray-900 transform rotate-45"></div>
              </div>
            )}
          </button>

          <div className="flex items-center gap-3 pr-8">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <div className="text-left">
              <span className="font-bold text-gray-900 text-sm block">{currentModelName}</span>
              <span className="text-xs text-gray-600">説明モデルを参考に話そう</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Recording Area */}
      <div className="px-6 pb-6 flex flex-col items-center">
        {/* Timer */}
        <div className="mb-8">
          <div className="text-5xl font-bold text-gray-900 tabular-nums">
            {formatTime(isRecording ? 125 : recordingTime)}
          </div>
          <div className="text-center mt-2">
            {isRecording && (
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-red-600">録音中</span>
              </div>
            )}
            {!isRecording && hasRecorded && (
              <span className="text-sm font-medium text-gray-600">録音完了</span>
            )}
            {!isRecording && !hasRecorded && (
              <span className="text-sm font-medium text-gray-500">タップして録音開始</span>
            )}
          </div>
        </div>

        {/* Mic Button */}
        <button
          onClick={handleRecordToggle}
          className={`mb-6 relative group ${
            isRecording
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-gradient-to-br from-green-400 to-green-500 hover:from-green-500 hover:to-green-600'
          } w-32 h-32 rounded-full shadow-2xl transition-all transform active:scale-95`}
        >
          {isRecording ? (
            <Square className="w-16 h-16 text-white mx-auto fill-white" />
          ) : (
            <Mic className="w-16 h-16 text-white mx-auto" />
          )}

          {/* Pulse Animation */}
          {isRecording && (
            <>
              <div className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75"></div>
              <div className="absolute inset-0 rounded-full bg-red-400 animate-pulse opacity-50"></div>
            </>
          )}
        </button>

        {/* Encouragement */}
        {!isRecording && !hasRecorded && (
          <div className="text-center px-8">
            <p className="text-gray-600 leading-relaxed">
              リラックスして、自分の言葉で説明してみましょう！
            </p>
          </div>
        )}
      </div>

      {/* Live Transcript */}
      {(transcript || isRecording) && (
        <div className="px-6 pb-6">
          <div className="bg-white rounded-3xl p-6 border-2 border-gray-200 shadow-sm min-h-[160px]">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <h3 className="text-sm font-bold text-gray-500 uppercase">音声認識</h3>
            </div>
            {transcript ? (
              <p className="text-gray-900 leading-relaxed">{transcript}</p>
            ) : (
              <p className="text-gray-400 italic">話した内容がここに表示されます...</p>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="px-6 space-y-3">
        {hasRecorded && (
          <>
            <button
              onClick={() => onNavigate('feedback')}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-5 rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-colors"
            >
              <Send className="w-5 h-5" />
              AIフィードバックを受ける
            </button>
            <button
              onClick={handleReset}
              className="w-full bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              もう一度録音する
            </button>
          </>
        )}
      </div>

      {/* Tips */}
      {!isRecording && !hasRecorded && (
        <div className="px-6 pt-6">
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-2">💡 録音のコツ</h3>
            <ul className="space-y-1.5 text-sm text-gray-700">
              <li>• 静かな場所で録音しましょう</li>
              <li>• ゆっくり、はっきり話しましょう</li>
              <li>• 完璧である必要はありません</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
