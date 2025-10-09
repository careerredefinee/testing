import api from '../utils/api';

const API_BASE_URL = '/api/v1/ai';

interface AIChatRequest {
  message: string;
  userId?: string;
  tool?: string;
  context?: any;
}

export const aiService = {
  chat: async ({ message, userId, tool, context }: AIChatRequest) => {
    try {
      const response = await api.post(`${API_BASE_URL}/chat`, {
        message,
        userId,
        tool,
        context,
      });
      // Server returns { status, data: { reply } }
      // Normalize to { data: { reply } } so callers can use resp.data.reply
      return { data: response.data?.data } as any;
    } catch (error) {
      console.error('AI Service Error:', error);
      throw error;
    }
  },
  
  generateCode: async (prompt: string, language: string = 'javascript') => {
    try {
      const response = await api.post(`${API_BASE_URL}/code`, {
        prompt,
        language,
      });
      return response.data;
    } catch (error) {
      console.error('Code Generation Error:', error);
      throw error;
    }
  },
  
  generateImage: async (prompt: string, style: string = 'realistic') => {
    try {
      const response = await api.post(`${API_BASE_URL}/image`, {
        prompt,
        style,
      });
      // Server returns { status, data: { imageDataUrl } }
      return { data: response.data?.data } as any;
    } catch (error) {
      console.error('Image Generation Error:', error);
      throw error;
    }
  },
  
  analyzeDocument: async (content: string, analysisType: string = 'summary') => {
    try {
      const response = await api.post(`${API_BASE_URL}/document`, { content, analysisType });
      return response.data;
    } catch (error) {
      console.error('Document Analysis Error:', error);
      throw error;
    }
  },
  
  generateMusic: async (prompt: string, style: string = 'ambient') => {
    try {
      const response = await api.post(`${API_BASE_URL}/music`, {
        prompt,
        style,
      });
      return response.data;
    } catch (error) {
      console.error('Music Generation Error:', error);
      throw error;
    }
  },
  
  generateVideo: async (prompt: string, style: string = 'realistic') => {
    try {
      const response = await api.post(`${API_BASE_URL}/video`, {
        prompt,
        style,
      });
      return response.data;
    } catch (error) {
      console.error('Video Generation Error:', error);
      throw error;
    }
  },
};
