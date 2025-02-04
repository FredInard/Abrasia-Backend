import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import router from "./router.js";

// Chargement des variables d'environnement
dotenv.config();

// Récupération de __dirname (compatible ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.info("Environnement:", process.env.NODE_ENV || "Développement");
console.info("Initialisation de l'application Express...");

// Initialisation de l'application Express
const app = express();

// Middlewares
console.info("Configuration des middlewares...");
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// Routing principal
console.info("Mise en place du routeur principal...");
app.use(router);

// Gestion des ressources statiques du dossier public
console.info("Serve les ressources statiques du dossier 'public'...");
app.use("/public", express.static(path.join(__dirname, "..", "public")));

// Configuration pour servir l'application React si elle est buildée
const reactDistPath = path.join(__dirname, "..", "..", "frontend", "dist");
const reactIndexFile = path.join(reactDistPath, "index.html");

if (fs.existsSync(reactIndexFile)) {
  console.info("Dossier de build React détecté. Configuration pour servir l'application...");
  // Servir les fichiers statiques React
  app.use(express.static(reactDistPath));

  // Rediriger toutes les routes vers le fichier index.html de React
  app.get("*", (req, res) => {
    res.sendFile(reactIndexFile);
  });
} else {
  console.info("Aucun build React détecté, les routes API resteront accessibles seules.");
}

// Démarrage du serveur
const port = process.env.APP_PORT || 4242;
app.listen(port, () => {
  console.info(`✅ Serveur démarré sur http://localhost:${port}`);
});

// (Optionnel) Vous pouvez toujours exporter app si nécessaire ailleurs
export default app;
