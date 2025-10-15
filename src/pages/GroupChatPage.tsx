import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { groupMessageService, GroupMessage } from '../services/groupMessageService';
import { getSocket } from '../utils/socket';

const GroupChatPage: React.FC = () => {
  const { id: groupId } = useParams<{ id: string }>();
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const socket = useMemo(() => getSocket(), []);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const load = async () => {
    if (!groupId) return;
    try {
      setLoading(true);
      const data = await groupMessageService.list(groupId, 1, 50);
      setMessages(data);
      setTimeout(scrollToBottom, 0);
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // join socket room
    if (groupId) {
      socket.emit('group:join', { groupId });
    }
    return () => {
      if (groupId) socket.emit('group:leave', { groupId });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  useEffect(() => {
    const onGroupMessage = (payload: any) => {
      if (!payload) return;
      if (payload.action === 'created' && payload.message) {
        const msg = payload.message as GroupMessage;
        if (String((msg as any).group) === String(groupId)) {
          setMessages((prev) => [...prev, msg]);
          setTimeout(scrollToBottom, 0);
        }
      } else if (payload.action === 'deleted' && payload.messageId) {
        setMessages((prev) => prev.filter((m) => m._id !== payload.messageId));
      }
    };

    socket.on('group:message', onGroupMessage);

    return () => {
      socket.off('group:message', onGroupMessage);
    };
  }, [socket, groupId]);

  const onSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupId || !text.trim()) return;
    try {
      setLoading(true);
      await groupMessageService.sendText(groupId, text.trim());
      setText('');
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  const onSendFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !groupId) return;
    try {
      setLoading(true);
      await groupMessageService.sendMedia(groupId, file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  // Premium users cannot delete messages; deletion is admin-only in Admin panel

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-200px)] flex flex-col border rounded">
      <div className="p-3 border-b flex items-center justify-between">
        <h1 className="font-semibold">Group Chat</h1>
        <div className="text-sm text-gray-500">{messages.length} messages</div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
        {error && (
          <div className="mb-2 p-2 bg-red-50 border border-red-200 text-red-700 rounded">{error}</div>
        )}
        {messages.map((m) => (
          <div key={m._id} className="bg-white border rounded p-2">
            <div className="text-xs text-gray-500 flex items-center justify-between">
              <span>
                {typeof m.sender === 'string' ? m.sender : m.sender?.name || m.sender?.email}
              </span>
              <span>{new Date(m.createdAt).toLocaleString()}</span>
            </div>
            {m.text && <div className="mt-1">{m.text}</div>}
            {m.media?.url && (
              <div className="mt-2">
                {m.media.type === 'image' ? (
                  <img src={m.media.url} alt="upload" className="max-h-60 rounded" />
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
            {/* No delete option here for premium users */}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={onSend} className="p-3 border-t flex items-center gap-2">
        <input
          className="flex-1 border rounded px-3 py-2"
          placeholder="Type a message"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={loading}
        />
        <input ref={fileInputRef} type="file" onChange={onSendFile} />
        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
          disabled={loading || !text.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default GroupChatPage;
