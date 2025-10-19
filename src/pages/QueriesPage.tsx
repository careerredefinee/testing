import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import QueryForm from '../components/queries/QueryForm';
import QueryList from '../components/queries/QueryList';
import { Navigate } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/24/outline';

const QueriesPage: React.FC = () => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);

  if (!user) {
    return <Navigate to="/login" state={{ from: '/my-queries' }} replace />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            My Queries
          </h1>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            {showForm ? 'Hide Form' : 'New Query'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="mb-8 bg-white shadow overflow-hidden sm:rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Submit a New Query</h2>
          <QueryForm 
            onSuccess={() => {
              setShowForm(false);
              // The QueryList component will automatically refresh due to the query invalidation
            }} 
          />
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <QueryList />
      </div>
    </div>
  );
};

export default QueriesPage;
