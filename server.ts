import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database("tcm_data.db");

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role TEXT,
    content TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS references_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    content TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    age INTEGER,
    gender TEXT,
    icd11_code TEXT,
    tcm_diagnosis TEXT,
    tongue_pulse TEXT,
    treatment_plan TEXT,
    notes TEXT,
    progress TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/stats", (req, res) => {
    const messageCount = db.prepare("SELECT COUNT(*) as count FROM messages").get() as { count: number };
    const referenceCount = db.prepare("SELECT COUNT(*) as count FROM references_data").get() as { count: number };
    const patientCount = db.prepare("SELECT COUNT(*) as count FROM patients").get() as { count: number };
    res.json({ messages: messageCount.count, references: referenceCount.count, patients: patientCount.count });
  });

  app.get("/api/messages", (req, res) => {
    const messages = db.prepare("SELECT * FROM messages ORDER BY timestamp ASC").all();
    res.json(messages);
  });

  app.post("/api/messages", (req, res) => {
    const { role, content } = req.body;
    const info = db.prepare("INSERT INTO messages (role, content) VALUES (?, ?)").run(role, content);
    res.json({ id: info.lastInsertRowid });
  });

  app.delete("/api/messages", (req, res) => {
    db.prepare("DELETE FROM messages").run();
    res.json({ success: true });
  });

  app.get("/api/references", (req, res) => {
    const refs = db.prepare("SELECT * FROM references_data ORDER BY timestamp DESC").all();
    res.json(refs);
  });

  app.post("/api/references", (req, res) => {
    const { title, content } = req.body;
    const info = db.prepare("INSERT INTO references_data (title, content) VALUES (?, ?)").run(title, content);
    res.json({ id: info.lastInsertRowid });
  });

  app.delete("/api/references/:id", (req, res) => {
    db.prepare("DELETE FROM references_data WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/patients", (req, res) => {
    const patients = db.prepare("SELECT * FROM patients ORDER BY timestamp DESC").all();
    res.json(patients);
  });

  app.post("/api/patients", (req, res) => {
    const { name, age, gender, icd11_code, tcm_diagnosis, tongue_pulse, treatment_plan, notes, progress } = req.body;
    const info = db.prepare(`
      INSERT INTO patients (name, age, gender, icd11_code, tcm_diagnosis, tongue_pulse, treatment_plan, notes, progress) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(name, age, gender, icd11_code, tcm_diagnosis, tongue_pulse, treatment_plan, notes, progress);
    res.json({ id: info.lastInsertRowid });
  });

  app.delete("/api/patients/:id", (req, res) => {
    db.prepare("DELETE FROM patients WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
