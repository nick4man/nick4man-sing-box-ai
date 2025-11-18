import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="p-4 bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 shadow-lg text-center">
      <h1 className="text-xl md:text-2xl font-bold text-cyan-400">
        Помощник по настройке Sing-Box
      </h1>
      <p className="text-sm text-gray-400">Работает на Gemini AI</p>
    </header>
  );
};

export default Header;