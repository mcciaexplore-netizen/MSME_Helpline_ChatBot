import { GoogleGenAI } from '@google/genai';

// This function is designed to be deployed as a Vercel Edge Function.
// For local development, use the Vercel CLI (`vercel dev`).
export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: { 'Allow': 'POST' } });
  }

  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Securely get the API key from environment variables (set in Vercel settings)
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY is not set in environment variables.");
      // Do not expose the internal error reason to the client
      return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Construct the full prompt with system instructions
    const fullPrompt = `You are an expert assistant for Micro, Small, and Medium Enterprises (MSMEs) in India. Keep your answers concise, helpful, and easy to understand. User query: "${prompt}"`;
    
    const responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: fullPrompt,
    });

    // Create a new stream to send the response back to the client
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of responseStream) {
          const chunkText = chunk.text;
          // Edge runtime streams expect Uint8Array
          controller.enqueue(new TextEncoder().encode(chunkText));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });

  } catch (error) {
    console.error('Error in Vercel Edge Function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ error: 'Failed to generate content', details: errorMessage }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}