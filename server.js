import express from "express";
import dotenv from "dotenv";
import { callChat, generateImage } from "./callOpenRouter.js";
import { loadMemory, saveMemory } from "./memory.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());

let memory = await loadMemory();

// Endpoint Messenger ou test
app.post("/message", async (req, res) => {
  const { text } = req.body;

  if (!text) return res.status(400).json({ reply: "Pas de message reçu." });

  let reply;
  if (text.toLowerCase().startsWith("image:") || text.toLowerCase().startsWith("sary:")) {
    const prompt = text.split(":")[1].trim();
    const url = await generateImage(prompt);
    reply = url ? `Voici ton image : ${url}` : "Impossible de générer l'image.";
  } else {
    reply = await callChat(text, memory);
    // Mettre à jour la mémoire
    memory.push({ role: "user", content: text });
    memory.push({ role: "assistant", content: reply });
    await saveMemory(memory);
  }

  res.json({ reply });
});

app.get("/", (req, res) => {
  res.send("Bot Meva en ligne ✅");
});

app.listen(PORT, () => console.log(`🔥 Bot en ligne sur port ${PORT}`));
