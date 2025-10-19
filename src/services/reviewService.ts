import api from '../utils/api';

const BASE = '/api/v1/reviews';

export interface CreateReviewPayload {
  course?: string; // courseId
  rating: number;
  comment: string;
  images?: File[]; // optional images handled as multipart
}

export const reviewService = {
  // Public: get all reviews (latest first)
  getAll: async (params: { page?: number; limit?: number } = {}) => {
    const res = await api.get(BASE, { params });
    return res.data;
  },
  // Public: get reviews for a course
  getByCourse: async (courseId: string) => {
    const res = await api.get(`${BASE}/course/${courseId}`);
    return res.data;
  },

  // Public: get a single review
  getOne: async (id: string) => {
    const res = await api.get(`${BASE}/${id}`);
    return res.data;
  },

  // Authed: create a review (supports images)
  create: async (payload: CreateReviewPayload) => {
    const form = new FormData();
    if (payload.course) form.append('course', payload.course);
    form.append('rating', String(payload.rating));
    form.append('comment', payload.comment);
    if (payload.images && payload.images.length) {
      payload.images.forEach((file) => form.append('images', file));
    }
    const res = await api.post(BASE, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  // Authed: update review
  update: async (id: string, data: Partial<CreateReviewPayload>) => {
    const form = new FormData();
    if (data.course) form.append('course', data.course);
    if (typeof data.rating === 'number') form.append('rating', String(data.rating));
    if (typeof data.comment === 'string') form.append('comment', data.comment);
    if (data.images && data.images.length) {
      data.images.forEach((file) => form.append('images', file));
    }
    const res = await api.patch(`${BASE}/${id}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  // Authed: delete review
  remove: async (id: string) => {
    const res = await api.delete(`${BASE}/${id}`);
    return res.data;
  },

  // Authed: current user's reviews (optionally pass userId if needed)
  getByUser: async (userId: string) => {
    const res = await api.get(`${BASE}/user/${userId}`);
    return res.data;
  },
};
