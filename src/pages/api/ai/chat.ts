import { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Initialize the model
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, userId } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    // Generate content using Gemini
    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `You are a helpful AI assistant. Respond to the following message in a friendly and helpful manner:\n\n${message}`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 1024,
      },
    });

    const response = await result.response;
    const text = response.text();

    // Log the interaction (optional)
    console.log(`User ${userId} asked: ${message}`);
    console.log(`AI responded: ${text}`);

    return res.status(200).json({ reply: text });
  } catch (error) {
    console.error('Error generating response:', error);
    return res.status(500).json({ 
      error: 'Failed to generate response',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
