import React, { useState } from 'react';
import { Key } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';

interface ChangePasswordFormProps {
  onSuccess?: () => void;
}

const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { updateUser } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (formData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }
    
    try {
      setIsLoading(true);
      const { data } = await api.patch('/api/v1/users/update-password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        newPasswordConfirm: formData.confirmPassword
      });
      const newToken = (data as any)?.token ?? (data as any)?.data?.token;
      const newUser = (data as any)?.data?.user;
      if (newToken) {
        localStorage.setItem('token', newToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      }
      if (newUser) updateUser(newUser);
      
      toast.success('Password updated successfully!');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      if (onSuccess) onSuccess();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update password';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Change Password</h2>
        <p className="mt-1 text-sm text-gray-500">
          Update your account password. Make sure to use a strong password.
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
            Current Password
          </label>
          <div className="mt-1">
            <input
              id="currentPassword"
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              required
              value={formData.currentPassword}
              onChange={handleChange}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
            New Password
          </label>
          <div className="mt-1">
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={formData.newPassword}
              onChange={handleChange}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Must be at least 8 characters long
          </p>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Confirm New Password
          </label>
          <div className="mt-1">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={formData.confirmPassword}
              onChange={handleChange}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating...
              </>
            ) : (
              <>
                <Key className="-ml-1 mr-2 h-5 w-5" />
                Update Password
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChangePasswordForm;
