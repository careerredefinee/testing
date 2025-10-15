import api from '../utils/api';

export const materialService = {
  list: async () => {
    const response = await api.get('/api/v1/materials');
    return response.data?.data; // { materials }
  },
};
