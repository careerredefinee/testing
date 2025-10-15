import api from '../utils/api';

export interface CallbackRequest {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  createdAt?: string;
}

export const callbackService = {
  createRequest: async (data: Omit<CallbackRequest, '_id' | 'createdAt'>): Promise<CallbackRequest> => {
    const res = await api.post('/api/v1/callbacks', data);
    return res.data.data.callback;
  },
  
  getRequests: async (): Promise<CallbackRequest[]> => {
    const res = await api.get('/api/v1/callbacks');
    return res.data.data.callbacks || [];
  },
  
  deleteRequest: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/callbacks/${id}`);
  }
};
