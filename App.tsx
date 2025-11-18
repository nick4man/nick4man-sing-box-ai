import React, { useState } from 'react';
import Header from './components/Header';
import ChatInterface from './components/ChatInterface';
import ConfigBuilder from './components/ConfigBuilder';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'builder'>('chat');

  const tabClasses = (tabName: 'chat' | 'builder') =>
    `px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 ${
      activeTab === tabName
        ? 'bg-cyan-600 text-white shadow-md'
        : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
    }`;

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100 font-sans">
      <Header />
      <div className="px-4 md:px-6 py-3 border-b border-gray-700 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
        <nav className="flex space-x-2 md:space-x-4" aria-label="Tabs">
          <button onClick={() => setActiveTab('chat')} className={tabClasses('chat')}>
            Чат
          </button>
          <button onClick={() => setActiveTab('builder')} className={tabClasses('builder')}>
            Конструктор
          </button>
        </nav>
      </div>
      <main className="flex-1 overflow-y-auto">
        {activeTab === 'chat' && <ChatInterface />}
        {activeTab === 'builder' && <ConfigBuilder />}
      </main>
    </div>
  );
};

export default App;
