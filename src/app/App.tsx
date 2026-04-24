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

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [modelIntroId, setModelIntroId] = useState<string>('prep');
  const [previousScreen, setPreviousScreen] = useState<string>('home');
  const [modelListOrigin, setModelListOrigin] = useState<string>('home');

  const navigateToScreen = (newScreen: string) => {
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
        {currentScreen === 'home' && <HomeScreen onNavigate={navigateToScreen} />}
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
            onViewModelIntro={(id) => {
              setModelIntroId(id);
              navigateToScreen('modelIntro');
            }}
          />
        )}
        {currentScreen === 'feedback' && <FeedbackScreen onNavigate={navigateToScreen} />}
        {currentScreen === 'retry' && <RetryScreen onNavigate={navigateToScreen} />}
        {currentScreen === 'learnedBox' && <LearnedBoxScreen onNavigate={navigateToScreen} />}
      </div>
    </div>
  );
}