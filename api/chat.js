const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

function setCorsHeaders(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function safeJsonParse(value) {
    if (!value || typeof value !== 'string') return null;
    try {
        return JSON.parse(value);
    } catch (_) {
        return null;
    }
}

export default async function handler(req, res) {
    setCorsHeaders(res);

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const apiKey = process.env.DEEPSEEK_API_KEY || process.env.MY_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'Missing server API key: DEEPSEEK_API_KEY (or MY_API_KEY)' });
    }

    const parsedBody = typeof req.body === 'string' ? safeJsonParse(req.body) : req.body;
    const prompt = typeof parsedBody?.prompt === 'string' ? parsedBody.prompt.trim() : '';
    const model = typeof parsedBody?.model === 'string' && parsedBody.model.trim()
        ? parsedBody.model.trim()
        : 'deepseek-v4-flash';
    const systemPrompt = typeof parsedBody?.systemPrompt === 'string' ? parsedBody.systemPrompt.trim() : '';
    const thinkingEnabled = Boolean(parsedBody?.thinking?.type === 'enabled' || parsedBody?.thinkingEnabled);
    const reasoningEffort = typeof parsedBody?.reasoning_effort === 'string' ? parsedBody.reasoning_effort : undefined;

    if (!prompt) {
        return res.status(400).json({ error: 'prompt is required' });
    }

    try {
        const messages = [];
        if (systemPrompt) {
            messages.push({ role: 'system', content: systemPrompt });
        }
        messages.push({ role: 'user', content: prompt });

        const requestPayload = {
            model,
            messages
        };
        if (thinkingEnabled) {
            requestPayload.thinking = { type: 'enabled' };
        }
        if (reasoningEffort) {
            requestPayload.reasoning_effort = reasoningEffort;
        }

        const upstreamResponse = await fetch(DEEPSEEK_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`
            },
            body: JSON.stringify(requestPayload)
        });

        const rawText = await upstreamResponse.text();
        const data = safeJsonParse(rawText);

        if (!upstreamResponse.ok) {
            const upstreamErrorMessage =
                (data && data.error && data.error.message) ||
                `Upstream request failed with status ${upstreamResponse.status}`;
            return res.status(upstreamResponse.status).json({
                error: upstreamErrorMessage
            });
        }

        const reply = data?.choices?.[0]?.message?.content?.trim() || '';
        return res.status(200).json({
            reply,
            model: data?.model || model
        });
    } catch (error) {
        console.error('Error in /api/chat:', error);
        return res.status(500).json({
            error: 'Internal Server Error'
        });
    }
}
