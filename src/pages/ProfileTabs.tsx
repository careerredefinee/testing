import React, { useState } from 'react';
import { User, Key } from 'lucide-react';

const ProfileTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4 mr-2" /> },
    { id: 'password', label: 'Change Password', icon: <Key className="w-4 h-4 mr-2" /> },
  ];

  return (
    <div className="border-b border-gray-200">
      <nav className="flex -mb-px">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-4 px-6 text-sm font-medium ${
              activeTab === tab.id
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default ProfileTabs;
