export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, mode } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt missing' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not set in Vercel' });
  }

  const url =
    'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=' +
    apiKey;

  let body;

  if (mode === 'image') {
    body = {
      contents: [
        {
          parts: [
            {
              text: `Create a very detailed image prompt based on this request:\n${prompt}\n\nReturn ONLY the description.`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.9,
        maxOutputTokens: 500
      }
    };
  } else {
    body = {
      contents: [
        {
          parts: [
            {
              text: `You are NOVA AI.
Reply in Malagasy by default.
User question:\n${prompt}`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 2000
      }
    };
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: data.error?.message || 'Gemini error' });
    }

    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      'Tsy nisy valiny azo';

    return res.status(200).json({ text });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
