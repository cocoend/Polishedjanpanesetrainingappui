import { useState } from 'react';
import HomeScreen from './components/HomeScreen';
import TopicSelectionScreen, { Topic } from './components/TopicSelectionScreen';
import ModelListScreen from './components/ModelListScreen';
import TopicDetailScreen from './components/TopicDetailScreen';
import RecordingScreen from './components/RecordingScreen';
import FeedbackScreen from './components/FeedbackScreen';
import RetryScreen from './components/RetryScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  return (
    <div className="size-full bg-white overflow-auto">
      <div className="max-w-md mx-auto">
        {currentScreen === 'home' && <HomeScreen onNavigate={setCurrentScreen} />}
        {currentScreen === 'topic' && (
          <TopicSelectionScreen onNavigate={setCurrentScreen} onSelectTopic={setSelectedTopic} />
        )}
        {currentScreen === 'modelList' && (
          <ModelListScreen onNavigate={setCurrentScreen} onSelectModel={setSelectedModel} />
        )}
        {currentScreen === 'topicDetail' && (
          <TopicDetailScreen
            onNavigate={setCurrentScreen}
            selectedModel={selectedModel}
            selectedTopic={selectedTopic}
          />
        )}
        {currentScreen === 'recording' && (
          <RecordingScreen
            onNavigate={setCurrentScreen}
            selectedModel={selectedModel}
            selectedTopic={selectedTopic}
          />
        )}
        {currentScreen === 'feedback' && <FeedbackScreen onNavigate={setCurrentScreen} />}
        {currentScreen === 'retry' && <RetryScreen onNavigate={setCurrentScreen} />}
      </div>
    </div>
  );
}