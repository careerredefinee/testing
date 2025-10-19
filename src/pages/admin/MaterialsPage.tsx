import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';

interface Material {
  _id: string;
  name: string;
  url: string;
  createdAt: string;
}

const MaterialsPage: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.listMaterials(); // { materials }
      setMaterials(data?.materials || []);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load materials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please choose a PDF file');
      return;
    }
    setUploading(true);
    setError(null);
    try {
      await adminService.uploadMaterial({ name, file });
      setName('');
      setFile(null);
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to upload material');
    } finally {
      setUploading(false);
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm('Delete this material?')) return;
    try {
      await adminService.deleteMaterial(id);
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to delete');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Materials</h1>
        <p className="text-sm text-gray-500">Upload PDFs for premium users.</p>
      </div>

      <form onSubmit={onUpload} className="bg-white shadow rounded p-6 space-y-4">
        <h2 className="text-lg font-semibold">Add Material</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700">Material name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Data Science Notes (Week 1)"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">PDF file</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="mt-1 block w-full text-sm"
          />
        </div>
        {error && <div className="text-sm text-red-600">{error}</div>}
        <button
          type="submit"
          disabled={uploading}
          className="inline-flex items-center px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {uploading ? 'Uploading...' : 'Add Material'}
        </button>
      </form>

      <div className="bg-white shadow rounded p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">All Materials</h2>
          <button onClick={load} className="text-sm text-blue-600 hover:text-blue-700">Refresh</button>
        </div>
        {loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : materials.length === 0 ? (
          <div className="text-gray-500">No materials uploaded yet.</div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {materials.map((m) => (
              <li key={m._id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{m.name}</div>
                  <div className="text-sm text-gray-500">{new Date(m.createdAt).toLocaleString()}</div>
                </div>
                <div className="flex gap-3 items-center">
                  <a href={m.url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:text-blue-700">View</a>
                  <button
                    onClick={() => onDelete(m._id)}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MaterialsPage;
