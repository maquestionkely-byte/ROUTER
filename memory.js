import fs from "fs-extra";
import dotenv from "dotenv";
dotenv.config();

const MEMORY_FILE = process.env.MEMORY_FILE || "memory.json";

// Lire la mémoire
export async function loadMemory() {
  try {
    const exists = await fs.pathExists(MEMORY_FILE);
    if (!exists) return []; // <-- retourner un tableau vide
    const data = await fs.readFile(MEMORY_FILE, "utf-8");
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("Erreur lecture mémoire:", e);
    return [];
  }
}

// Sauvegarder la mémoire
export async function saveMemory(memory) {
  try {
    await fs.writeFile(MEMORY_FILE, JSON.stringify(memory, null, 2));
  } catch (e) {
    console.error("Erreur sauvegarde mémoire:", e);
  }
}
