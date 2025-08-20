// src/models/index.js

// Plus de mysql2 ici
import dotenv from "dotenv";
dotenv.config();

// On utilise le client Prisma généré (ESM)
import { PrismaClient } from "../generated/prisma/index.js";

// Prisma en singleton
const prisma = new PrismaClient();

// Managers
import ParticipationManager from "./ParticipationManager.js";
import PartieManager from "./PartieManager.js";
import UtilisateurManager from "./UtilisateurManager.js";
import RepasManager from "./RepasManager.js";
import CovoiturageManager from "./CovoiturageManager.js";
import LogManager from "./LogManager.js";
import PasswordResetTokenManager from "./PasswordResetManager.js";

// Tous les managers reçoivent le client Prisma
const models = {};

models.participation = new ParticipationManager();
models.participation.setDatabase(prisma);

models.partie = new PartieManager();
models.partie.setDatabase(prisma);

models.utilisateur = new UtilisateurManager();
models.utilisateur.setDatabase(prisma);

models.repas = new RepasManager();
models.repas.setDatabase(prisma);

models.covoiturage = new CovoiturageManager();
models.covoiturage.setDatabase(prisma);

models.log = new LogManager();
models.log.setDatabase(prisma);

models.passwordResetToken = new PasswordResetTokenManager();
models.passwordResetToken.setDatabase(prisma);

// Garder le proxy d'erreur utile
const handler = {
  get(obj, prop) {
    if (prop in obj) return obj[prop];
    const pascalize = (s) => s.slice(0, 1).toUpperCase() + s.slice(1);
    throw new ReferenceError(
      `models.${prop} is not defined. Did you create ${pascalize(
        prop
      )}Manager.js, and did you register it in backend/src/models/index.js?`
    );
  },
};

export default new Proxy(models, handler);
