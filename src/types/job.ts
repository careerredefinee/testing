export type WorkMode = 'remote' | 'office' | 'hybrid';

export interface Job {
  _id?: string;
  title: string;
  company: string;
  salary: string;
  requirements: string[];
  description: string;
  workMode: WorkMode;
  applicationLink: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface JobFormData {
  title: string;
  company: string;
  salary: string;
  requirements: string;
  description: string;
  workMode: WorkMode;
  applicationLink: string;
}
