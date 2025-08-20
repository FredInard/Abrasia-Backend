import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import router from "./router.js";

// ✅ Prisma (client généré dans src/generated/prisma)
import { PrismaClient } from "./generated/prisma/index.js";
const prisma = new PrismaClient();

// Chargement des variables d'environnement
dotenv.config();

// Récupération de __dirname (compatible ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.info("Environnement:", process.env.NODE_ENV || "Développement");
console.info("Initialisation de l'application Express...");

// Initialisation de l'application Express
const app = express();

// Derrière Traefik/Nginx (cookies sécurisés, IPs réelles, etc.)
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// Middlewares
console.info("Configuration des middlewares...");
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(
  cors({
    origin:
      process.env.CORS_ORIGIN ||
      process.env.FRONTEND_URL ||
      "http://localhost:5173",
    credentials: true,
    optionsSuccessStatus: 200,
  }),
);

// --- Healthchecks & debug ---
app.get("/health", (_req, res) => res.status(200).send("ok"));

app.get("/debug/db", async (_req, res) => {
  try {
    const nowRows =
      await prisma.$queryRaw`SELECT NOW() AS now, current_setting('TimeZone') AS tz`;
    const [{ now, tz }] = nowRows;

    // évite la dépendance au nom du modèle Prisma, on compte en SQL
    const [{ count }] =
      await prisma.$queryRaw`SELECT COUNT(*)::int AS count FROM "utilisateur"`;

    res.json({ now, tz, users: count });
  } catch (e) {
    console.error("DEBUG/DB error:", e);
    res.status(500).json({ error: "DB not reachable", detail: String(e?.message ?? e) });
  }
});

// Gestion des ressources statiques du dossier public (doit être AVANT le routeur)
console.info("Serve les ressources statiques du dossier 'public'...");
app.use("/public", express.static(path.join(__dirname, "..", "public")));

// Routing principal (tes routes métier)
console.info("Mise en place du routeur principal...");
app.use(router);

// Option: servir le build React si présent (utile en dev monorepo)
// En prod on servira plutôt le front via un conteneur Nginx dédié.
const reactDistPath = path.join(__dirname, "..", "..", "frontend", "dist");
const reactIndexFile = path.join(reactDistPath, "index.html");

if (fs.existsSync(reactIndexFile)) {
  console.info(
    "Dossier de build React détecté. Configuration pour servir l'application..."
  );
  app.use(express.static(reactDistPath));
  app.get("*", (_req, res) => res.sendFile(reactIndexFile));
} else {
  console.info(
    "Aucun build React détecté, les routes API resteront accessibles seules."
  );
}

// 404 explicite (après toutes les routes)
app.use((req, res) => {
  res.status(404).json({ error: "Not Found", path: req.originalUrl });
});

// Gestion d'erreurs globale
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

console.info("Application Express configurée avec succès.");

// Déconnexion propre de Prisma lors de l'arrêt
process.on("SIGINT", async () => {
  try {
    await prisma.$disconnect();
  } finally {
    process.exit(0);
  }
});

export default app;
