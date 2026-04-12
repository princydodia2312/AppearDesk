const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ message: 'messages array is required' });
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: `You are a helpful fashion assistant for AppearDesk, a clothing e-commerce store. Help customers with outfit suggestions, sizing advice, style tips, and product questions. Keep responses friendly, short (2-3 sentences max), and fashion-focused. If asked something unrelated to clothing or shopping, politely redirect the conversation.`,
          },
          ...messages,
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Groq API error:', data);
      return res.status(500).json({ message: 'Groq API error', detail: data });
    }

    const reply = data.choices?.[0]?.message?.content || "Sorry, I couldn't get a response.";
    res.json({ reply });

  } catch (err) {
    console.error('Chat route error:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
