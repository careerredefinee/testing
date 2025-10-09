import api from '../utils/api';

export type JoobleJob = {
  id?: string;
  title: string;
  location?: string;
  company?: string;
  snippet?: string;
  link?: string;
  salary?: string;
  updated?: string;
  type?: string;
};

export const joobleService = {
  // Fetch API key from server and then query Jooble directly from client
  // Filters kept minimal to avoid CORS issues; Jooble expects POST with JSON body
  getJobs: async (params: { keywords?: string; location?: string; radius?: number; page?: number } = {}): Promise<JoobleJob[]> => {
    // Use server endpoint that exposes key (already exists)
    const keyResp = await api.get('/get-api-key');
    const apiKey: string | undefined = keyResp?.data?.apiKey;
    if (!apiKey) return [];

    const body = {
      keywords: params.keywords || '',
      location: params.location || '',
      radius: params.radius ?? 10,
      page: params.page ?? 1,
    } as any;

    // Clean undefined
    Object.keys(body).forEach((k) => body[k] === undefined && delete body[k]);

    const resp = await fetch(`https://jooble.org/api/${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      return [];
    }
    const data = await resp.json();
    // Jooble returns { totalCount, jobs: [...] }
    return (data?.jobs || []) as JoobleJob[];
  }
};
