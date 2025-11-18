import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChatMessage, MessageSender } from '../types';
import { generateSingBoxConfig } from '../services/geminiService';
import Message from './Message';
import Spinner from './Spinner';
import { TrashIcon } from './icons';

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const savedMessages = localStorage.getItem('chatHistory');
      return savedMessages ? JSON.parse(savedMessages) : [];
    } catch (error) {
      console.error("Failed to parse chat history from localStorage", error);
      return [];
    }
  });
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    try {
        localStorage.setItem('chatHistory', JSON.stringify(messages));
    } catch (error) {
        console.error("Failed to save chat history to localStorage", error);
    }
  }, [messages]);
  
  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: MessageSender.USER,
      content: userInput,
    };

    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      const aiResponse = await generateSingBoxConfig(userInput);
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: MessageSender.AI,
        content: aiResponse,
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: MessageSender.AI,
        content: "Извините, произошла ошибка. Пожалуйста, попробуйте еще раз.",
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [userInput, isLoading]);

  const handleClearChat = () => {
    if (window.confirm('Вы уверены, что хотите очистить историю чата?')) {
        setMessages([]);
    }
  };


  return (
    <div className="flex flex-col h-full max-h-full">
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.map(msg => (
          <Message key={msg.id} message={msg} />
        ))}
        {isLoading && (
          <div className="flex justify-start items-center space-x-3">
             <div className="w-8 h-8 flex-shrink-0 bg-gray-700 rounded-full flex items-center justify-center">
               <Spinner />
             </div>
             <div className="p-3 bg-gray-800 rounded-lg">
                <div className="animate-pulse text-gray-400">Думаю...</div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 md:p-6 bg-gray-900 border-t border-gray-700">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
          <input
            type="text"
            value={userInput}
            onChange={e => setUserInput(e.target.value)}
            placeholder="Запросите конфигурацию sing-box или объяснение..."
            className="flex-1 bg-gray-800 border border-gray-600 rounded-full py-3 px-5 text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
            disabled={isLoading}
          />
          {messages.length > 0 && !isLoading && (
            <button
              type="button"
              onClick={handleClearChat}
              title="Очистить чат"
              className="p-3 text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-full transition-colors duration-200"
            >
              <TrashIcon />
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading || !userInput.trim()}
            className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-full transition-colors duration-200"
          >
            Отправить
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;