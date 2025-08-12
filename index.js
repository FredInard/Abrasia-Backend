import "dotenv/config"; // Chargement des variables d'environnement
import mysql from "mysql2/promise"; // Import de MySQL avec support async/await
import app from "./src/app.js"; // Import de l'application Express

// Définition du port
const port = parseInt(process.env.APP_PORT ?? "4242", 10);

// Récupération des informations de connexion MySQL
const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

// Fonction pour tester la connexion à la base de données
async function testDBConnection() {
  try {
    console.info("🔄 Tentative de connexion à la base de données...");

    const connection = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
    });

    console.info("✅ Connexion à MySQL réussie !");
    await connection.end();

    return true;
  } catch (error) {
    console.error("❌ Erreur de connexion à MySQL :", error);
    return false;
  }
}

// Démarrer le serveur uniquement si la connexion MySQL est OK
async function startServer() {
  const dbConnected = await testDBConnection();

  if (dbConnected) {
    console.info(`🔄 Initialisation du serveur sur le port ${port}...`);

    app.listen(port, (err) => {
      if (err) {
        console.error("❌ Erreur lors du démarrage du serveur :", err);
      } else {
        console.info(`✅ Serveur opérationnel sur http://localhost:${port}`);
      }
    });
  } else {
    console.error("❌ Échec du démarrage du serveur : connexion MySQL non établie.");
    process.exit(1); // Quitter l'application si la base de données ne répond pas
  }
}

// Exécution du serveur
startServer();
