import { useState, useCallback } from 'react';
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
  const [screenHistory, setScreenHistory] = useState<string[]>(['home']);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [modelIntroId, setModelIntroId] = useState<string>('prep');

  const navigateTo = useCallback((screen: string) => {
    setScreenHistory(prev => [...prev, screen]);
    setCurrentScreen(screen);
  }, []);

  const goBack = useCallback(() => {
    setScreenHistory(prev => {
      if (prev.length > 1) {
        const newHistory = prev.slice(0, -1);
        setCurrentScreen(newHistory[newHistory.length - 1]);
        return newHistory;
      }
      return prev;
    });
  }, []);

  return (
    <div className="size-full bg-white overflow-auto">
      <div className="max-w-md mx-auto">
        {currentScreen === 'home' && <HomeScreen onNavigate={navigateTo} onGoBack={goBack} />}
        {currentScreen === 'topic' && (
          <TopicSelectionScreen onNavigate={navigateTo} onSelectTopic={setSelectedTopic} onGoBack={goBack} />
        )}
        {currentScreen === 'modelList' && (
          <ModelListScreen
            onNavigate={navigateTo}
            onSelectModel={setSelectedModel}
            onViewIntro={(id) => {
              setModelIntroId(id);
              navigateTo('modelIntro');
            }}
            onGoBack={goBack}
          />
        )}
        {currentScreen === 'modelIntro' && (
          <ModelIntroScreen onNavigate={navigateTo} modelId={modelIntroId} onGoBack={goBack} />
        )}
        {currentScreen === 'topicDetail' && (
          <TopicDetailScreen
            onNavigate={navigateTo}
            selectedModel={selectedModel}
            selectedTopic={selectedTopic}
            onViewModelIntro={(id) => {
              setModelIntroId(id);
              navigateTo('modelIntro');
            }}
            onGoBack={goBack}
          />
        )}
        {currentScreen === 'recording' && (
          <RecordingScreen
            onNavigate={navigateTo}
            selectedModel={selectedModel}
            selectedTopic={selectedTopic}
            onViewModelIntro={(id) => {
              setModelIntroId(id);
              navigateTo('modelIntro');
            }}
            onGoBack={goBack}
          />
        )}
        {currentScreen === 'feedback' && <FeedbackScreen onNavigate={navigateTo} onGoBack={goBack} />}
        {currentScreen === 'retry' && <RetryScreen onNavigate={navigateTo} onGoBack={goBack} />}
        {currentScreen === 'learnedBox' && <LearnedBoxScreen onNavigate={navigateTo} onGoBack={goBack} />}
      </div>
    </div>
  );
}