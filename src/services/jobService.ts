import api from '../utils/api';
import { Job, JobFormData } from '../types/job';

export const jobService = {
  // Get all active jobs (public)
  getJobs: async (params: { page?: number; limit?: number } = {}): Promise<any[]> => {
    const response = await api.get('/api/v1/jobs', { params });
    // Backend shape: { status, results, data: { jobs: [...] } }
    return response.data?.data?.jobs || [];
  },

  // Get featured jobs (public)
  getFeaturedJobs: async (): Promise<any[]> => {
    const response = await api.get('/api/v1/jobs/featured');
    return response.data?.data?.jobs || [];
  },

  // Create a new job
  createJob: async (jobData: JobFormData): Promise<Job> => {
    // Convert requirements string to array
    const formattedData = {
      ...jobData,
      requirements: jobData.requirements
        .split('\n')
        .map(req => req.trim())
        .filter(Boolean)
    };

    const response = await api.post('/api/v1/jobs', formattedData);
    // Backend returns { data: { job } }
    return response.data?.data?.job as Job;
  },

  // Update a job
  updateJob: async (id: string, jobData: Partial<JobFormData>): Promise<Job> => {
    const formattedData = jobData.requirements
      ? {
          ...jobData,
          requirements: jobData.requirements
            .split('\n')
            .map(req => req.trim())
            .filter(Boolean)
        }
      : jobData;

    const response = await api.patch(`/api/v1/jobs/${id}`, formattedData);
    return response.data?.data?.job as Job;
  },

  // Delete a job
  deleteJob: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/jobs/${id}`);
  },

  // Toggle job status (active/inactive)
  toggleJobStatus: async (id: string, isActive: boolean): Promise<Job> => {
    // Backend doesn't expose a dedicated /status route; send status field on PATCH
    const status = isActive ? 'active' : 'paused';
    const response = await api.patch(`/api/v1/jobs/${id}`, { status });
    return response.data?.data?.job as Job;
  }
};

