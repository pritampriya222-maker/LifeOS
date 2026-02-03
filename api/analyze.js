export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'Server Configuration Error: API Key missing' });
    }

    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    try {
        // Model fallback strategy: Try 1.5 Flash, then Pro
        const primaryModel = 'gemini-1.5-flash';
        const fallbackModel = 'gemini-pro';

        // Updated endpoint URL logic
        const baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
        const url = `${baseUrl}/${primaryModel}:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || `API Error: ${response.statusText}`);
        }

        res.status(200).json(data);

    } catch (error) {
        console.error('Gemini API Error:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}
