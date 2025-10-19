import api from '../utils/api';

export interface Course {
  _id: string;
  title: string;
  shortDescription?: string;
  description?: string;
  image?: string;
  price?: number;
  duration?: number; // weeks
  level?: 'beginner' | 'intermediate' | 'advanced';
  category?: string;
  syllabus?: any[];
  instructor?: { _id: string; name: string; photo?: string };
  isPublished: boolean;
  enrolledStudents?: Array<{ user: string; enrolledAt: string }>;
  rating?: number;
  numReviews?: number;
  tags?: string[];
  ratingsAverage?: number;
  ratingsQuantity?: number;
  pageLink?: string;
}

export const courseService = {
  getCourses: async (params: { page?: number; limit?: number; sort?: string } = {}): Promise<Course[]> => {
    const res = await api.get('/api/v1/courses', { params });
    return res.data?.data?.courses || [];
  },
  getPopular: async (): Promise<Course[]> => {
    const res = await api.get('/api/v1/courses/popular');
    return res.data?.data?.courses || [];
  },
  getById: async (id: string): Promise<Course | null> => {
    const res = await api.get(`/api/v1/courses/${id}`);
    return res.data?.data?.course || null;
  }
};
