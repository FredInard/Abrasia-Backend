// router.js

import express from "express";
import multer from "multer";
import path from "path";

// Import des contrôleurs et des middlewares
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

// ✅ Vérification des imports pour éviter les erreurs "undefined"
console.info("📌 Vérification des contrôleurs :");
console.info("UtilisateurControllers :", UtilisateurControllers);
console.info("PartieControllers :", PartieControllers);
console.info("ParticipationControllers :", ParticipationControllers);
console.info("RepasControllers :", RepasControllers);
console.info("CovoiturageControllers :", CovoiturageControllers);
console.info("LogControllers :", LogControllers);
console.info("ExportController :", ExportController);

// ------------------------------
// 🖼️ Configuration de Multer pour l'upload d'images
// ------------------------------
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
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
      req.fileValidationError = "Seules les images sont autorisées !";
      return cb(new Error("Seules les images sont autorisées !"), false);
    }
    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
});

router.post("/login", async (req, res, next) => {
  console.info("🔍 [LOGIN] Requête reçue:", {
    email: req.body.email,
    timestamp: new Date().toISOString(),
  });

  try {
    await UtilisateurControllers.verifyUtilisateur(req, res, async () => {
      console.info("✅ [LOGIN] Utilisateur trouvé en BDD:", {
        id: req.utilisateur?.id,
        email: req.utilisateur?.email,
        role: req.utilisateur?.role,
      });

      await verifyPassword(req, res);
    });
  } catch (error) {
    console.error("❌ [LOGIN] Erreur lors de la connexion :", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});


// ------------------------------
// 🧑‍💻 Routes Utilisateurs
// ------------------------------
// router.post("/login", UtilisateurControllers.verifyUtilisateur, verifyPassword);
router.post("/utilisateurs", hashPassword, UtilisateurControllers.add);
router.get("/utilisateurs", UtilisateurControllers.browse);
router.get("/utilisateurs/:id", verifyToken, UtilisateurControllers.read);
router.put("/utilisateurs/:id", verifyToken, upload.single("photo_profil"), UtilisateurControllers.edit);
router.delete("/utilisateurs/:id", verifyToken, UtilisateurControllers.destroy);

// 🔐 Gestion de la sécurité utilisateur
router.put("/utilisateurs/:id/changerMotDePasse", verifyToken, hashPassword, UtilisateurControllers.changerMotDePasse);
router.put("/utilisateurs/:id/upload", verifyToken, upload.single("photo_profil"), UtilisateurControllers.updatePhotoProfil);
router.put("/utilisateurs/:id/anonymize", verifyToken, UtilisateurControllers.anonymize);

// ------------------------------
// 🎲 Routes Parties
// ------------------------------
router.get("/parties/affichage", PartieControllers.affichageInfoPartie);
router.get("/parties/player/:id", PartieControllers.getPartieByUtilisateurId);
router.get("/parties/:id", PartieControllers.read);
router.post("/parties", verifyToken, upload.single("photo_scenario"), PartieControllers.add);
router.put("/parties/:id", verifyToken, upload.single("photo_scenario"), PartieControllers.edit);
router.delete("/parties/:id", verifyToken, PartieControllers.deleteByPartyId);

// ------------------------------
// 🙋 Routes Participations
// ------------------------------
router.get("/participations", ParticipationControllers.browse);
router.get("/participations/:id", ParticipationControllers.getparticipationsByPartyId);
router.get("/participations/:idPartie/:idPlayer", ParticipationControllers.getparticipationsByPartyIdAndPlayerId);
router.post("/participations", verifyToken, ParticipationControllers.add);
router.post("/participations/:idPartie/:idPlayer", verifyToken, ParticipationControllers.addByPartiId);
router.put("/participations/:id", verifyToken, ParticipationControllers.edit);
router.delete("/participations/:idPartie/:idPlayer", verifyToken, ParticipationControllers.deleteParticipationsByPartyIdAndPlayerId);
router.delete("/participations/:id", verifyToken, ParticipationControllers.destroy);

// ------------------------------
// 🍽️ Routes Repas
// ------------------------------
router.get("/repas", RepasControllers.browse);
router.get("/repas/:id", RepasControllers.getRepasByPartyId);
router.post("/repas", verifyToken, RepasControllers.add);
router.put("/repas/:id", verifyToken, RepasControllers.edit);
router.delete("/repas/:id", verifyToken, RepasControllers.destroy);

// ------------------------------
// 🚗 Routes Covoiturages
// ------------------------------
router.get("/covoiturages", CovoiturageControllers.browse);
router.get("/covoiturages/:id", CovoiturageControllers.getCovoiturageByPartyId);
router.post("/covoiturages", verifyToken, CovoiturageControllers.add);
router.put("/covoiturages/:id", verifyToken, CovoiturageControllers.edit);
router.delete("/covoiturages/:id", verifyToken, CovoiturageControllers.destroy);

// ------------------------------
// 📜 Routes Logs
// ------------------------------
router.get("/logs", verifyToken, LogControllers.browse);
router.get("/logs/:id", verifyToken, LogControllers.read);

// ------------------------------
// 📤 Route Exportation
// ------------------------------
router.get("/export/all", ExportController.exportAllTables);

// ------------------------------
// 🔑 Routes Réinitialisation Mot de Passe
// ------------------------------
router.post("/password-reset-request", PasswordResetController.requestReset);
router.post("/password-reset-confirm", PasswordResetController.confirmReset);

// 🔥 Middleware Global : Capture d’erreurs 404
router.use((req, res) => {
  res.status(404).json({ error: "Route non trouvée" });
});

// 📤 Export du router en mode ESM
export default router;
