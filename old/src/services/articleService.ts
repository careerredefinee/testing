import api from '../utils/api';

export interface Article {
  _id: string;
  title: string;
  summary: string;
  image?: string;
  tags?: string[];
  publishedAt?: string;
  link?: string;
}

export const articleService = {
  // Public: list articles with optional params
  getArticles: async (params: { page?: number; limit?: number; tag?: string } = {}): Promise<Article[]> => {
    const res = await api.get('/api/v1/articles', { params });
    return res.data?.data?.articles || [];
  },

  // Public: featured articles
  getFeatured: async (): Promise<Article[]> => {
    const res = await api.get('/api/v1/articles/featured');
    return res.data?.data?.articles || [];
  },

  // Public: single article
  getById: async (id: string): Promise<Article | null> => {
    const res = await api.get(`/api/v1/articles/${id}`);
    return res.data?.data?.article || null;
  }
};
