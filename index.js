import "dotenv/config"; // Chargement des variables d'environnement
import app from "./src/app.js"; // Import de l'application Express

// Définition du port
const port = parseInt(process.env.APP_PORT ?? "4242", 10);

console.info(`🔄 Initialisation du serveur sur le port ${port}...`);
app.listen(port, (err) => {
  if (err) {
    console.error("❌ Erreur lors du démarrage du serveur :", err);
  } else {
    console.info(`✅ Serveur opérationnel sur http://localhost:${port}`);
  }
});
