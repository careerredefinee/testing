import api from '../utils/api';

export interface Mentor {
  _id?: string;
  name: string;
  title: string;
  company?: string;
  bio?: string;
  image: string;
  linkedin?: string;
  isFeatured?: boolean;
  order?: number;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export async function fetchMentors(params?: { featured?: boolean; page?: number; limit?: number }) {
  const url = params?.featured ? '/api/v1/mentors/featured' : '/api/v1/mentors';
  const res = await api.get(url, { params });
  const mentors = (res.data?.data?.mentors ?? res.data?.mentors ?? []) as Mentor[];
  return mentors;
}

export async function createMentor(payload: FormData | Mentor) {
  const isFormData = payload instanceof FormData;
  const res = await api.post('/api/v1/mentors', payload, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
  });
  return (res.data?.data?.mentor ?? res.data?.mentor) as Mentor;
}

export async function updateMentor(id: string, payload: FormData | Partial<Mentor>) {
  const isFormData = payload instanceof FormData;
  const res = await api.patch(`/api/v1/mentors/${id}`, payload, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
  });
  return (res.data?.data?.mentor ?? res.data?.mentor) as Mentor;
}

export async function deleteMentor(id: string) {
  await api.delete(`/api/v1/mentors/${id}`);
}
