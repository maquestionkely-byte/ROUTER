import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL_CHAT = process.env.MODEL_CHAT;
const MODEL_IMAGE = process.env.MODEL_IMAGE;

// Chat avec Gemini 2.0 Flash
export async function callChat(userText, memory = []) {
  const messages = [
    {
      role: "system",
      content: "Tu es Meva, prof de français, tu corriges et expliques avec pédagogie."
    },
    ...memory,
    { role: "user", content: userText }
  ];

  try {
    const res = await fetch("https://api.openrouter.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL_CHAT,
        messages,
        temperature: 0.7,
        max_output_tokens: 500
      })
    });

    const data = await res.json();

    const reply = data?.choices?.[0]?.message?.content || "Je ne peux pas répondre pour le moment.";
    return reply;

  } catch (e) {
    console.error("Erreur OpenRouter chat:", e);
    return "Erreur technique du bot.";
  }
}

// Génération d'image
export async function generateImage(prompt) {
  try {
    const res = await fetch("https://api.openrouter.ai/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL_IMAGE,
        prompt,
        size: "1024x1024",
        n: 1
      })
    });

    const data = await res.json();
    const url = data?.data?.[0]?.url || null;
    return url;

  } catch (e) {
    console.error("Erreur génération image:", e);
    return null;
  }
}
