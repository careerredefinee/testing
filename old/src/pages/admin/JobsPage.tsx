import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { jobService } from '../../services/jobService';
import { Job, JobFormData } from '../../types/job';

const AdminJobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  // navigate is available if needed for future navigation
  
  const { register, handleSubmit, reset, setValue } = useForm<JobFormData>({
    defaultValues: {
      title: '',
      company: '',
      salary: '',
      requirements: '',
      description: '',
      workMode: 'office',
      applicationLink: ''
    }
  });

  // Load jobs
  useEffect(() => {
    const loadJobs = async () => {
      try {
        const data = await jobService.getJobs();
        setJobs(data);
      } catch (error) {
        toast.error('Failed to load jobs');
        console.error('Error loading jobs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadJobs();
  }, []);

  // Set form values when editing
  useEffect(() => {
    if (editingJob) {
      Object.entries(editingJob).forEach(([key, value]) => {
        if (key === 'requirements') {
          setValue('requirements', (value as string[]).join('\n'));
        } else if (key in editingJob) {
          setValue(key as keyof JobFormData, value as any);
        }
      });
    } else {
      reset();
    }
  }, [editingJob, setValue, reset]);

  const onSubmit = async (data: JobFormData) => {
    setIsSubmitting(true);
    try {
      if (editingJob) {
        const updatedJob = await jobService.updateJob(editingJob._id!, data);
        setJobs(jobs.map(job => job._id === updatedJob._id ? updatedJob : job));
        toast.success('Job updated successfully');
      } else {
        const newJob = await jobService.createJob(data);
        setJobs([...jobs, newJob]);
        toast.success('Job created successfully');
      }
      setEditingJob(null);
      reset();
    } catch (error) {
      toast.error(`Failed to ${editingJob ? 'update' : 'create'} job`);
      console.error('Error saving job:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (job: Job) => {
    setEditingJob(job);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await jobService.deleteJob(id);
        setJobs(jobs.filter(job => job._id !== id));
        toast.success('Job deleted successfully');
        if (editingJob?._id === id) {
          setEditingJob(null);
          reset();
        }
      } catch (error) {
        toast.error('Failed to delete job');
        console.error('Error deleting job:', error);
      }
    }
  };

  const toggleJobStatus = async (job: Job) => {
    try {
      const updatedJob = await jobService.toggleJobStatus(job._id!, !job.isActive);
      setJobs(jobs.map(j => (j._id === updatedJob._id ? updatedJob : j)));
      toast.success(`Job ${updatedJob.isActive ? 'activated' : 'deactivated'}`);
    } catch (error) {
      toast.error('Failed to update job status');
      console.error('Error toggling job status:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {editingJob ? 'Edit Job' : 'Add New Job'}
        </h1>
        {editingJob && (
          <button
            onClick={() => {
              setEditingJob(null);
              reset();
            }}
            className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800"
          >
            + Add New Job
          </button>
        )}
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Job Title *
              </label>
              <input
                type="text"
                id="title"
                {...register('title', { required: 'Job title is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Senior Frontend Developer"
              />
            </div>

            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                Company Name *
              </label>
              <input
                type="text"
                id="company"
                {...register('company', { required: 'Company name is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Tech Corp"
              />
            </div>

            <div>
              <label htmlFor="salary" className="block text-sm font-medium text-gray-700 mb-1">
                Salary Range *
              </label>
              <input
                type="text"
                id="salary"
                {...register('salary', { required: 'Salary range is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., $80,000 - $120,000 per year"
              />
            </div>

            <div>
              <label htmlFor="workMode" className="block text-sm font-medium text-gray-700 mb-1">
                Work Mode *
              </label>
              <select
                id="workMode"
                {...register('workMode', { required: 'Work mode is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="office">Office</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Job Description *
            </label>
            <textarea
              id="description"
              rows={4}
              {...register('description', { required: 'Job description is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Detailed job description..."
            />
          </div>

          <div>
            <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-1">
              Requirements (one per line) *
            </label>
            <textarea
              id="requirements"
              rows={4}
              {...register('requirements', { required: 'At least one requirement is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              placeholder="- 3+ years of experience\n- Bachelor's degree in Computer Science\n- Experience with React and TypeScript"
            />
          </div>

          <div>
            <label htmlFor="applicationLink" className="block text-sm font-medium text-gray-700 mb-1">
              Application Link *
            </label>
            <input
              type="url"
              id="applicationLink"
              {...register('applicationLink', { required: 'Application link is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://example.com/apply"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            {editingJob && (
              <button
                type="button"
                onClick={() => {
                  setEditingJob(null);
                  reset();
                }}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                'Saving...'
              ) : editingJob ? (
                'Update Job'
              ) : (
                'Add Job'
              )}
            </button>
          </div>
        </form>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Listings</h2>
        {jobs.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No jobs found. Add your first job listing above.</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {jobs.map((job) => (
                <li key={job._id} className="hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-blue-600 truncate">
                            {job.title}
                          </p>
                          <div className="ml-2 flex-shrink-0 flex">
                            <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              {job.company}
                            </p>
                          </div>
                        </div>
                        <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
                          <div className="mt-2 flex items-center text-sm text-gray-500">
                            <span className="capitalize">{job.workMode}</span>
                            <span className="mx-1">•</span>
                            <span>{job.salary}</span>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4 flex-shrink-0 flex space-x-2">
                        <button
                          onClick={() => toggleJobStatus(job)}
                          className={`p-2 rounded-full ${job.isActive ? 'text-green-600 hover:bg-green-100' : 'text-gray-400 hover:bg-gray-100'}`}
                          title={job.isActive ? 'Deactivate job' : 'Activate job'}
                        >
                          {job.isActive ? (
                            <ToggleRight className="h-5 w-5" />
                          ) : (
                            <ToggleLeft className="h-5 w-5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleEdit(job)}
                          className="p-2 rounded-full text-blue-600 hover:bg-blue-100"
                          title="Edit job"
                        >
                          <Pencil className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(job._id!)}
                          className="p-2 rounded-full text-red-600 hover:bg-red-100"
                          title="Delete job"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminJobsPage;
