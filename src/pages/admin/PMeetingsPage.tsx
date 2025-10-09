import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { meetingService, type PremiumMeeting } from '../../services/meetingService';

const PMeetingsPage: React.FC = () => {
  const [meetings, setMeetings] = useState<PremiumMeeting[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [action, setAction] = useState<Record<string, { meetingLink?: string; scheduledAt?: string; loading?: boolean }>>({});

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await meetingService.adminList();
      setMeetings(list);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load premium meetings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id: string, status: 'approved' | 'rejected' | 'pending') => {
    setAction(prev => ({ ...prev, [id]: { ...prev[id], loading: true } }));
    try {
      const payload: { status: 'approved' | 'rejected' | 'pending'; meetingLink?: string; scheduledAt?: string } = {
        status,
      };
      const s = action[id];
      if (status === 'approved') {
        if (!s?.meetingLink) {
          alert('Please provide a meeting link before approving.');
          setAction(prev => ({ ...prev, [id]: { ...prev[id], loading: false } }));
          return;
        }
        payload.meetingLink = s.meetingLink;
        if (s.scheduledAt) payload.scheduledAt = s.scheduledAt;
      }
      await meetingService.adminUpdate(id, payload);
      await load();
      // Assumption: backend will notify the user via email similar to bookings
    } catch (e: any) {
      alert(e?.response?.data?.message || e?.message || 'Failed to update meeting');
    } finally {
      setAction(prev => ({ ...prev, [id]: { ...prev[id], loading: false } }));
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this meeting request?')) return;
    try {
      await meetingService.adminDelete(id);
      await load();
    } catch (e: any) {
      alert(e?.response?.data?.message || e?.message || 'Failed to delete');
    }
  };

  return (
    <AdminLayout>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Premium Meetings</h1>
        {loading && <div className="text-gray-500">Loading...</div>}
        {error && <div className="text-red-600 text-sm mb-3">{error}</div>}
        {!loading && (
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="w-full min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scheduled</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Meeting Link</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {meetings.map(m => {
                  const s = action[m._id] || {};
                  const statusColor = m.status === 'approved' ? 'text-emerald-600' : m.status === 'rejected' ? 'text-red-600' : 'text-gray-600';
                  return (
                    <tr key={m._id}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">{m.name || (typeof m.user === 'object' ? m.user?.name : '')}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">{m.email || (typeof m.user === 'object' ? (m.user as any)?.email : '')}</td>
                      <td className={`px-4 py-2 whitespace-nowrap text-sm ${statusColor}`}>{m.status}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-600">{new Date(m.createdAt).toLocaleString()}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-600">
                        {m.scheduledAt ? new Date(m.scheduledAt).toLocaleString() : (
                          <input
                            type="datetime-local"
                            className="border rounded px-2 py-1 text-xs"
                            value={s.scheduledAt || ''}
                            onChange={(e) => setAction(prev => ({ ...prev, [m._id]: { ...prev[m._id], scheduledAt: e.target.value } }))}
                          />
                        )}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-xs">
                        {m.meetingLink ? (
                          <a href={m.meetingLink} target="_blank" rel="noreferrer" className="text-blue-600 underline break-all">{m.meetingLink}</a>
                        ) : (
                          <input
                            type="text"
                            placeholder="https://..."
                            className="border rounded px-2 py-1 text-xs w-56"
                            value={s.meetingLink || ''}
                            onChange={(e) => setAction(prev => ({ ...prev, [m._id]: { ...prev[m._id], meetingLink: e.target.value } }))}
                          />
                        )}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-xs">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateStatus(m._id, 'approved')}
                            disabled={s.loading}
                            className={`px-3 py-1.5 rounded text-white text-xs ${s.loading ? 'bg-gray-400' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => updateStatus(m._id, 'rejected')}
                            disabled={s.loading}
                            className={`px-3 py-1.5 rounded text-white text-xs ${s.loading ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'}`}
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => remove(m._id)}
                            className="px-3 py-1.5 rounded text-white text-xs bg-gray-700 hover:bg-gray-800"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default PMeetingsPage;
