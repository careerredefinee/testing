import React, { useState, useRef } from 'react';
import { FileText, FileUp, X, FileDown, Loader2, Sparkles } from 'lucide-react';
import { aiService } from '../../services/aiService';

const analysisTypes = [
  { id: 'summary', name: 'Summary' },
  { id: 'key-points', name: 'Key Points' },
  { id: 'action-items', name: 'Action Items' },
  { id: 'sentiment', name: 'Sentiment Analysis' },
  { id: 'qa', name: 'Q&A' },
];

interface DocumentToolProps {
  onClose: () => void;
}

const DocumentTool: React.FC<DocumentToolProps> = ({ onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [analysisType, setAnalysisType] = useState('summary');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Check file type
      const validTypes = ['text/plain', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(txt|pdf|doc|docx)$/i)) {
        setError('Please upload a valid document (TXT, PDF, DOC, DOCX)');
        return;
      }
      
      // Check file size (5MB max)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size should be less than 5MB');
        return;
      }
      
      setFile(selectedFile);
      setError('');
      
      // Read text from file if it's a text file
      if (selectedFile.type === 'text/plain' || selectedFile.name.endsWith('.txt')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setText(e.target?.result as string);
        };
        reader.readAsText(selectedFile);
      } else {
        // For other file types, we'll just show the file name
        setText('');
      }
    }
  };

  const handleAnalyze = async () => {
    if (!file && !text.trim()) {
      setError('Please upload a document or enter text to analyze');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult('');

    try {
      let content = text;
      
      // If a file is uploaded but no text is entered, use the file
      if (file && !content) {
        // In a real implementation, you would upload the file to your server
          // and process it there, then get the text content
          // For now, we'll just show a message
          content = `[Content of ${file.name} would be analyzed]`;
      }
      
      // Call the AI service to analyze the document
      const response = await aiService.analyzeDocument(content, analysisType);
      const textResult = response?.data?.result || response?.result || '';
      setResult(textResult);
      setIsLoading(false);
      
    } catch (err) {
      console.error('Error analyzing document:', err);
      setError('Failed to analyze document. Please try again.');
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setText('');
    setResult('');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownload = () => {
    if (!result) return;
    
    const blob = new Blob([result], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `document-analysis-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-yellow-500" />
          <h2 className="text-xl font-semibold">Document Assistant</h2>
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
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Upload Document
          </label>
          <div className="flex items-center space-x-2">
            <label className="flex-1 flex flex-col items-center px-4 py-6 bg-white text-gray-600 rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-50">
              <FileUp className="w-8 h-8 mb-2 text-gray-400" />
              <span className="text-sm text-center">
                {file ? file.name : 'Click to upload or drag and drop'}
                <br />
                <span className="text-xs text-gray-500">TXT, PDF, DOC, DOCX (max 5MB)</span>
              </span>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept=".txt,.pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              />
            </label>
            {file && (
              <button
                onClick={handleClear}
                className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                title="Remove file"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <div className="relative">
          <label htmlFor="document-text" className="block text-sm font-medium text-gray-700 mb-1">
            Or enter text directly
          </label>
          <textarea
            id="document-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your document text here..."
            className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
            disabled={!!file || isLoading}
          />
          {!file && text && (
            <button
              onClick={() => setText('')}
              className="absolute top-8 right-2 p-1 text-gray-400 hover:text-gray-600"
              title="Clear text"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div>
          <label htmlFor="analysis-type" className="block text-sm font-medium text-gray-700 mb-1">
            Analysis Type
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
            {analysisTypes.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setAnalysisType(type.id)}
                className={`px-3 py-2 text-sm rounded-md ${
                  analysisType === type.id
                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
                disabled={isLoading}
              >
                {type.name}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md">
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-2">
          <button
            onClick={handleClear}
            disabled={isLoading || (!file && !text)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear
          </button>
          <button
            onClick={handleAnalyze}
            disabled={isLoading || (!file && !text.trim())}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Analyze Document
              </>
            )}
          </button>
        </div>

        {isLoading && !result && (
          <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
            <div className="text-center p-6">
              <div className="animate-pulse flex flex-col items-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                  <Loader2 className="w-6 h-6 text-yellow-600 animate-spin" />
                </div>
                <p className="text-gray-600">Analyzing document...</p>
                <p className="text-sm text-gray-500 mt-1">This may take a moment</p>
              </div>
            </div>
          </div>
        )}

        {result && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-700">
                {analysisTypes.find(t => t.id === analysisType)?.name} Results
              </h3>
              <button
                onClick={handleDownload}
                className="inline-flex items-center text-xs text-yellow-600 hover:text-yellow-800"
                title="Download results"
              >
                <FileDown className="w-3 h-3 mr-1" />
                Download
              </button>
            </div>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 whitespace-pre-wrap text-sm">
              {result}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentTool;
