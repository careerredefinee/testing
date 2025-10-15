import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import { format } from 'date-fns';

interface Query {
  _id: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
  replies: Array<{
    _id: string;
    message: string;
    repliedBy: {
      _id: string;
      name: string;
      role: string;
    };
    createdAt: string;
  }>;
  course?: {
    _id: string;
    title: string;
  };
}

const statusColors = {
  new: 'bg-blue-100 text-blue-800',
  read: 'bg-gray-100 text-gray-800',
  replied: 'bg-green-100 text-green-800',
  resolved: 'bg-purple-100 text-purple-800',
  closed: 'bg-gray-200 text-gray-600',
};

const QueryList: React.FC = () => {
  const { user } = useAuth();
  const [queries, setQueries] = useState<Query[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedQuery, setExpandedQuery] = useState<string | null>(null);

  useEffect(() => {
    const fetchQueries = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/api/v1/queries/my-queries');
        setQueries(data.data.queries);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch queries');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchQueries();
    }
  }, [user]);

  const toggleExpand = (id: string) => {
    setExpandedQuery(expandedQuery === id ? null : id);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (queries.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No queries yet</h3>
        <p className="mt-1 text-sm text-gray-500">
          You haven't submitted any queries yet. Submit your first query to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium text-gray-900">My Queries</h2>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {queries.map((query) => (
            <li key={query._id}>
              <div 
                className="px-4 py-4 sm:px-6 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleExpand(query._id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <p className="text-sm font-medium text-blue-600 truncate">
                      {query.subject}
                    </p>
                    {query.course && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {query.course.title}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[query.status]}`}>
                      {query.status.charAt(0).toUpperCase() + query.status.slice(1)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {format(new Date(query.updatedAt), 'MMM d, yyyy')}
                    </span>
                    <svg
                      className={`h-5 w-5 text-gray-400 transform ${expandedQuery === query._id ? 'rotate-180' : ''}`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                {expandedQuery === query._id && (
                  <div className="mt-2 text-sm text-gray-700 space-y-4">
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="font-medium">Your message:</p>
                      <p className="whitespace-pre-line">{query.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Submitted on {format(new Date(query.createdAt), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                    
                    {query.replies && query.replies.length > 0 ? (
                      <div className="space-y-3">
                        <p className="font-medium">Replies:</p>
                        {query.replies.map((reply) => (
                          <div key={reply._id} className="bg-blue-50 p-3 rounded">
                            <div className="flex justify-between items-start">
                              <p className="font-medium">
                                {reply.repliedBy.name}
                                <span className="ml-2 text-xs font-normal text-gray-500">
                                  ({reply.repliedBy.role})
                                </span>
                              </p>
                              <span className="text-xs text-gray-500">
                                {format(new Date(reply.createdAt), 'MMM d, yyyy h:mm a')}
                              </span>
                            </div>
                            <p className="mt-1 whitespace-pre-line">{reply.message}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No replies yet.</p>
                    )}
                    
                    <div className="pt-2">
                      <button
                        type="button"
                        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Implement reply functionality
                        }}
                      >
                        <svg
                          className="h-4 w-4 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                          />
                        </svg>
                        Reply
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default QueryList;
