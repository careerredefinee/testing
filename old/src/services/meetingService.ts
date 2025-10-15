import api from '../utils/api';

export type PremiumMeeting = {
  _id: string;
  user: string | { _id: string; name?: string; email?: string };
  name: string;
  email: string;
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  meetingLink?: string;
  scheduledAt?: string;
  createdAt: string;
  updatedAt: string;
};

export const meetingService = {
  async create(data: { name: string; email: string; message?: string }) {
    const res = await api.post(`/api/v1/premium-meetings`, data);
    return res.data?.data?.meeting as PremiumMeeting;
  },
  async mine() {
    const res = await api.get(`/api/v1/premium-meetings/mine`);
    return (res.data?.data?.meetings || []) as PremiumMeeting[];
  },
  async adminList() {
    const res = await api.get(`/api/v1/admin/premium-meetings`);
    return (res.data?.data?.meetings || []) as PremiumMeeting[];
  },
  async adminUpdate(id: string, payload: { status: 'approved' | 'rejected' | 'pending'; meetingLink?: string; scheduledAt?: string }) {
    const res = await api.patch(`/api/v1/admin/premium-meetings/${id}`, payload);
    return res.data?.data?.meeting as PremiumMeeting;
  },
  async adminDelete(id: string) {
    await api.delete(`/api/v1/admin/premium-meetings/${id}`);
  }
};
