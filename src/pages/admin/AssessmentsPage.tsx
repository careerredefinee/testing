import React, { useEffect, useMemo, useState } from 'react';
import { assessmentService, Assessment, AssessmentSubmission } from '../../services/assessmentService';
import { adminService } from '../../services/adminService';
import { toast } from 'react-toastify';

const AssessmentsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [submissions, setSubmissions] = useState<AssessmentSubmission[]>([]);
  const [creating, setCreating] = useState(false);
  const [filterAssessmentId, setFilterAssessmentId] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [users, setUsers] = useState<Array<{ _id: string; name: string; email: string }>>([]);
  const [query, setQuery] = useState('');
  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(u => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));
  }, [users, query]);

  const [form, setForm] = useState<{
    title: string;
    description: string;
    contentType: 'text' | 'media';
    textContent: string;
    mediaFile: File | null;
    assignedTo: string[];
    dueDate: string;
  }>({ title: '', description: '', contentType: 'text', textContent: '', mediaFile: null, assignedTo: [], dueDate: '' });

  const load = async () => {
    try {
      setLoading(true);
      const [a, s] = await Promise.all([
        assessmentService.listAssessments(),
        assessmentService.listSubmissions({}),
      ]);
      setAssessments(a);
      setSubmissions(s);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to load assessments');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await adminService.getUsers(1, 1000);
      const list = (data?.users || []) as Array<any>;
      setUsers(list.map((u) => ({ _id: u._id, name: u.name, email: u.email })));
    } catch (e) {
      // ignore silently
    }
  };

  useEffect(() => {
    load();
    loadUsers();
  }, []);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }
    try {
      setCreating(true);
      const created = await assessmentService.createAssessment({
        title: form.title,
        description: form.description,
        contentType: form.contentType,
        textContent: form.contentType === 'text' ? form.textContent : undefined,
        mediaFile: form.contentType === 'media' ? form.mediaFile : null,
        assignedTo: form.assignedTo,
        dueDate: form.dueDate || undefined,
      });
      toast.success('Assessment created');
      setForm({ title: '', description: '', contentType: 'text', textContent: '', mediaFile: null, assignedTo: [], dueDate: '' });
      setAssessments((prev) => [created, ...prev]);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to create');
    } finally {
      setCreating(false);
    }
  };

  const onDelete = async (id: string) => {
    if (!window.confirm('Delete this assessment? This will also delete submissions.')) return;
    try {
      await assessmentService.deleteAssessment(id);
      toast.success('Assessment deleted');
      setAssessments((prev) => prev.filter((x) => x._id !== id));
      setSubmissions((prev) => prev.filter((x) => (typeof x.assessment === 'string' ? x.assessment !== id : x.assessment._id !== id)));
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Delete failed');
    }
  };

  const onAssign = async (id: string, selected: string[]) => {
    try {
      const updated = await assessmentService.assignUsers(id, selected, 'replace');
      toast.success('Assignees updated');
      setAssessments((prev) => prev.map((a) => (a._id === id ? updated : a)));
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to assign users');
    }
  };

  const onReview = async (subId: string, status: 'approved' | 'rejected') => {
    const message = status === 'rejected' ? window.prompt('Optional rejection message:') || '' : undefined;
    try {
      const updated = await assessmentService.reviewSubmission(subId, status, message);
      setSubmissions((prev) => prev.map((s) => (s._id === subId ? updated : s)));
      toast.success(`Submission ${status}`);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to review');
    }
  };

  const onDeleteSubmission = async (subId: string) => {
    if (!window.confirm('Delete this submission?')) return;
    try {
      await assessmentService.deleteSubmission(subId);
      setSubmissions((prev) => prev.filter((s) => s._id !== subId));
      toast.success('Submission deleted');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to delete');
    }
  };

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((s) => {
      const matchesAssessment = filterAssessmentId ? (typeof s.assessment === 'string' ? s.assessment === filterAssessmentId : s.assessment._id === filterAssessmentId) : true;
      const matchesStatus = filterStatus ? s.status === filterStatus : true;
      return matchesAssessment && matchesStatus;
    });
  }, [submissions, filterAssessmentId, filterStatus]);

  return (
    <div className="space-y-10">
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Create Assessment</h2>
          <form onSubmit={onCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className="mt-1 w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Due date (optional)</label>
                <input type="date" value={form.dueDate} onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))} className="mt-1 w-full border rounded px-3 py-2" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className="mt-1 w-full border rounded px-3 py-2" rows={2} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Content Type</label>
                <select value={form.contentType} onChange={(e) => setForm((p) => ({ ...p, contentType: e.target.value as any }))} className="mt-1 w-full border rounded px-3 py-2">
                  <option value="text">Text</option>
                  <option value="media">Media (pdf/doc/img/txt)</option>
                </select>
              </div>
              {form.contentType === 'text' ? (
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700">Assessment Text</label>
                  <textarea value={form.textContent} onChange={(e) => setForm((p) => ({ ...p, textContent: e.target.value }))} className="mt-1 w-full border rounded px-3 py-2" rows={3} />
                </div>
              ) : (
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700">Upload Media</label>
                  <input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,image/*" onChange={(e) => setForm((p) => ({ ...p, mediaFile: e.target.files?.[0] || null }))} className="mt-1 w-full" />
                </div>
              )}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Assign Users</label>
                <input placeholder="Search users" value={query} onChange={(e) => setQuery(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" />
                <div className="mt-2 max-h-40 overflow-auto border rounded p-2">
                  {filteredUsers.map((u) => {
                    const checked = form.assignedTo.includes(u._id);
                    return (
                      <label key={u._id} className="flex items-center space-x-2 py-1">
                        <input type="checkbox" checked={checked} onChange={(e) => {
                          const isChecked = e.target.checked;
                          setForm((p) => ({ ...p, assignedTo: isChecked ? [...p.assignedTo, u._id] : p.assignedTo.filter((id) => id !== u._id) }));
                        }} />
                        <span>{u.name} ({u.email})</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
            <button disabled={creating} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              {creating ? 'Creating...' : 'Create Assessment'}
            </button>
          </form>
        </section>

        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Assessments</h2>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <div className="space-y-4">
              {assessments.map((a) => (
                <div key={a._id} className="border rounded p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{a.title}</h3>
                      {a.description && <p className="text-sm text-gray-600">{a.description}</p>}
                      <p className="text-xs text-gray-500">Type: {a.contentType}{a.dueDate ? ` • Due: ${new Date(a.dueDate).toLocaleDateString()}` : ''}</p>
                      {a.contentType === 'text' && a.textContent && (
                        <p className="mt-2 text-sm whitespace-pre-wrap bg-gray-50 p-2 rounded">{a.textContent}</p>
                      )}
                      {a.contentType === 'media' && a.media?.url && (
                        <a href={a.media.url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-blue-600 hover:underline">View media</a>
                      )}
                      <div className="mt-3">
                        <p className="text-sm font-medium">Assigned Users:</p>
                        <div className="text-sm text-gray-700">
                          {Array.isArray(a.assignedTo) && a.assignedTo.length > 0 ? (
                            (a.assignedTo as any[]).map((u) => <span key={typeof u === 'string' ? u : u._id} className="inline-block mr-2">{typeof u === 'string' ? u : `${u.name} (${u.email})`}</span>)
                          ) : (
                            <span>None</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="space-x-2">
                      <button onClick={() => onDelete(a._id)} className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100">Delete</button>
                    </div>
                  </div>

                  {/* Assign editor */}
                  <div className="mt-3">
                    <details>
                      <summary className="cursor-pointer text-sm text-blue-600">Edit Assignees</summary>
                      <div className="mt-2 max-h-40 overflow-auto border rounded p-2">
                        {users.map((u) => {
                          const checked = (a.assignedTo as any[]).map((x) => (typeof x === 'string' ? x : x._id)).includes(u._id);
                          return (
                            <label key={u._id} className="flex items-center space-x-2 py-1">
                              <input type="checkbox" checked={checked} onChange={(e) => {
                                const ids = new Set((a.assignedTo as any[]).map((x) => (typeof x === 'string' ? x : x._id)));
                                if (e.target.checked) ids.add(u._id); else ids.delete(u._id);
                                onAssign(a._id, Array.from(ids));
                              }} />
                              <span>{u.name} ({u.email})</span>
                            </label>
                          );
                        })}
                      </div>
                    </details>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Submitted Assessments</h2>
            <div className="flex space-x-2">
              <select value={filterAssessmentId} onChange={(e) => setFilterAssessmentId(e.target.value)} className="border rounded px-2 py-1">
                <option value="">All Assessments</option>
                {assessments.map((a) => (
                  <option key={a._id} value={a._id}>{a.title}</option>
                ))}
              </select>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="border rounded px-2 py-1">
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-4">Assessment</th>
                  <th className="py-2 pr-4">User</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">File</th>
                  <th className="py-2 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.map((s) => (
                  <tr key={s._id} className="border-b">
                    <td className="py-2 pr-4">{typeof s.assessment === 'string' ? s.assessment : s.assessment.title}</td>
                    <td className="py-2 pr-4">{typeof s.user === 'string' ? s.user : `${s.user.name} (${s.user.email})`}</td>
                    <td className="py-2 pr-4 capitalize">{s.status}{s.status === 'rejected' && s.reviewMessage ? `: ${s.reviewMessage}` : ''}</td>
                    <td className="py-2 pr-4">
                      <a className="text-blue-600 hover:underline" href={s.file.url} target="_blank" rel="noreferrer">View</a>
                    </td>
                    <td className="py-2 pr-4 space-x-2">
                      <button onClick={() => onReview(s._id, 'approved')} className="px-2 py-1 text-xs bg-green-600 text-white rounded">Approve</button>
                      <button onClick={() => onReview(s._id, 'rejected')} className="px-2 py-1 text-xs bg-yellow-600 text-white rounded">Reject</button>
                      <button onClick={() => onDeleteSubmission(s._id)} className="px-2 py-1 text-xs bg-red-600 text-white rounded">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
    </div>
  );
};

export default AssessmentsPage;
