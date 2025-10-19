import React, { useState, useRef } from 'react';
import { Music, Play, Pause, Volume2, VolumeX, Download, X, Sparkles } from 'lucide-react';

const musicGenres = [
  'Classical', 'Jazz', 'Rock', 'Pop', 'Electronic', 'Hip Hop',
  'Ambient', 'Blues', 'Country', 'EDM', 'Metal', 'Punk', 'R&B', 'Reggae'
];

const moods = [
  'Happy', 'Energetic', 'Relaxed', 'Melancholic', 'Romantic',
  'Mysterious', 'Epic', 'Dreamy', 'Upbeat', 'Calm'
];

const instruments = [
  'Piano', 'Guitar', 'Violin', 'Drums', 'Synthesizer',
  'Flute', 'Saxophone', 'Bass', 'Harp', 'Trumpet'
];

interface MusicToolProps {
  onClose: () => void;
}

const MusicTool: React.FC<MusicToolProps> = ({ onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
  const [bpm, setBpm] = useState(120);
  const [duration, setDuration] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (!generatedAudio) return;
    
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play().catch(err => {
        console.error('Error playing audio:', err);
        setError('Failed to play audio. Please try again.');
      });
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleInstrumentToggle = (instrument: string) => {
    setSelectedInstruments(prev => 
      prev.includes(instrument)
        ? prev.filter(i => i !== instrument)
        : [...prev, instrument]
    );
  };

  const generateMusic = async () => {
    if (!prompt.trim() && !selectedGenre && !selectedMood && selectedInstruments.length === 0) {
      setError('Please provide some details about the music you want to generate');
      return;
    }

    setIsGenerating(true);
    setError('');
    setGeneratedAudio(null);
    setIsPlaying(false);

    try {
      // In a real implementation, you would call the AI service
      // const response = await aiService.generateMusic({
      //   prompt,
      //   genre: selectedGenre,
      //   mood: selectedMood,
      //   instruments: selectedInstruments,
      //   bpm,
      //   duration
      // });
      // setGeneratedAudio(response.audioUrl);
      
      // For demo purposes, we'll simulate a response
      setTimeout(() => {
        // This is a placeholder audio URL - in a real app, this would be the URL from your API
        setGeneratedAudio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
        setIsGenerating(false);
      }, 3000);
      
    } catch (err) {
      console.error('Error generating music:', err);
      setError('Failed to generate music. Please try again.');
      setIsGenerating(false);
    }
  };

  const downloadMusic = () => {
    if (!generatedAudio) return;
    
    const link = document.createElement('a');
    link.href = generatedAudio;
    link.download = `ai-music-${new Date().getTime()}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetForm = () => {
    setPrompt('');
    setSelectedGenre('');
    setSelectedMood('');
    setSelectedInstruments([]);
    setBpm(120);
    setDuration(30);
    setError('');
    setGeneratedAudio(null);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <Music className="w-5 h-5 text-pink-500" />
          <h2 className="text-xl font-semibold">Music Composer</h2>
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
            Describe the music you want to create
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="E.g., A relaxing piano piece with soft strings in the background"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
            rows={3}
            disabled={isGenerating}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
              disabled={isGenerating}
            >
              <option value="">Select a genre (optional)</option>
              {musicGenres.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mood</label>
            <select
              value={selectedMood}
              onChange={(e) => setSelectedMood(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
              disabled={isGenerating}
            >
              <option value="">Select a mood (optional)</option>
              {moods.map(mood => (
                <option key={mood} value={mood}>{mood}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Instruments</label>
          <div className="flex flex-wrap gap-2">
            {instruments.map(instrument => (
              <button
                key={instrument}
                type="button"
                onClick={() => handleInstrumentToggle(instrument)}
                className={`px-3 py-1 text-sm rounded-full border ${
                  selectedInstruments.includes(instrument)
                    ? 'bg-pink-100 text-pink-800 border-pink-200'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
                disabled={isGenerating}
              >
                {instrument}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              BPM: {bpm}
            </label>
            <input
              type="range"
              min="40"
              max="200"
              value={bpm}
              onChange={(e) => setBpm(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              disabled={isGenerating}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Slow</span>
              <span>Fast</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration: {duration} seconds
            </label>
            <input
              type="range"
              min="10"
              max="300"
              step="5"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              disabled={isGenerating}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>10s</span>
              <span>5m</span>
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
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reset
          </button>
          <button
            onClick={generateMusic}
            disabled={isGenerating || (!prompt && !selectedGenre && !selectedMood && selectedInstruments.length === 0)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Composing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Compose Music
              </>
            )}
          </button>
        </div>

        {isGenerating && !generatedAudio && (
          <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-200 my-4">
            <div className="text-center p-6">
              <div className="animate-pulse flex flex-col items-center">
                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-4">
                  <Music className="w-8 h-8 text-pink-600" />
                </div>
                <p className="text-gray-600">Composing your music...</p>
                <p className="text-sm text-gray-500 mt-1">This may take a moment</p>
              </div>
            </div>
          </div>
        )}

        {generatedAudio && (
          <div className="mt-4 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-700">Your Generated Music</h3>
              <div className="flex space-x-2">
                <button
                  onClick={toggleMute}
                  className="p-2 text-gray-600 hover:text-gray-800"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <button
                  onClick={downloadMusic}
                  className="p-2 text-gray-600 hover:text-gray-800"
                  title="Download"
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={togglePlay}
                  className="w-12 h-12 rounded-full bg-pink-600 text-white flex items-center justify-center hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                </button>
                
                <div className="flex-1">
                  <div className="h-2 bg-white rounded-full overflow-hidden">
                    <div className="h-full bg-pink-500" style={{ width: isPlaying ? '70%' : '0%' }}></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{isPlaying ? '1:23' : '0:00'}</span>
                    <span>2:45</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 text-center">
                <p className="font-medium text-gray-800">
                  {selectedGenre || 'Custom'} {selectedMood ? `• ${selectedMood}` : ''}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedInstruments.length > 0 
                    ? selectedInstruments.join(', ')
                    : 'Various instruments'}
                </p>
              </div>
            </div>
            
            <audio
              ref={audioRef}
              src={generatedAudio}
              onEnded={() => setIsPlaying(false)}
              onPause={() => setIsPlaying(false)}
              onPlay={() => setIsPlaying(true)}
              className="hidden"
            />
            
            <div className="mt-2 text-center">
              <button
                onClick={generateMusic}
                className="text-sm text-pink-600 hover:text-pink-800 font-medium"
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

export default MusicTool;
