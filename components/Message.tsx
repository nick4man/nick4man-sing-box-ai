
import React from 'react';
import { ChatMessage, MessageSender } from '../types';
import CodeBlock from './CodeBlock';
import { AiIcon, UserIcon } from './icons';

interface MessageProps {
  message: ChatMessage;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const isUser = message.sender === MessageSender.USER;

  const parseContent = (content: string) => {
    const parts = content.split(/(```json\n[\s\S]*?\n```)/g);
    return parts.map((part, index) => {
      if (part.startsWith('```json')) {
        const code = part.replace(/^```json\n|```$/g, '');
        return <CodeBlock key={index} code={code} />;
      }
      // Replace newlines with <br> for proper rendering in HTML
      const textParts = part.split('\n').map((line, i) => (
        <React.Fragment key={i}>
          {line}
          {i < part.split('\n').length - 1 && <br />}
        </React.Fragment>
      ));
      return <p key={index} className="whitespace-pre-wrap">{textParts}</p>;
    });
  };

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center ${
          isUser ? 'bg-blue-600' : 'bg-gray-700'
        }`}
      >
        {isUser ? <UserIcon /> : <AiIcon />}
      </div>
      <div
        className={`max-w-xl lg:max-w-3xl rounded-lg px-4 py-3 shadow-md ${
          isUser ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-200'
        }`}
      >
        <div className="prose prose-invert max-w-none prose-p:my-0">
          {parseContent(message.content)}
        </div>
      </div>
    </div>
  );
};

export default Message;
