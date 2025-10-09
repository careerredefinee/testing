import api from '../utils/api';

export interface Champion {
  _id?: string;
  name: string;
  company: string;
  beforeRole: string;
  afterRole: string;
  testimonial: string;
  rating: number;
  image: string;
  isFeatured?: boolean;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export async function fetchChampions(params?: { featured?: boolean; page?: number; limit?: number }) {
  const url = params?.featured ? '/api/v1/champions/featured' : '/api/v1/champions';
  const res = await api.get(url, { params });
  // Support both { data: { champions } } shapes
  const champions = (res.data?.data?.champions ?? res.data?.champions ?? []) as Champion[];
  return champions;
}

export async function createChampion(payload: FormData | Champion) {
  const isFormData = payload instanceof FormData;
  const res = await api.post('/api/v1/champions', payload, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
  });
  return (res.data?.data?.champion ?? res.data?.champion) as Champion;
}

export async function updateChampion(id: string, payload: FormData | Partial<Champion>) {
  const isFormData = payload instanceof FormData;
  const res = await api.patch(`/api/v1/champions/${id}`, payload, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
  });
  return (res.data?.data?.champion ?? res.data?.champion) as Champion;
}

export async function deleteChampion(id: string) {
  await api.delete(`/api/v1/champions/${id}`);
}
