import React, { useState, useRef } from 'react';
import { Video, Play, Pause, Volume2, VolumeX, Download, X, Sparkles, Image as ImageIcon } from 'lucide-react';

const videoStyles = [
  'Realistic', 'Animated', '3D Render', 'Cinematic', 'Cartoon',
  'Watercolor', 'Oil Painting', 'Sketch', 'Pixel Art', 'Cyberpunk'
];

const videoAspects = [
  { value: '16:9', label: 'Widescreen (16:9)' },
  { value: '9:16', label: 'Portrait (9:16)' },
  { value: '1:1', label: 'Square (1:1)' },
  { value: '4:3', label: 'Standard (4:3)' },
  { value: '21:9', label: 'Cinematic (21:9)' }
];

const videoDurations = [
  { value: 5, label: '5 seconds' },
  { value: 15, label: '15 seconds' },
  { value: 30, label: '30 seconds' },
  { value: 60, label: '1 minute' },
  { value: 120, label: '2 minutes' }
];

interface VideoToolProps {
  onClose: () => void;
}

const VideoTool: React.FC<VideoToolProps> = ({ onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('Realistic');
  const [selectedAspect, setSelectedAspect] = useState('16:9');
  const [selectedDuration, setSelectedDuration] = useState(15);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPEG, PNG, etc.)');
      return;
    }

    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const togglePlay = () => {
    if (!generatedVideo) return;
    
    if (isPlaying) {
      videoRef.current?.pause();
    } else {
      videoRef.current?.play().catch(err => {
        console.error('Error playing video:', err);
        setError('Failed to play video. Please try again.');
      });
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const generateVideo = async () => {
    if (!prompt.trim() && !uploadedImage) {
      setError('Please provide a description or upload an image');
      return;
    }

    setIsGenerating(true);
    setError('');
    setGeneratedVideo(null);
    setIsPlaying(false);

    try {
      // In a real implementation, you would call the AI service
      // const response = await aiService.generateVideo({
      //   prompt,
      //   style: selectedStyle,
      //   aspectRatio: selectedAspect,
      //   duration: selectedDuration,
      //   image: uploadedImage
      // });
      // setGeneratedVideo(response.videoUrl);
      
      // For demo purposes, we'll simulate a response
      setTimeout(() => {
        // This is a placeholder video URL - in a real app, this would be the URL from your API
        setGeneratedVideo('https://samplelib.com/lib/preview/mp4/sample-5s.mp4');
        setIsGenerating(false);
      }, 5000);
      
    } catch (err) {
      console.error('Error generating video:', err);
      setError('Failed to generate video. Please try again.');
      setIsGenerating(false);
    }
  };

  const downloadVideo = () => {
    if (!generatedVideo) return;
    
    const link = document.createElement('a');
    link.href = generatedVideo;
    link.download = `ai-video-${new Date().getTime()}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetForm = () => {
    setPrompt('');
    setSelectedStyle('Realistic');
    setSelectedAspect('16:9');
    setSelectedDuration(15);
    setUploadedImage(null);
    setError('');
    setGeneratedVideo(null);
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getAspectRatioClass = () => {
    switch (selectedAspect) {
      case '16:9': return 'aspect-video';
      case '9:16': return 'aspect-[9/16]';
      case '1:1': return 'aspect-square';
      case '4:3': return 'aspect-[4/3]';
      case '21:9': return 'aspect-[21/9]';
      default: return 'aspect-video';
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <Video className="w-5 h-5 text-red-500" />
          <h2 className="text-xl font-semibold">Video Generator</h2>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close tool"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 flex flex-col space-y-4 overflow-y-auto">
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-1">
            Describe the video you want to create
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="E.g., A serene mountain lake at sunrise with birds flying over the water"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
            rows={3}
            disabled={isGenerating}
          />
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Style</label>
              <select
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                disabled={isGenerating}
              >
                {videoStyles.map(style => (
                  <option key={style} value={style}>{style}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Aspect Ratio</label>
              <select
                value={selectedAspect}
                onChange={(e) => setSelectedAspect(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                disabled={isGenerating}
              >
                {videoAspects.map(aspect => (
                  <option key={aspect.value} value={aspect.value}>{aspect.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
            <select
              value={selectedDuration}
              onChange={(e) => setSelectedDuration(Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
              disabled={isGenerating}
            >
              {videoDurations.map(duration => (
                <option key={duration.value} value={duration.value}>{duration.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Upload an image for reference (optional)
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              {uploadedImage ? (
                <div className="relative">
                  <img src={uploadedImage} alt="Uploaded" className="mx-auto max-h-40 rounded-md" />
                  <button
                    type="button"
                    onClick={() => setUploadedImage(null)}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex justify-center">
                    <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                  </div>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-red-600 hover:text-red-500 focus-within:outline-none"
                    >
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        onChange={handleImageUpload}
                        accept="image/*"
                        ref={fileInputRef}
                        disabled={isGenerating}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md">
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-2 pt-2">
          <button
            onClick={resetForm}
            disabled={isGenerating}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reset
          </button>
          <button
            onClick={generateVideo}
            disabled={isGenerating || (!prompt && !uploadedImage)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
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
                Generate Video
              </>
            )}
          </button>
        </div>

        {isGenerating && !generatedVideo && (
          <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-200 my-4">
            <div className="text-center p-6">
              <div className="animate-pulse flex flex-col items-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <Video className="w-8 h-8 text-red-600" />
                </div>
                <p className="text-gray-600">Generating your video...</p>
                <p className="text-sm text-gray-500 mt-1">This may take a few minutes</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4 max-w-xs">
                  <div className="bg-red-600 h-2.5 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {generatedVideo && (
          <div className="mt-4 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-700">Your Generated Video</h3>
              <div className="flex space-x-2">
                <button
                  onClick={toggleMute}
                  className="p-2 text-gray-600 hover:text-gray-800"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <button
                  onClick={downloadVideo}
                  className="p-2 text-gray-600 hover:text-gray-800"
                  title="Download"
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className={`${getAspectRatioClass()} bg-black rounded-lg overflow-hidden relative`}>
              <video
                ref={videoRef}
                src={generatedVideo}
                className="w-full h-full object-cover"
                loop
                muted={isMuted}
                onClick={togglePlay}
              />
              
              {!isPlaying && (
                <button
                  onClick={togglePlay}
                  className="absolute inset-0 flex items-center justify-center w-full h-full bg-black bg-opacity-30 focus:outline-none"
                  aria-label="Play video"
                >
                  <div className="w-16 h-16 bg-red-600 bg-opacity-80 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all">
                    <Play className="w-8 h-8 text-white ml-1" />
                  </div>
                </button>
              )}
              
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={togglePlay}
                      className="w-8 h-8 rounded-full bg-white bg-opacity-20 text-white flex items-center justify-center hover:bg-opacity-30 focus:outline-none"
                      aria-label={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4 ml-0.5" />
                      )}
                    </button>
                    <span className="text-xs text-white">
                      {selectedDuration}s • {selectedStyle}
                    </span>
                  </div>
                  <span className="text-xs text-white/70">
                    {selectedAspect} • {selectedDuration}s
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-2 text-center">
              <button
                onClick={generateVideo}
                className="text-sm text-red-600 hover:text-red-800 font-medium"
              >
                <Sparkles className="w-4 h-4 inline-block mr-1" />
                Generate another variation
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoTool;
