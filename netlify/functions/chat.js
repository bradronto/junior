exports.handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

  try {
    const { message, model } = JSON.parse(event.body || '{}');

    if (!message) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Message is required' }),
      };
    }

    if (!process.env.OLLAMA_URL) {
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({
          error: 'OLLAMA_URL not configured',
          details: 'Set the OLLAMA_URL environment variable in Netlify to your cloudflared tunnel URL',
        }),
      };
    }

    console.log('Calling Ollama at:', OLLAMA_URL);

    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model || 'gemma3:4b',
        prompt: message,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Ollama error:', response.status, errText);
      throw new Error(`Ollama returned ${response.status}: ${errText}`);
    }

    const data = await response.json();

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        response: data.response,
        model: data.model,
      }),
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        error: 'Failed to get AI response',
        details: error.message || 'Unknown error',
      }),
    };
  }
};
