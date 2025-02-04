// index.js (ESM)

import dotenv from "dotenv";
dotenv.config();

import mysql from "mysql2/promise";

// Création d'une connexion à la base de données
const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

const pool = mysql.createPool({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
});

// Vérification de la connexion
pool.getConnection().catch(() => {
  console.warn(
    "Warning:",
    "Failed to get a DB connection.",
    "Did you create a .env file with valid credentials?",
    "Routes using models won't work as intended"
  );
});

// Déclaration et enregistrement des modèles (managers)
// Assurez-vous que ces fichiers sont également en ESM (avec "export default")
import ParticipationManager from "./ParticipationManager.js";
import PartieManager from "./PartieManager.js";
import UtilisateurManager from "./UtilisateurManager.js";
import RepasManager from "./RepasManager.js";
import CovoiturageManager from "./CovoiturageManager.js";
import LogManager from "./LogManager.js";
import PasswordResetTokenManager from "./PasswordResetManager.js";

const models = {};

models.participation = new ParticipationManager();
models.participation.setDatabase(pool);

models.partie = new PartieManager();
models.partie.setDatabase(pool);

models.utilisateur = new UtilisateurManager();
models.utilisateur.setDatabase(pool);

models.repas = new RepasManager();
models.repas.setDatabase(pool);

models.covoiturage = new CovoiturageManager();
models.covoiturage.setDatabase(pool);

models.log = new LogManager();
models.log.setDatabase(pool);

models.passwordResetToken = new PasswordResetTokenManager();
models.passwordResetToken.setDatabase(pool);

// Gestionnaire pour les références de modèles non définies
const handler = {
  get(obj, prop) {
    if (prop in obj) {
      return obj[prop];
    }

    const pascalize = (string) =>
      string.slice(0, 1).toUpperCase() + string.slice(1);

    throw new ReferenceError(
      `models.${prop} is not defined. Did you create ${pascalize(
        prop
      )}Manager.js, and did you register it in backend/src/models/index.js?`
    );
  },
};

// Exportation par défaut en mode ESM
export default new Proxy(models, handler);
