import apiClient from '../utils/api';

export type GroupMessage = {
  _id: string;
  group: string;
  sender: { _id: string; name: string; email: string; role: string } | string;
  text?: string;
  media?: { url: string; publicId: string; type: 'image' | 'file'; mimetype?: string; size?: number };
  isDeleted?: boolean;
  createdAt: string;
};

export const groupMessageService = {
  async list(groupId: string, page = 1, limit = 30): Promise<GroupMessage[]> {
    const res = await apiClient.get(`/api/v1/groups/${groupId}/messages`, { params: { page, limit } });
    return res.data?.data?.messages || [];
  },
  async sendText(groupId: string, text: string): Promise<GroupMessage> {
    const res = await apiClient.post(`/api/v1/groups/${groupId}/messages`, { text });
    return res.data?.data?.message;
  },
  async sendMedia(groupId: string, file: File): Promise<GroupMessage> {
    const form = new FormData();
    form.append('media', file);
    const res = await apiClient.post(`/api/v1/groups/${groupId}/messages`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data?.data?.message;
  },
  async deleteMessage(messageId: string): Promise<void> {
    await apiClient.delete(`/api/v1/group-messages/${messageId}`);
  },
};
