import React from 'react';
import ChangePasswordForm from '../components/ChangePasswordForm';

const ChangePasswordPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-lg mx-auto">
        <div className="bg-white shadow rounded-lg p-6 sm:p-8">
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
