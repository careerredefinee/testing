import React, { useState } from 'react';
import { Image as ImageIcon, Download, X, Sparkles } from 'lucide-react';
import { aiService } from '../../services/aiService';

interface ImageToolProps {
  onClose: () => void;
}

const styles = [
  'realistic', 'digital art', 'pixel art', '3D render', 'watercolor', 
  'oil painting', 'anime', 'cyberpunk', 'minimalist', 'surreal'
];

const ImageTool: React.FC<ImageToolProps> = ({ onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('realistic');
  const [generatedImage, setGeneratedImage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a description');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // In a real implementation, you would call the AI service
      // const response = await aiService.generateImage(prompt, style);
      // setGeneratedImage(response.imageUrl);
      
      // For demo purposes, we'll simulate a response
      setTimeout(() => {
        setGeneratedImage(`https://source.unsplash.com/random/512x512/?${encodeURIComponent(prompt)}`);
        setIsLoading(false);
      }, 1500);
    } catch (err) {
      console.error('Error generating image:', err);
      setError('Failed to generate image. Please try again.');
      setIsLoading(false);
    }
  };

  const downloadImage = () => {
    if (!generatedImage) return;
    
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `ai-generated-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <ImageIcon className="w-5 h-5 text-purple-500" />
          <h2 className="text-xl font-semibold">Image Generator</h2>
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
          <label htmlFor="style" className="block text-sm font-medium text-gray-700 mb-1">
            Style
          </label>
          <select
            id="style"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
            disabled={isLoading}
          >
            {styles.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 flex flex-col">
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-1">
            Describe the image you want to generate
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="E.g., A serene landscape with mountains and a lake at sunset"
            className="flex-1 w-full p-3 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
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
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Image
              </>
            )}
          </button>
        </div>

        {isLoading && !generatedImage && (
          <div className="flex-1 flex items-center justify-center bg-gray-100 rounded-lg">
            <div className="text-center p-6">
              <div className="animate-pulse flex flex-col items-center">
                <div className="w-16 h-16 bg-purple-200 rounded-full flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-purple-600" />
                </div>
                <p className="text-gray-600">Creating your image...</p>
                <p className="text-sm text-gray-500 mt-2">This may take a moment</p>
              </div>
            </div>
          </div>
        )}

        {generatedImage && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-gray-700">Generated Image</h3>
              <button
                onClick={downloadImage}
                className="inline-flex items-center px-3 py-1 text-xs font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <Download className="w-3 h-3 mr-1" />
                Download
              </button>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
              <img
                src={generatedImage}
                alt="AI Generated"
                className="w-full h-auto"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiB2aWV3Qm94PSIwIDAgNTEyIDUxMiI+PHJlY3Qgd2lkdGg9IjUxMiIgaGVpZ2h0PSI1MTIiIGZpbGw9IiNlNWU1ZTUiLz48cGF0aCBkPSJNMjU2IDQ4QzE0MS4xIDQ4IDQ4IDE0MS4xIDQ4IDI1NnM5My4xIDIwOCAyMDggMjA4IDIwOC05My4xIDIwOC0yMDhTMzcwLjkgNDggMjU2IDQ4em0wIDM4NGMtOTcuMSAwLTE3Ni03OC45LTE3Ni0xNzZzNzguOS0xNzYgMTc2LTE3NiAxNzYgNzguOSAxNzYgMTc2LTc4LjkgMTc2LTE3NiAxNzZ6IiBmaWxsPSIjY2NjIi8+PHBhdGggZD0iTTI1NiAxMjhjLTcwLjcgMC0xMjggNTcuMy0xMjggMTI4czU3LjMgMTI4IDEyOCAxMjggMTI4LTU3LjMgMTI4LTEyOC01Ny4zLTEyOC0xMjgtMTI4em0wIDIyNGMtNTMgMC05Ni00My05Ni05NnM0My05NiA5Ni05NiA5NiA0MyA5NiA5Ni00MyA5Ni05NiA5NnoiIGZpbGw9IiNlNWU1ZTUiLz48L3N2Zz4=';
                }}
              />
            </div>
            <p className="mt-2 text-xs text-gray-500 text-center">
              AI-generated image based on: "{prompt}" in {style} style
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageTool;
