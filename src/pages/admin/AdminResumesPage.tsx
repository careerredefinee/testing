import React, { useEffect, useState } from 'react';
import BASE_URL from '../../config';

interface ResumeItem {
  _id: string;
  filename: string;
  mimetype: string;
  size: number;
  createdAt: string;
  user?: { _id: string; name: string; email: string };
}

const AdminResumesPage: React.FC = () => {
  const [items, setItems] = useState<ResumeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const resp = await fetch(`${BASE_URL}/api/v1/resume`, { credentials: 'include' });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.message || 'Failed to load');
      setItems(data?.data?.resumes || []);
    } catch (e:any) { setError(e.message || 'Failed'); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const del = async (id: string) => {
    if (!confirm('Delete this resume?')) return;
    try {
      const resp = await fetch(`${BASE_URL}/api/v1/resume/${id}`, { method: 'DELETE', credentials: 'include' });
      if (!resp.ok && resp.status !== 204) {
        const data = await resp.json().catch(()=>null);
        throw new Error((data && (data.message||data.error)) || 'Delete failed');
      }
      setItems(prev => prev.filter(i => i._id !== id));
    } catch (e:any) { alert(e.message || 'Delete failed'); }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Resumes</h1>
      {error && <div className="mb-3 text-red-600 text-sm">{error}</div>}
      {loading ? (
        <div>Loading…</div>
      ) : (
        <div className="overflow-x-auto border rounded-md">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left">Filename</th>
                <th className="px-3 py-2 text-left">User</th>
                <th className="px-3 py-2 text-left">MIME</th>
                <th className="px-3 py-2 text-left">Size</th>
                <th className="px-3 py-2 text-left">Created</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item._id} className="border-t">
                  <td className="px-3 py-2">{item.filename}</td>
                  <td className="px-3 py-2">{item.user ? `${item.user.name} (${item.user.email})` : '-'}</td>
                  <td className="px-3 py-2">{item.mimetype}</td>
                  <td className="px-3 py-2">{(item.size / 1024).toFixed(1)} KB</td>
                  <td className="px-3 py-2">{new Date(item.createdAt).toLocaleString()}</td>
                  <td className="px-3 py-2 text-right">
                    <button className="px-3 py-1.5 rounded-md border text-red-600" onClick={()=> del(item._id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td className="px-3 py-6 text-center text-gray-500" colSpan={6}>No resumes found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminResumesPage;
