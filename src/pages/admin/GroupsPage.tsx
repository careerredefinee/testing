import React, { useEffect, useState } from 'react';
import { groupService, Group } from '../../services/groupService';
import { groupMessageService, GroupMessage } from '../../services/groupMessageService';

const GroupsPage: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedGroupName, setSelectedGroupName] = useState<string>('');
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const data = await groupService.list();
      setGroups(data);
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const loadGroupMessages = async (groupId: string) => {
    try {
      setLoadingMessages(true);
      const data = await groupMessageService.list(groupId, 1, 50);
      setMessages(data);
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message);
    } finally {
      setLoadingMessages(false);
    }
  };

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      setLoading(true);
      await groupService.create(name.trim());
      setName('');
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  const onAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup || !memberEmail.trim()) return;
    try {
      setLoading(true);
      await groupService.addMemberByEmail(selectedGroup, memberEmail.trim());
      setMemberEmail('');
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  const onDeleteGroup = async (groupId: string) => {
    if (!confirm('Delete this group?')) return;
    try {
      setLoading(true);
      await groupService.delete(groupId);
      await load();
      if (selectedGroup === groupId) {
        setSelectedGroup(null);
        setSelectedGroupName('');
        setMessages([]);
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  const onDeleteMessage = async (messageId: string) => {
    if (!selectedGroup) return;
    try {
      await groupMessageService.deleteMessage(messageId);
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Groups</h1>

      {error && (
        <div className="mb-4 p-3 rounded bg-red-50 text-red-700 border border-red-200">{error}</div>
      )}

      <form onSubmit={onCreate} className="flex gap-3 mb-6">
        <input
          className="border rounded px-3 py-2 flex-1"
          placeholder="New group name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          disabled={loading}
        >
          Create
        </button>
      </form>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Groups List */}
        <div className="lg:col-span-1">
          <h2 className="font-medium mb-2">All Groups</h2>
          <ul className="divide-y divide-gray-200 border rounded max-h-[480px] overflow-y-auto">
            {groups.map((g) => (
              <li key={g._id} className="p-3 flex items-center justify-between gap-3">
                <div>
                  <div className="font-medium">{g.name}</div>
                  <div className="text-xs text-gray-500">Members: {g.members?.length ?? 0}</div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    className={`px-3 py-1 rounded border hover:bg-gray-50 ${selectedGroup === g._id ? 'bg-gray-100' : ''}`}
                    onClick={() => {
                      setSelectedGroup(g._id);
                      setSelectedGroupName(g.name);
                      loadGroupMessages(g._id);
                    }}
                  >
                    View
                  </button>
                  <button
                    className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                    onClick={() => onDeleteGroup(g._id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
            {groups.length === 0 && (
              <li className="p-3 text-sm text-gray-500">No groups yet.</li>
            )}
          </ul>
        </div>

        {/* Messages Viewer */}
        <div className="lg:col-span-2 space-y-6">
          <div className="border rounded p-4 bg-white">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-medium">Group Messages {selectedGroupName ? `- ${selectedGroupName}` : ''}</h2>
              {selectedGroup && (
                <button
                  className="text-sm text-indigo-600 hover:underline"
                  onClick={() => loadGroupMessages(selectedGroup)}
                >
                  Refresh
                </button>
              )}
            </div>
            {!selectedGroup ? (
              <div className="text-sm text-gray-500">Select a group and click View to load messages.</div>
            ) : (
              <div className="h-[420px] overflow-y-auto space-y-3 pr-2 custom-scroll">
                {loadingMessages ? (
                  <div className="text-gray-500">Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div className="text-sm text-gray-500">No messages yet.</div>
                ) : (
                  messages.map((m) => (
                    <div key={m._id} className="bg-gray-50 border rounded p-3">
                      <div className="text-xs text-gray-500 flex items-center justify-between">
                        <span>
                          {typeof m.sender === 'string' ? m.sender : m.sender?.name || m.sender?.email}
                        </span>
                        <span>{new Date(m.createdAt).toLocaleString()}</span>
                      </div>
                      {m.text && <div className="mt-1 text-sm">{m.text}</div>}
                      {m.media?.url && (
                        <div className="mt-2">
                          {m.media.type === 'image' ? (
                            <img src={m.media.url} alt="upload" className="max-h-60 rounded border" />
                          ) : (
                            <a
                              href={m.media.url}
                              className="text-indigo-600 underline"
                              target="_blank"
                              rel="noreferrer"
                            >
                              Download file
                            </a>
                          )}
                        </div>
                      )}
                      <div className="mt-2 text-right">
                        <button
                          className="text-xs text-red-600 hover:underline"
                          onClick={() => onDeleteMessage(m._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Add Member Panel */}
          <div className="border rounded p-4 bg-white">
            <h2 className="font-medium mb-2">Add Member (Premium only)</h2>
            <form onSubmit={onAddMember} className="space-y-3">
              <div>
                <label className="block text-sm mb-1">Selected Group</label>
                <select
                  className="border rounded px-3 py-2 w-full"
                  value={selectedGroup ?? ''}
                  onChange={(e) => setSelectedGroup(e.target.value || null)}
                >
                  <option value="">-- Choose a group --</option>
                  {groups.map((g) => (
                    <option key={g._id} value={g._id}>{g.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Member Email</label>
                <input
                  className="border rounded px-3 py-2 w-full"
                  placeholder="user@example.com"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                />
              </div>
              <button
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
                disabled={loading || !selectedGroup || !memberEmail}
              >
                Add Member
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupsPage;
