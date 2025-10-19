import React, { useState } from 'react';
import { Code, Copy, Check, X } from 'lucide-react';
import { aiService } from '../../services/aiService';
import { useAuth } from '../../contexts/AuthContext';

interface CodeToolProps {
  onClose: () => void;
}

const CodeTool: React.FC<CodeToolProps> = ({ onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const languages = [
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin'
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await aiService.generateCode(prompt, language);
      setGeneratedCode(response.code || 'No code was generated. Please try again.');
    } catch (err) {
      console.error('Error generating code:', err);
      setError('Failed to generate code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!generatedCode) return;
    
    navigator.clipboard.writeText(generatedCode).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <Code className="w-5 h-5 text-blue-500" />
          <h2 className="text-xl font-semibold">Code Generator</h2>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close tool"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 flex flex-col space-y-4">
        <div>
          <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
            Language
          </label>
          <select
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          >
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang.charAt(0).toUpperCase() + lang.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 flex flex-col">
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-1">
            Describe the code you want to generate
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="E.g., A React component that displays a countdown timer"
            className="flex-1 w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
            rows={4}
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md">
            {error}
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              'Generate Code'
            )}
          </button>
        </div>

        {generatedCode && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-gray-700">Generated Code</h3>
              <button
                onClick={copyToClipboard}
                className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800"
                title="Copy to clipboard"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3 h-3 mr-1" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 mr-1" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <pre className="bg-gray-800 text-gray-100 p-4 rounded-md overflow-x-auto text-sm">
              <code>{generatedCode}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeTool;
