import { useState } from 'react';
import HomeScreen from './components/HomeScreen';
import TopicSelectionScreen, { Topic } from './components/TopicSelectionScreen';
import ModelListScreen from './components/ModelListScreen';
import ModelIntroScreen from './components/ModelIntroScreen';
import TopicDetailScreen from './components/TopicDetailScreen';
import RecordingScreen from './components/RecordingScreen';
import FeedbackScreen from './components/FeedbackScreen';
import RetryScreen from './components/RetryScreen';
import LearnedBoxScreen from './components/LearnedBoxScreen';
import { createAttempt, createAttemptUpload, createSession } from './lib/api';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [modelIntroId, setModelIntroId] = useState<string>('prep');
  const [previousScreen, setPreviousScreen] = useState<string>('home');
  const [modelListOrigin, setModelListOrigin] = useState<string>('home');
  const [unreadLearnedBoxCount, setUnreadLearnedBoxCount] = useState<number>(0);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [activeSessionThemeId, setActiveSessionThemeId] = useState<string | null>(null);
  const [activeSessionModelId, setActiveSessionModelId] = useState<string | null>(null);
  const [activeAttemptId, setActiveAttemptId] = useState<string | null>(null);
  const [latestTranscriptText, setLatestTranscriptText] = useState<string>('');

  const resumeSession = (input: {
    sessionId: string;
    topic: Topic;
    selectedModelId: string | null;
  }) => {
    setSelectedTopic(input.topic);
    setSelectedModel(input.selectedModelId);
    setActiveSessionId(input.sessionId);
    setActiveSessionThemeId(input.topic.id);
    setActiveSessionModelId(input.selectedModelId);
    setPreviousScreen(currentScreen);
    setCurrentScreen('recording');
  };

  const navigateToScreen = async (newScreen: string) => {
    if (newScreen === 'recording' && selectedTopic?.id) {
      const effectiveModelId = selectedModel ?? 'stepbystep';
      const canReuseActiveSession =
        activeSessionId &&
        activeSessionThemeId === selectedTopic.id &&
        activeSessionModelId === effectiveModelId;

      if (!canReuseActiveSession) {
        try {
          const session = await createSession({
            themeId: selectedTopic.id,
            selectedModelId: effectiveModelId,
          });

          setActiveSessionId(session.id);
          setActiveSessionThemeId(session.themeId);
          setActiveSessionModelId(session.selectedModelId);
        } catch {
          // Keep the current prototype navigation behavior even if the API is unavailable.
        }
      }
    }

    setPreviousScreen(currentScreen);

    // モデル選択画面に遷移する時、起点を記録（モデル詳細から戻る場合を除く）
    if (newScreen === 'modelList' && currentScreen !== 'modelIntro') {
      setModelListOrigin(currentScreen);
    }

    setCurrentScreen(newScreen);
  };

  return (
    <div className="size-full bg-white overflow-auto">
      <div className="max-w-md mx-auto">
        {currentScreen === 'home' && (
          <HomeScreen
            onNavigate={navigateToScreen}
            onSelectTopic={setSelectedTopic}
            onResumeSession={resumeSession}
            unreadLearnedBoxCount={unreadLearnedBoxCount}
          />
        )}
        {currentScreen === 'topic' && (
          <TopicSelectionScreen onNavigate={navigateToScreen} onSelectTopic={setSelectedTopic} />
        )}
        {currentScreen === 'modelList' && (
          <ModelListScreen
            onNavigate={navigateToScreen}
            originScreen={modelListOrigin}
            onSelectModel={setSelectedModel}
            onViewIntro={(id) => {
              setModelIntroId(id);
              navigateToScreen('modelIntro');
            }}
          />
        )}
        {currentScreen === 'modelIntro' && (
          <ModelIntroScreen
            onNavigate={navigateToScreen}
            previousScreen={previousScreen}
            modelId={modelIntroId}
          />
        )}
        {currentScreen === 'topicDetail' && (
          <TopicDetailScreen
            onNavigate={navigateToScreen}
            selectedModel={selectedModel}
            selectedTopic={selectedTopic}
            onViewModelIntro={(id) => {
              setModelIntroId(id);
              navigateToScreen('modelIntro');
            }}
          />
        )}
        {currentScreen === 'recording' && (
          <RecordingScreen
            onNavigate={navigateToScreen}
            selectedModel={selectedModel}
            selectedTopic={selectedTopic}
            activeSessionId={activeSessionId}
            onSubmitAttempt={async (payload) => {
              if (!activeSessionId) {
                navigateToScreen('feedback');
                return;
              }

              try {
                const attempt = payload.audioFile
                  ? await createAttemptUpload(activeSessionId, {
                      audio: payload.audioFile,
                      audioDurationSec: payload.audioDurationSec,
                    })
                  : await createAttempt(activeSessionId, {
                      transcriptText: payload.transcriptText,
                      audioMimeType: payload.audioMimeType,
                      audioDurationSec: payload.audioDurationSec,
                      audioFileSizeBytes: payload.audioFileSizeBytes,
                    });
                setActiveAttemptId(attempt.id);
                setLatestTranscriptText(attempt.transcriptText);
              } catch {
                // Keep the prototype flow even if the API is unavailable.
              }

              navigateToScreen('feedback');
            }}
            onViewModelIntro={(id) => {
              setModelIntroId(id);
              navigateToScreen('modelIntro');
            }}
          />
        )}
        {currentScreen === 'feedback' && (
          <FeedbackScreen
            onNavigate={navigateToScreen}
            latestTranscriptText={latestTranscriptText}
            activeAttemptId={activeAttemptId}
            activeSessionId={activeSessionId}
            onSaveToLearnedBox={() => setUnreadLearnedBoxCount(prev => prev + 1)}
          />
        )}
        {currentScreen === 'retry' && (
          <RetryScreen
            onNavigate={navigateToScreen}
            activeSessionId={activeSessionId}
          />
        )}
        {currentScreen === 'learnedBox' && (
          <LearnedBoxScreen
            onNavigate={navigateToScreen}
            onMarkAsRead={() => setUnreadLearnedBoxCount(0)}
          />
        )}
      </div>
    </div>
  );
}
