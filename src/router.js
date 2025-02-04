// routeur.js

import express from "express";
import multer from "multer";
import path from "path";

// Importez vos contrôleurs en ESM :
// (Assurez-vous qu'ils sont également convertis en ESM, ou qu'ils exposent bien un export par défaut 
// si vous les importez ainsi.)
import PasswordResetController from "./controllers/PasswordResetController.js";
import { hashPassword, verifyPassword, verifyToken } from "./auth.js";
import UtilisateurControllers from "./controllers/UtilisateurControllers.js";
import PartieControllers from "./controllers/PartieControllers.js";
import ParticipationControllers from "./controllers/ParticipationControllers.js";
import RepasControllers from "./controllers/RepasControllers.js";
import CovoiturageControllers from "./controllers/CovoiturageControllers.js";
import LogControllers from "./controllers/LogControllers.js";
import ExportController from "./controllers/ExportController.js";

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/assets/uploads");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
      req.fileValidationError = "Only image files are allowed!";
      return cb(new Error("Only image files are allowed!"), false);
    }
    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max-size
  },
});

// ------------------------------
// Routes pour les utilisateurs
// ------------------------------
router.post("/login", UtilisateurControllers.verifyUtilisateur, verifyPassword);
router.post("/utilisateurs", hashPassword, UtilisateurControllers.add);
router.get("/utilisateurs", UtilisateurControllers.browse);
router.get("/utilisateurs/:id", verifyToken, UtilisateurControllers.read);
router.put(
  "/utilisateurs/:id",
  verifyToken,
  upload.single("photo_profil"),
  UtilisateurControllers.edit
);
router.delete("/utilisateurs/:id", verifyToken, UtilisateurControllers.destroy);

// Route pour changer le mot de passe de l'utilisateur
router.put(
  "/utilisateurs/:id/changerMotDePasse",
  verifyToken,
  hashPassword,
  UtilisateurControllers.changerMotDePasse
);

// Route pour mettre à jour la photo de profil de l'utilisateur
router.put(
  "/utilisateurs/:id/upload",
  verifyToken,
  upload.single("photo_profil"),
  UtilisateurControllers.updatePhotoProfil
);

// Anonymiser toutes les infos sauf l'ID et la date d'inscription
router.put(
  "/utilisateurs/:id/anonymize",
  verifyToken, // si vous souhaitez protéger la route
  UtilisateurControllers.anonymize
);

// ------------------------------
// Routes pour les parties
// ------------------------------
router.get("/parties/affichage", PartieControllers.affichageInfoPartie);
router.get("/parties/player/:id", PartieControllers.getPartieByUtilisateurId);
router.get("/parties/:id", PartieControllers.read);
router.post("/parties", verifyToken, upload.single("photo_scenario"), PartieControllers.add);
router.put("/parties/:id", verifyToken, upload.single("photo_scenario"), PartieControllers.edit);
router.delete("/parties/:id", verifyToken, PartieControllers.deleteByPartyId);

// ------------------------------
// Routes pour les participations
// ------------------------------
router.get("/participations", ParticipationControllers.browse);
router.get(
  "/participations/:id",
  ParticipationControllers.getparticipationsByPartyId
);
router.get(
  "/participations/:idPartie/:idPlayer",
  ParticipationControllers.getparticipationsByPartyIdAndPlayerId
);
router.post("/participations", verifyToken, ParticipationControllers.add);
router.post(
  "/participations/:idPartie/:idPlayer",
  verifyToken,
  ParticipationControllers.addByPartiId
);
router.put("/participations/:id", verifyToken, ParticipationControllers.edit);
router.delete(
  "/participations/:idPartie/:idPlayer",
  verifyToken,
  ParticipationControllers.deleteParticipationsByPartyIdAndPlayerId
);
router.delete("/participations/:id", verifyToken, ParticipationControllers.destroy);

// ------------------------------
// Routes pour les repas
// ------------------------------
router.get("/repas", RepasControllers.browse);
router.get("/repas/:id", RepasControllers.getRepasByPartyId);
router.post("/repas", verifyToken, RepasControllers.add);
router.put("/repas/:id", verifyToken, RepasControllers.edit);
router.delete("/repas/:id", verifyToken, RepasControllers.destroy);

// ------------------------------
// Routes pour les covoiturages
// ------------------------------
router.get("/covoiturages", CovoiturageControllers.browse);
router.get("/covoiturages/:id", CovoiturageControllers.getCovoiturageByPartyId);
router.post("/covoiturages", verifyToken, CovoiturageControllers.add);
router.put("/covoiturages/:id", verifyToken, CovoiturageControllers.edit);
router.delete("/covoiturages/:id", verifyToken, CovoiturageControllers.destroy);

// ------------------------------
// Routes pour les logs
// ------------------------------
router.get("/logs", verifyToken, LogControllers.browse);
router.get("/logs/:id", verifyToken, LogControllers.read);

// ------------------------------
// Routes pour l'export
// ------------------------------
router.get("/export/all", ExportController.exportAllTables);

// ------------------------------
// Routes pour la réinitialisation de mot de passe
// ------------------------------
router.post("/password-reset-request", PasswordResetController.requestReset);
router.post("/password-reset-confirm", PasswordResetController.confirmReset);

// Export par défaut du router en ESM
export default router;
