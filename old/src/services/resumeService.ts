import api from '../utils/api';

export const resumeService = {
  analyze: async (file: File) => {
    const form = new FormData();
    form.append('file', file);
    const res = await api.post('/api/v1/resume/analyze', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};
