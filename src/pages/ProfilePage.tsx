import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Camera } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../utils/api';
import assessmentService from '../services/assessmentService';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  photo?: string;
  role?: string;
  createdAt?: string;
}

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editedUser, setEditedUser] = useState<Partial<UserProfile>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [assessmentsLoading, setAssessmentsLoading] = useState(false);
  const [myAssessments, setMyAssessments] = useState<Array<{ assessment: any; submission: any | null }>>([]);
  const [uploadingMap, setUploadingMap] = useState<Record<string, boolean>>({});

  const loadUserData = useCallback(() => {
    if (!user) return;
    
    setEditedUser({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      photo: user.photo
    });
  }, [user]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  useEffect(() => {
    const fetchAssessments = async () => {
      if (!user) return;
      try {
        setAssessmentsLoading(true);
        const items = await assessmentService.listMyAssessments();
        setMyAssessments(items);
      } catch (e: any) {
        // Non-blocking error
      } finally {
        setAssessmentsLoading(false);
      }
    };
    fetchAssessments();
  }, [user]);

  const handleSubmitAssessment = async (assessmentId: string, file?: File) => {
    try {
      if (!file) return toast.error('Please choose a file');
      setUploadingMap((m) => ({ ...m, [assessmentId]: true }));
      const submission = await assessmentService.submitAssessment(assessmentId, file);
      setMyAssessments((prev) => prev.map((it) => it.assessment._id === assessmentId ? { ...it, submission } : it));
      toast.success('Assessment uploaded');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Upload failed');
    } finally {
      setUploadingMap((m) => ({ ...m, [assessmentId]: false }));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const formData = new FormData();
    formData.append('photo', file);

    try {
      setIsUploading(true);
      const response = await api.patch(`/api/v1/users/update-me`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const updatedUser = (response as any)?.data?.data?.user ?? (response as any)?.data?.data;
      const newPhoto = updatedUser?.photo ?? (response as any)?.data?.data?.photo;
      if (updatedUser) updateUser(updatedUser);
      if (newPhoto) setEditedUser(prev => ({ ...prev, photo: newPhoto }));
      toast.success('Profile picture updated successfully');
    } catch (error) {
      toast.error('Failed to upload profile picture');
      console.error('Error uploading avatar:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    try {
      const response = await api.patch(`/api/v1/users/update-me`, editedUser);
      const updatedUser = (response as any)?.data?.data?.user ?? (response as any)?.data?.data;
      if (updatedUser) updateUser(updatedUser);
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
      console.error('Error updating profile:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({ ...prev, [name]: value }));
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Profile Header */}
          <div className="px-6 py-8 sm:px-10 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
            <div className="flex flex-col items-center sm:items-start sm:flex-row">
              <div className="relative group">
                <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center overflow-hidden">
                  <img 
                    src={editedUser.photo || '/defaultprofile.jpg'} 
                    alt={editedUser.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/defaultprofile.jpg';
                    }}
                  />
                </div>
                {isEditing && (
                  <button
                    onClick={triggerFileInput}
                    disabled={isUploading}
                    className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {isUploading ? (
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Camera className="h-5 w-5" />
                    )}
                  </button>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  accept="image/*"
                />
              </div>
              <div className="mt-4 sm:mt-0 sm:ml-6 text-center sm:text-left">
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <p className="text-blue-100">{user.email}</p>
                {user.role && (
                  <span className="inline-block mt-2 px-3 py-1 bg-blue-100 bg-opacity-20 rounded-full text-sm font-medium">
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                )}
              </div>
              <div className="mt-4 sm:mt-0 sm:ml-auto">
                {isEditing ? (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        loadUserData();
                      }}
                      className="px-4 py-2 border border-white text-white rounded-md hover:bg-white hover:bg-opacity-10 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      className="px-4 py-2 bg-white text-blue-700 rounded-md hover:bg-blue-50 transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-white text-blue-700 rounded-md hover:bg-blue-50 transition-colors"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-6 sm:p-10">
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Personal Information</h2>
                <p className="mt-1 text-sm text-gray-500">View and update your personal details.</p>
              </div>

              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-6">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={editedUser.name || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">{user.name}</p>
                  )}
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={editedUser.email || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                  )}
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      value={editedUser.phone || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      placeholder="+91 9876543210"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">
                      {user.phone || 'Not provided'}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-base font-medium text-gray-900">Account</h3>
                    <p className="text-sm text-gray-500">Manage your account settings</p>
                  </div>
                  <button
                    type="button"
                    className="text-sm font-medium text-red-600 hover:text-red-500"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to log out?')) {
                        // Handle logout
                      }
                    }}
                  >
                    Log out
                  </button>
                </div>
              </div>

              {/* My Assessments Section */}
              <div className="pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-base font-medium text-gray-900">My Assessments</h3>
                    <p className="text-sm text-gray-500">Upload your work for assigned assessments.</p>
                  </div>
                  <button
                    type="button"
                    className="text-sm text-blue-600 hover:text-blue-700"
                    onClick={async () => {
                      try {
                        setAssessmentsLoading(true);
                        const items = await assessmentService.listMyAssessments();
                        setMyAssessments(items);
                      } finally {
                        setAssessmentsLoading(false);
                      }
                    }}
                  >
                    Refresh
                  </button>
                </div>

                {assessmentsLoading ? (
                  <div className="text-gray-500">Loading...</div>
                ) : myAssessments.length === 0 ? (
                  <div className="text-gray-500">No assessments assigned.</div>
                ) : (
                  <div className="space-y-4">
                    {myAssessments.map(({ assessment, submission }) => {
                      const approved = submission?.status === 'approved';
                      const rejected = submission?.status === 'rejected';
                      return (
                        <div key={assessment._id} className="border rounded p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold">{assessment.title}</h4>
                              {assessment.description && (
                                <p className="text-sm text-gray-600">{assessment.description}</p>
                              )}
                              <p className="text-xs text-gray-500">
                                {assessment.contentType === 'text' ? 'Text Assessment' : 'Media Assessment'}
                                {assessment.dueDate ? ` • Due: ${new Date(assessment.dueDate).toLocaleDateString()}` : ''}
                              </p>
                              {assessment.contentType === 'text' && assessment.textContent && (
                                <p className="mt-2 text-sm whitespace-pre-wrap bg-gray-50 p-2 rounded">{assessment.textContent}</p>
                              )}
                              {assessment.contentType === 'media' && assessment.media?.url && (
                                <a className="mt-2 inline-block text-blue-600 hover:underline" href={assessment.media.url} target="_blank" rel="noreferrer">View assessment file</a>
                              )}
                            </div>
                            <div>
                              <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${approved ? 'bg-green-100 text-green-700' : rejected ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-700'}`}>
                                {approved ? 'Completed' : rejected ? 'Rejected' : submission ? 'Pending' : 'Pending'}
                              </span>
                            </div>
                          </div>

                          {/* Submission area */}
                          <div className="mt-3">
                            {submission?.status === 'rejected' && submission?.reviewMessage && (
                              <div className="text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded p-2 mb-2">
                                Rejection message: {submission.reviewMessage}
                              </div>
                            )}
                            {submission?.file?.url && (
                              <div className="text-sm mb-2">
                                Last uploaded: <a className="text-blue-600 hover:underline" href={submission.file.url} target="_blank" rel="noreferrer">View file</a>
                              </div>
                            )}
                            {approved ? (
                              <div className="text-sm text-green-700">Your submission is approved. Upload is locked.</div>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <input
                                  type="file"
                                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,image/*"
                                  onChange={(e) => {
                                    const f = e.target.files?.[0] || undefined;
                                    if (f) handleSubmitAssessment(assessment._id, f);
                                  }}
                                  className="text-sm"
                                />
                                {uploadingMap[assessment._id] && (
                                  <span className="text-xs text-gray-500">Uploading...</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
