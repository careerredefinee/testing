import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';

interface PremiumUser {
  _id: string;
  name: string;
  email: string;
  isPremium: boolean;
  createdAt?: string;
}

const PremiumUsersPage: React.FC = () => {
  const [users, setUsers] = useState<PremiumUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.listPremiumUsers(); // { users }
      setUsers(data?.users || []);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load premium users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      if (!form.email || !form.password) {
        setError('Email and password are required');
        return;
      }
      await adminService.createPremiumUser({ ...form });
      setForm({ name: '', email: '', password: '' });
      await loadUsers();
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to create premium user');
    } finally {
      setCreating(false);
    }
  };

  const onTogglePremium = async (id: string, current: boolean) => {
    try {
      await adminService.setPremiumStatus(id, !current);
      await loadUsers();
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to update premium status');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Premium Users</h1>
        <p className="text-sm text-gray-500">Create and manage premium users.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <form onSubmit={onCreate} className="bg-white shadow rounded p-6 space-y-4">
          <h2 className="text-lg font-semibold">Create Premium User</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700">Name (optional)</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="user@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter a secure password"
              required
            />
          </div>
          {error && (
            <div className="text-sm text-red-600">{error}</div>
          )}
          <button
            type="submit"
            disabled={creating}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
          >
            {creating ? 'Creating...' : 'Create Premium User'}
          </button>
        </form>

        <div className="bg-white shadow rounded p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Existing Premium Users</h2>
            <button
              onClick={loadUsers}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Refresh
            </button>
          </div>
          {loading ? (
            <div className="text-gray-500">Loading...</div>
          ) : users.length === 0 ? (
            <div className="text-gray-500">No premium users yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Premium</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td className="px-4 py-2 text-sm text-gray-900">{u.name || '-'}</td>
                      <td className="px-4 py-2 text-sm text-gray-500">{u.email}</td>
                      <td className="px-4 py-2 text-sm">{u.isPremium ? 'Yes' : 'No'}</td>
                      <td className="px-4 py-2 text-right">
                        <button
                          onClick={() => onTogglePremium(u._id, u.isPremium)}
                          className={`inline-flex items-center px-3 py-1 rounded text-sm font-medium border ${u.isPremium ? 'text-gray-700 border-gray-300 hover:bg-gray-50' : 'text-green-700 border-green-300 hover:bg-green-50'}`}
                        >
                          {u.isPremium ? 'Revoke' : 'Grant'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PremiumUsersPage;
