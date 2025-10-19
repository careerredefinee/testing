import api from '../utils/api';

export interface AssessmentFile {
  url: string;
  publicId: string;
  originalName: string;
  mimetype: string;
  size: number;
}

export interface Assessment {
  _id: string;
  title: string;
  description?: string;
  contentType: 'text' | 'media';
  textContent?: string;
  media?: AssessmentFile | null;
  assignedTo: Array<{ _id: string; name: string; email: string }> | string[];
  dueDate?: string;
  createdAt: string;
}

export interface AssessmentSubmission {
  _id: string;
  assessment: string | { _id: string; title: string };
  user: string | { _id: string; name: string; email: string };
  file: AssessmentFile;
  status: 'pending' | 'approved' | 'rejected';
  reviewMessage?: string;
  reviewedAt?: string;
}

export const assessmentService = {
  // Admin
  async listAssessments() {
    const res = await api.get('/api/v1/assessments');
    return (res as any).data.data.assessments as Assessment[];
  },
  async createAssessment(payload: { title: string; description?: string; contentType: 'text' | 'media'; textContent?: string; mediaFile?: File | null; assignedTo: string[]; dueDate?: string; }) {
    const form = new FormData();
    form.append('title', payload.title);
    if (payload.description) form.append('description', payload.description);
    form.append('contentType', payload.contentType);
    if (payload.contentType === 'text' && payload.textContent) form.append('textContent', payload.textContent);
    if (payload.contentType === 'media' && payload.mediaFile) form.append('media', payload.mediaFile);
    payload.assignedTo.forEach((id) => form.append('assignedTo[]', id));
    if (payload.dueDate) form.append('dueDate', payload.dueDate);
    const res = await api.post('/api/v1/assessments', form, { headers: { 'Content-Type': 'multipart/form-data' } });
    return (res as any).data.data.assessment as Assessment;
  },
  async updateAssessment(id: string, payload: { title?: string; description?: string; contentType?: 'text' | 'media'; textContent?: string; mediaFile?: File | null; dueDate?: string | null; }) {
    const form = new FormData();
    if (payload.title !== undefined) form.append('title', payload.title);
    if (payload.description !== undefined) form.append('description', payload.description);
    if (payload.contentType !== undefined) form.append('contentType', payload.contentType);
    if (payload.contentType === 'text' && payload.textContent !== undefined) form.append('textContent', payload.textContent);
    if (payload.contentType === 'media' && payload.mediaFile) form.append('media', payload.mediaFile);
    if (payload.dueDate !== undefined && payload.dueDate !== null) form.append('dueDate', payload.dueDate);
    const res = await api.patch(`/api/v1/assessments/${id}`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
    return (res as any).data.data.assessment as Assessment;
  },
  async deleteAssessment(id: string) {
    await api.delete(`/api/v1/assessments/${id}`);
  },
  async assignUsers(id: string, userIds: string[], mode: 'replace' | 'append' = 'replace') {
    const res = await api.patch(`/api/v1/assessments/${id}/assign`, { userIds, mode });
    return (res as any).data.data.assessment as Assessment;
  },

  // Users
  async listMyAssessments() {
    const res = await api.get('/api/v1/assessments/mine');
    return (res as any).data.data.items as Array<{ assessment: Assessment; submission: AssessmentSubmission | null }>;
  },
  async submitAssessment(assessmentId: string, file: File) {
    const form = new FormData();
    form.append('file', file);
    const res = await api.post(`/api/v1/assessments/${assessmentId}/submit`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
    return (res as any).data.data.submission as AssessmentSubmission;
  },

  // Admin review
  async listSubmissions(params?: { assessmentId?: string; status?: 'pending' | 'approved' | 'rejected' }) {
    const res = await api.get('/api/v1/assessment-submissions', { params });
    return (res as any).data.data.submissions as AssessmentSubmission[];
  },
  async reviewSubmission(id: string, status: 'approved' | 'rejected', message?: string) {
    const res = await api.patch(`/api/v1/assessment-submissions/${id}/review`, { status, message });
    return (res as any).data.data.submission as AssessmentSubmission;
  },
  async deleteSubmission(id: string) {
    await api.delete(`/api/v1/assessment-submissions/${id}`);
  }
};

export default assessmentService;
