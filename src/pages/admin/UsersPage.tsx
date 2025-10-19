import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, Navigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { 
  MagnifyingGlassIcon as SearchIcon, 
  PencilIcon, 
  TrashIcon, 
  PlusIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import api from '../../utils/api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  isVerified: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UsersState {
  users: User[];
  loading: boolean;
  searchTerm: string;
  currentPage: number;
  totalPages: number;
  selectedUsers: string[];
  deleteModalOpen: boolean;
  userToDelete: string | null;
  error: string | null;
}

const UsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [state, setState] = useState<UsersState>({
    users: [],
    loading: true,
    searchTerm: '',
    currentPage: 1,
    totalPages: 1,
    selectedUsers: [],
    deleteModalOpen: false,
    userToDelete: null,
    error: null,
  });
  
  const { users, loading, searchTerm, currentPage, totalPages, selectedUsers, deleteModalOpen, userToDelete, error } = state;
  
  const updateState = useCallback((updates: Partial<UsersState>) => {
    setState(prev => ({
      ...prev,
      ...updates
    }));
  }, []);

  const itemsPerPage = 10;

  // Fetch users from the API
  const fetchUsers = useCallback(async () => {
    try {
      updateState({ loading: true, error: null });
      const { currentPage, searchTerm } = state;

      const response = await api.get('/api/v1/admin/users', {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          search: searchTerm
        }
      });

      if (response.data?.data) {
        updateState({
          users: response.data.data.users || [],
          totalPages: Math.ceil((response.data.total || 0) / itemsPerPage),
          loading: false
        });
      }
    } catch (err: any) {
      console.error('Error fetching users:', err);
      updateState({
        error: err.response?.data?.message || 'Failed to fetch users',
        loading: false
      });
    }
  }, [state.currentPage, state.searchTerm]);

  // Update state helper function
  const handlePageChange = useCallback((page: number) => {
    updateState({ currentPage: page });
    fetchUsers();
  }, [fetchUsers, updateState]);

  // Initial fetch and when dependencies change
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle search
  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    updateState({ currentPage: 1 });
    fetchUsers();
  }, [fetchUsers, updateState]);

  // Toggle single user selection
  const toggleUserSelection = useCallback((id: string) => {
    updateState({
      selectedUsers: state.selectedUsers.includes(id)
        ? state.selectedUsers.filter((uid) => uid !== id)
        : [...state.selectedUsers, id]
    });
  }, [state.selectedUsers, updateState]);

  // Open delete confirmation for a single user
  const handleDeleteClick = useCallback((id: string) => {
    updateState({ deleteModalOpen: true, userToDelete: id });
  }, [updateState]);

  // Handle select all
  const toggleSelectAll = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    updateState({
      selectedUsers: e.target.checked ? state.users.map(user => user._id) : []
    });
  }, [state.users, updateState]);

  // Handle delete user
  const handleDeleteConfirmation = useCallback((id: string) => {
    updateState({ deleteModalOpen: true, userToDelete: id });
  }, [updateState]);

  // Confirm delete - handles both single and bulk deletions
  const confirmDelete = async () => {
    try {
      if (state.userToDelete) {
        // Single user deletion
        await api.delete(`/api/v1/admin/users/${state.userToDelete}`);
        
        // Update local state
        const updatedUsers = state.users.filter(user => user._id !== state.userToDelete);
        const updatedSelectedUsers = state.selectedUsers.filter(id => id !== state.userToDelete);
        
        updateState({
          users: updatedUsers,
          deleteModalOpen: false,
          userToDelete: null,
          selectedUsers: updatedSelectedUsers
        });
        
        // Refetch if needed
        if (state.users.length === 1 && state.currentPage > 1) {
          updateState({ currentPage: state.currentPage - 1 });
        } else {
          fetchUsers();
        }
      } else if (state.selectedUsers.length > 0) {
        // Bulk deletion
        await api.delete('/api/v1/admin/users/bulk-delete', {
          data: { userIds: state.selectedUsers }
        });
        
        // Update local state
        const updatedUsers = state.users.filter(user => !state.selectedUsers.includes(user._id));
        
        updateState({
          users: updatedUsers,
          deleteModalOpen: false,
          selectedUsers: [],
          userToDelete: null
        });
        
        // Refetch if needed
        if (updatedUsers.length === 0 && state.currentPage > 1) {
          updateState({ currentPage: state.currentPage - 1 });
        } else {
          fetchUsers();
        }
      }
    } catch (err: any) {
      console.error('Error deleting user:', err);
      updateState({
        error: err.response?.data?.message || 'Failed to delete user',
        deleteModalOpen: false,
        userToDelete: null
      });
    }
  };

  // Handle bulk actions
  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (state.selectedUsers.length === 0) return;

    if (action === 'delete') {
      updateState({ deleteModalOpen: true });
      return;
    }

    try {
      await api.patch('/api/v1/admin/users/bulk-update', {
        userIds: state.selectedUsers,
        updates: { active: action === 'activate' }
      });

      // Update local state
      const updatedUsers = state.users.map(user => 
        state.selectedUsers.includes(user._id)
          ? { ...user, active: action === 'activate' }
          : user
      );
      
      updateState({
        users: updatedUsers,
        selectedUsers: []
      });
    } catch (err: any) {
      console.error(`Error performing bulk ${action}:`, err);
      updateState({
        error: err.response?.data?.message || `Failed to ${action} users`
      });
    }
  };

  // Redirect non-admin users
  if (!currentUser || currentUser.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // Show loading state
  if (state.loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </AdminLayout>
    );
  }

  // Show error state
  if (state.error) {
    return (
      <AdminLayout>
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <XMarkIcon className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{state.error}</p>
              <button
                onClick={() => updateState({ error: null })}
                className="mt-2 text-sm font-medium text-red-700 hover:text-red-600"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Users</h3>
        <div className="mt-3 sm:mt-0 sm:ml-4">
          <Link
            to="/admin/users/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            New User
          </Link>
        </div>
      </div>

      {/* Search and bulk actions */}
      <div className="mt-4 flex flex-col sm:flex-row sm:justify-between">
        <form onSubmit={handleSearch} className="flex">
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              value={state.searchTerm}
              onChange={(e) => updateState({ searchTerm: e.target.value })}
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              placeholder="Search users..."
            />
          </div>
          <button
            type="submit"
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Search
          </button>
        </form>
      </div>

      {/* Bulk actions */}
      {selectedUsers.length > 0 && (
        <div className="mt-4 bg-blue-50 p-4 rounded-md">
          <div className="flex items-center">
            <p className="text-sm text-blue-700 mr-4">
              {selectedUsers.length} {selectedUsers.length === 1 ? 'user' : 'users'} selected
            </p>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => handleBulkAction('activate')}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Activate
              </button>
              <button
                type="button"
                onClick={() => handleBulkAction('deactivate')}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                Deactivate
              </button>
              <button
                type="button"
                onClick={() => handleBulkAction('delete')}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users table */}
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={selectedUsers.length > 0 && selectedUsers.length === users.length}
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Name
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Email
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Role
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Joined
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-3 py-4 text-sm text-center text-gray-500">
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-3 py-4 text-sm text-center text-gray-500">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user._id} className={selectedUsers.includes(user._id) ? 'bg-blue-50' : ''}>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={selectedUsers.includes(user._id)}
                            onChange={() => toggleUserSelection(user._id)}
                          />
                        </td>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {user.name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {user.email}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                            user.role === 'admin' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {user.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <Link
                            to={`/admin/users/edit/${user._id}`}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            <PencilIcon className="h-4 w-4 inline-block" />
                          </Link>
                          <button
                            onClick={() => handleDeleteClick(user._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <TrashIcon className="h-4 w-4 inline-block" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => updateState({ currentPage: Math.max(1, state.currentPage - 1) })}
            disabled={state.currentPage === 1}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Previous
          </button>
          <button
            onClick={() => updateState({ currentPage: state.currentPage + 1 })}
            disabled={state.currentPage >= state.totalPages}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{(state.currentPage - 1) * itemsPerPage + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(state.currentPage * itemsPerPage, state.users.length + (state.currentPage - 1) * itemsPerPage)}
              </span>{' '}
              of <span className="font-medium">{state.totalPages * itemsPerPage}</span> results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => updateState({ currentPage: Math.max(1, state.currentPage - 1) })}
                disabled={state.currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <span className="sr-only">Previous</span>
                &larr;
              </button>
              {Array.from({ length: Math.min(5, state.totalPages) }, (_, i) => {
                let pageNum;
                if (state.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (state.currentPage <= 3) {
                  pageNum = i + 1;
                } else if (state.currentPage >= state.totalPages - 2) {
                  pageNum = state.totalPages - 4 + i;
                } else {
                  pageNum = state.currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => updateState({ currentPage: pageNum })}
                    className={`relative inline-flex items-center px-4 py-2 border ${
                      state.currentPage === pageNum
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    } text-sm font-medium`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => updateState({ currentPage: state.currentPage + 1 })}
                disabled={state.currentPage >= state.totalPages}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <span className="sr-only">Next</span>
                &rarr;
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {deleteModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <TrashIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {selectedUsers.length > 1 
                      ? `Delete ${selectedUsers.length} users?` 
                      : 'Delete user?'}
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      {selectedUsers.length > 1
                        ? 'Are you sure you want to delete the selected users? This action cannot be undone.'
                        : 'Are you sure you want to delete this user? This action cannot be undone.'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateState({ 
                      deleteModalOpen: false, 
                      userToDelete: null,
                      selectedUsers: []
                    });
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default UsersPage;
