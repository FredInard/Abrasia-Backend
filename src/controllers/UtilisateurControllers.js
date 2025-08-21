// controllers/UtilisateurControllers.js (ESM)

import fs from "fs";
import sharp from "sharp";
import argon2 from "argon2";
import models from "../models/index.js"; // Assurez-vous que models/index.js est en ESM
import { profilePhotoUrl } from "../utils/media.js";

class UtilisateurControllers {
  // GET /utilisateurs
  static browse(req, res) {
    models.utilisateur
      .findAll()
      .then((rows) => {
        res.status(200).json(
          rows.map((u) => ({ ...u, photo_url: profilePhotoUrl(u.photo_profil) }))
        );
      })
      .catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
  }

  // GET /utilisateurs/:id
  static read(req, res) {
    const id = parseInt(req.params.id, 10);
    console.info("id in controller", id);

    models.utilisateur
      .find(id)
      .then((row) => {
        if (row)
          return res
            .status(200)
            .json({ ...row, photo_url: profilePhotoUrl(row.photo_profil) });
        return res.sendStatus(404);
      })
      .catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
  }

  // POST /utilisateurs
  static async add(req, res) {
    const utilisateur = req.body;
    // Normaliser l'email: trim + lowercase
    if (utilisateur && typeof utilisateur.email === "string") {
      utilisateur.email = utilisateur.email.trim().toLowerCase();
    }
    console.info("utilisateur back is :", utilisateur);

    try {
      // Vérification si l'email ou le pseudo existe déjà
      const existingUser = await models.utilisateur.findByEmailOrPseudo(
        utilisateur.email,
        utilisateur.pseudo
      );

      if (existingUser) {
        return res.status(409).json({
          error: "L'email ou le pseudo est déjà utilisé.",
        });
      }

      // Insérer le nouvel utilisateur
      const created = await models.utilisateur.insert(utilisateur);
      return res.status(201).json(created);
    } catch (err) {
      console.error("Erreur lors de l'insertion de l'utilisateur :", err);
      return res.sendStatus(500);
    }
  }

  // PUT /utilisateurs/:id
  static async edit(req, res) {
    console.info("Contenu de req.body :", req.body);
    const utilisateur = {
      ...req.body,
      id: parseInt(req.params.id, 10),
    };

    // Normaliser l'email si présent
    if (typeof utilisateur.email === "string") {
      utilisateur.email = utilisateur.email.trim().toLowerCase();
    }

    // Remplacez les champs vides ou contenant "null" par null
    Object.keys(utilisateur).forEach((key) => {
      if (utilisateur[key] === "" || utilisateur[key] === "null") {
        utilisateur[key] = null;
      }
    });
    console.info("Utilisateur avant traitement:", utilisateur);

    // Si un fichier est inclus, traiter et déplacer l'image vers public/profilPictures
    if (req.file) {
      try {
        const tmpPath = req.file.path.replace(/\\/g, "/");
        const destDir = "public/profilPictures";
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true });
        }
        const ext = (req.file.originalname.match(/\.[a-zA-Z0-9]+$/) || [".png"])[0];
        const base = `pp_${Date.now()}_${Math.round(Math.random() * 1e6)}`;
        const destPath = `${destDir}/${base}${ext}`;

        await sharp(tmpPath).resize(1024, 1024, { fit: "inside" }).toFile(destPath);
        // Nettoyer le fichier temporaire
        fs.unlink(tmpPath, (e) => e && console.warn("unlink tmp error:", e.message));

