import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";
import { callChat, generateImage } from "./callOpenRouter.js";
import { loadMemory, saveMemory } from "./memory.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());

let memory = await loadMemory();

// ===============================
// Vérification du webhook Messenger
// ===============================
app.get("/webhook", (req, res) => {
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("Webhook vérifié ✅");
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(400);
  }
});

// ===============================
// Endpoint pour les messages Messenger
// ===============================
app.post("/webhook", async (req, res) => {
  const body = req.body;

  if (body.object === "page") {
    for (const entry of body.entry) {
      for (const event of entry.messaging) {
        const senderId = event.sender.id;
        const text = event.message?.text;

        if (!text) continue;

        let reply;

        if (text.toLowerCase().startsWith("image:") || text.toLowerCase().startsWith("sary:")) {
          const prompt = text.split(":")[1].trim();
          const url = await generateImage(prompt);
          reply = url ? `Voici ton image : ${url}` : "Impossible de générer l'image.";
        } else {
          reply = await callChat(text, memory);
          memory.push({ role: "user", content: text });
          memory.push({ role: "assistant", content: reply });
          await saveMemory(memory);
        }

        // Envoyer la réponse via Messenger API
        await fetch(`https://graph.facebook.com/v16.0/me/messages?access_token=${process.env.PAGE_ACCESS_TOKEN}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipient: { id: senderId },
            message: { text: reply }
          }),
        });
      }
    }
    res.status(200).send("EVENT_RECEIVED");
  } else {
    res.sendStatus(404);
  }
});

// Endpoint racine pour test rapide
app.get("/", (req, res) => {
  res.send("Bot Meva en ligne ✅");
});

// Lancer le serveur
app.listen(PORT, () => console.log(`🔥 Bot en ligne sur port ${PORT}`));
