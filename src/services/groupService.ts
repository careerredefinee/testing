import apiClient from '../utils/api';

export type Group = {
  _id: string;
  name: string;
  members: string[];
  createdBy: string;
  createdAt: string;
};

export const groupService = {
  async list(): Promise<Group[]> {
    const res = await apiClient.get('/api/v1/groups');
    return res.data?.data?.groups || [];
  },
  async create(name: string): Promise<Group> {
    const res = await apiClient.post('/api/v1/groups', { name });
    return res.data?.data?.group;
  },
  async addMemberByEmail(groupId: string, email: string): Promise<Group> {
    const res = await apiClient.patch(`/api/v1/groups/${groupId}/add-member`, { email });
    return res.data?.data?.group;
  },
  async removeMember(groupId: string, userId: string): Promise<Group> {
    const res = await apiClient.patch(`/api/v1/groups/${groupId}/remove-member`, { userId });
    return res.data?.data?.group;
  },
  async delete(groupId: string): Promise<void> {
    await apiClient.delete(`/api/v1/groups/${groupId}`);
  },
};