        utilisateur.photo_profil = `/${destPath.replace(/\\/g, "/")}`; // /public/profilPictures/xxx
      } catch (e) {
        console.error("Erreur lors du traitement de la photo_profil:", e);
        return res.status(500).json({ error: "Erreur lors du traitement de l'image." });
      }
    }

    console.info("Utilisateur après traitement:", utilisateur);

    models.utilisateur
      .update(utilisateur)
      .then((updated) => {
        if (!updated) return res.sendStatus(404);
        return res.status(200).json(updated);
      })
      .catch((err) => {
        console.error("Erreur lors de la mise à jour:", err);
        res.sendStatus(500);
      });
  }

  // POST /login
  // POST /login
  static verifyUtilisateur(req, res, next) {
    const rawEmail = req.body?.email;
    const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";
    // Écraser la valeur pour la suite de la chaîne (cohérence logs/middlewares)
    req.body.email = email;
    console.info("🔎 [AUTH] Vérification de l'utilisateur pour :", email);

    models.utilisateur
      .findByEmailWithPassword(email)
      .then((userOrArray) => {
        const utilisateur = Array.isArray(userOrArray)
          ? userOrArray[0]?.[0]
          : userOrArray;

      if (!utilisateur) {
        console.warn("⚠️ [AUTH] Utilisateur non trouvé :", email);
        return res.status(401).json({ error: "Utilisateur non trouvé." });
      }

      // Vérifier si le rôle est "inactif"
      if (utilisateur.role === "inactif") {
        console.warn(
          "⛔ [AUTH] Connexion refusée : compte inactif.",
          email
        );
        return res.status(403).json({
          error: "Ce compte est désactivé. Veuillez contacter un administrateur.",
        });
      }

      console.info("✅ [AUTH] Utilisateur autorisé :", {
        id: utilisateur.id,
        email: utilisateur.email,
        role: utilisateur.role,
      });

      req.utilisateur = utilisateur;
      next();
    })
    .catch((err) => {
      console.error("❌ [AUTH] Erreur lors de la vérification de l'utilisateur :", err);
      res.status(500).json({ error: "Erreur interne du serveur." });
    });
}


  // PUT /utilisateurs/:id/anonymize
  static anonymize(req, res) {
    const id = parseInt(req.params.id, 10);

    models.utilisateur
      .anonymize(id)
      .then(() => {
        res.sendStatus(204);
      })
      .catch((err) => {
        console.error("Erreur lors de l'anonymisation :", err);
        res.sendStatus(500);
      });
  }

  // PUT /utilisateurs/:id/changerMotDePasse
  static async changerMotDePasse(req, res) {
    console.info("Requête reçue pour changer le mot de passe.");

    try {
      const id = parseInt(req.params.id, 10);
      const { motDePasse } = req.body;

      console.info("ID utilisateur reçu :", id);

      if (!motDePasse || typeof motDePasse !== "string" || motDePasse.trim().length === 0) {
        console.warn("Aucun mot de passe valide fourni dans la requête.");
        return res.status(400).json({ error: "Le mot de passe est requis." });
      }

      console.info(
        "Tentative de mise à jour du mot de passe pour l'utilisateur ID :",
        id
      );

      const hashedPassword = await argon2.hash(motDePasse);
      await models.utilisateur.updatePassword(id, hashedPassword);
      console.info(
        "Mot de passe mis à jour avec succès pour l'utilisateur ID :",
        id
      );
      return res.sendStatus(204);
    } catch (err) {
      console.error("Erreur lors de la mise à jour du mot de passe :", err);
      return res.status(500).json({ error: "Erreur interne du serveur" });
    }
  }

  // PUT /utilisateurs/:id/upload
  static updatePhotoProfil(req, res) {
    const id = parseInt(req.params.id, 10);
    const filePath = req.file.path;
    const fileName = req.file.originalname;

    // Utilisation de sharp pour redimensionner l'image
    sharp(filePath)
      .resize(1024, 1024)
      .toFile(`public/profilPictures/${fileName}`, (err) => {
        if (err) {
          console.error(err);
          res.status(500).send("Erreur lors du redimensionnement de l'image");
        } else {
          const photoProfil = `/public/profilPictures/${fileName}`;

          models.utilisateur
            .updatePhotoProfil(id, photoProfil)
            .then(() => {
              // Suppression du fichier temporaire
              fs.unlink(filePath, (unlinkErr) => {
                if (unlinkErr) {
                  console.error(unlinkErr);
                }
                res.sendStatus(204);
              });
            })
            .catch((dbErr) => {
              console.error(dbErr);
              res.sendStatus(500);
            });
        }
      });
  }

  // GET /utilisateurs/pseudo/:pseudo
  static browsePseudo(req, res) {
    const pseudo = req.params.pseudo;

    models.utilisateur
      .findByPseudo(pseudo)
      .then((user) => {
        const isPseudoExist = Boolean(user);
        res.json({ isPseudoExist });
      })
      .catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
  }

  // GET /utilisateurs/profil/:id
  static readProfile(req, res) {
    const id = parseInt(req.params.id, 10);

    models.utilisateur
      .findProfileById(id)
      .then((row) => {
        if (row)
          return res
            .status(200)
            .json({ ...row, photo_url: profilePhotoUrl(row.photo_profil) });
        return res.sendStatus(404);
      })
      .catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
  }

  // DELETE /utilisateurs/:id
  static destroy(req, res) {
    const id = parseInt(req.params.id, 10);

    console.info(
      `Suppression de l'utilisateur avec l'ID : ${id} et ses données associées`
    );

    // Supprimer les données associées via les managers
    const deletions = [
      models.repas.deleteByUtilisateurId(id),
      models.covoiturage.deleteByUtilisateurId(id),
      models.participation.deleteByUtilisateurId(id),
      models.partie.deleteByMaitreDuJeuId(id),
    ];

    Promise.all(deletions)
      .then(() => {
        // Supprimer l'utilisateur une fois les données associées supprimées
        return models.utilisateur.delete(id);
      })
      .then(() => {
        console.info(`Utilisateur avec l'ID ${id} supprimé avec succès.`);
        res.sendStatus(204);
      })
      .catch((err) => {
        console.error("Erreur lors de la suppression des données :", err);
        res.sendStatus(500);
      });
  }
}

export default UtilisateurControllers;
