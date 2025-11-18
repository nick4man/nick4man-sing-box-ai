import React, { useState } from 'react';
import { CheckIcon, CopyIcon } from './icons';

interface CodeBlockProps {
  code: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };
  
  // Attempt to format the JSON for better readability
  const formattedCode = (() => {
    try {
        return JSON.stringify(JSON.parse(code), null, 2);
    } catch {
        return code; // Return original code if it's not valid JSON
    }
  })();

  return (
    <div className="bg-gray-900/70 rounded-lg my-2 relative">
      <div className="flex justify-between items-center px-4 py-1 bg-gray-700/50 rounded-t-lg">
        <span className="text-xs font-sans text-gray-400">JSON</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-gray-300 hover:text-white transition-colors"
        >
          {isCopied ? <CheckIcon /> : <CopyIcon />}
          {isCopied ? 'Скопировано!' : 'Копировать'}
        </button>
      </div>
      <pre className="p-4 text-sm overflow-x-auto text-cyan-300">
        <code>{formattedCode}</code>
      </pre>
    </div>
  );
};

export default CodeBlock;