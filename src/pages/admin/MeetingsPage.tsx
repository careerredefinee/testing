import React, { useEffect, useState } from 'react';
import { meetingService, type PremiumMeeting } from '../../services/meetingService';

const MeetingsPage: React.FC = () => {
  const [items, setItems] = useState<PremiumMeeting[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await meetingService.adminList();
      setItems(list);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load meetings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAction = async (
    id: string,
    status: 'approved' | 'rejected' | 'pending',
    meetingLink?: string,
    scheduledAt?: string
  ) => {
    try {
      setActionLoadingId(id);
      await meetingService.adminUpdate(id, { status, meetingLink, scheduledAt });
      await load();
    } catch (e: any) {
      alert(e?.response?.data?.message || e?.message || 'Failed to update meeting');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Premium Meetings</h1>
      {error && <div className="text-sm text-red-600 mb-2">{error}</div>}
      {loading ? (
        <div className="text-gray-600">Loading...</div>
      ) : (
        <div className="overflow-x-auto bg-white border rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-3 py-2">User</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Message</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Scheduled</th>
                <th className="px-3 py-2">Link</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((m) => (
                <tr key={m._id}>
                  <td className="px-3 py-2">{typeof m.user === 'object' ? (m.user.name || '-') : m.name}</td>
                  <td className="px-3 py-2">{m.email}</td>
                  <td className="px-3 py-2 max-w-xs truncate" title={m.message}>{m.message || '-'}</td>
                  <td className="px-3 py-2">
                    <span className={
                      m.status === 'approved' ? 'text-emerald-600' : m.status === 'rejected' ? 'text-red-600' : 'text-gray-600'
                    }>
                      {m.status}
                    </span>
                  </td>
                  <td className="px-3 py-2">{m.scheduledAt ? new Date(m.scheduledAt).toLocaleString() : '-'}</td>
                  <td className="px-3 py-2">
                    {m.meetingLink ? (
                      <a href={m.meetingLink} className="text-blue-600 underline" target="_blank" rel="noreferrer">Open</a>
                    ) : '-'}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-col gap-2">
                      <ApproveForm
                        onSubmit={(payload) => handleAction(m._id, 'approved', payload.meetingLink, payload.scheduledAt)}
                        disabled={actionLoadingId === m._id}
                        defaultLink={m.meetingLink}
                        defaultDateTime={m.scheduledAt ? m.scheduledAt.slice(0, 16) : ''}
                      />
                      <button
                        className="px-3 py-1.5 text-sm rounded-md border text-red-700 border-red-300 hover:bg-red-50"
                        onClick={() => handleAction(m._id, 'rejected')}
                        disabled={actionLoadingId === m._id}
                      >
                        {actionLoadingId === m._id ? 'Working...' : 'Reject'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td className="px-3 py-6 text-center text-gray-500" colSpan={7}>No meeting requests.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const ApproveForm: React.FC<{
  onSubmit: (payload: { meetingLink: string; scheduledAt: string }) => void;
  disabled?: boolean;
  defaultLink?: string;
  defaultDateTime?: string;
}> = ({ onSubmit, disabled, defaultLink = '', defaultDateTime = '' }) => {
  const [meetingLink, setMeetingLink] = useState<string>(defaultLink);
  const [scheduledAt, setScheduledAt] = useState<string>(defaultDateTime);
  useEffect(() => { setMeetingLink(defaultLink); }, [defaultLink]);
  useEffect(() => { setScheduledAt(defaultDateTime); }, [defaultDateTime]);
  return (
    <form
      className="flex flex-col sm:flex-row gap-2"
      onSubmit={(e) => { e.preventDefault(); onSubmit({ meetingLink, scheduledAt }); }}
    >
      <input
        type="url"
        required
        placeholder="Meeting link"
        className="border rounded-md px-2 py-1 text-sm min-w-[220px]"
        value={meetingLink}
        onChange={(e) => setMeetingLink(e.target.value)}
      />
      <input
        type="datetime-local"
        required
        className="border rounded-md px-2 py-1 text-sm"
        value={scheduledAt}
        onChange={(e) => setScheduledAt(e.target.value)}
      />
      <button
        type="submit"
        className="px-3 py-1.5 text-sm rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
        disabled={disabled}
      >
        {disabled ? 'Saving...' : 'Approve'}
      </button>
    </form>
  );
};

export default MeetingsPage;
