import React from 'react';
import { PhoneCall } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RequestCallbackButton: React.FC = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/support#booking');
  };

  return (
    <button
      onClick={handleClick}
      aria-label="Request Callback"
      className="fixed bottom-6 right-6 z-50 px-5 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold flex items-center gap-2 hover:opacity-95"
    >
      <PhoneCall className="w-5 h-5" />
      <span className="hidden sm:inline">Request Callback</span>
    </button>
  );
};

export default RequestCallbackButton;
