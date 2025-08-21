// controllers/PartieControllers.js (Version ESM)

import models from "../models/index.js";
// import sendDiscordMessage from "../utils/discord.js";
import axios from "axios";
import { profilePhotoUrl, scenarioPhotoUrl } from "../utils/media.js";

// Récupération de la variable d'environnement
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
console.info("URL Discord Webhook :", DISCORD_WEBHOOK_URL);

class PartieControllers {
  // GET /parties
  static browse(req, res) {
    models.partie
      .findAll()
      .then((rows) => {
        const enriched = rows.map((p) => ({
          ...p,
          photo_scenario_url: scenarioPhotoUrl(p.photo_scenario),
        }));
        res.status(200).json(enriched);
      })
      .catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
  }

  // GET /parties/:id
  static read(req, res) {
    const id = parseInt(req.params.id, 10);

    models.partie
      .find(id)
      .then((row) => {
        if (row) {
          // Enrichir l'utilisateur inclus si présent + URL scénario calculée
          const base = {
            ...row,
            photo_scenario_url: scenarioPhotoUrl(row.photo_scenario),
          };
          const enriched = row.utilisateur
            ? {
                ...base,
                utilisateur: {
                  ...row.utilisateur,
                  photo_url: profilePhotoUrl(row.utilisateur.photo_profil),
                },
              }
            : base;
          return res.status(200).json(enriched);
        }
        return res.sendStatus(404);
      })
      .catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
  }

  // GET /parties/utilisateur/:id
  static getPartieByUtilisateurId(req, res) {
    const id = parseInt(req.params.id, 10);

    models.partie
      .findPartieByUtilisateurId(id)
      .then((rows) => {
        const enriched = rows.map((p) => {
          const base = {
            ...p,
            photo_scenario_url: scenarioPhotoUrl(p.photo_scenario),
          };
          return p.utilisateur
            ? {
                ...base,
                utilisateur: {
                  ...p.utilisateur,
                  photo_url: profilePhotoUrl(p.utilisateur.photo_profil),
                },
              }
            : base;
        });
        res.status(200).json(enriched);
      })
      .catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
  }

  // POST /parties
  static async add(req, res) {
    try {
      console.info("Requête reçue pour ajouter une partie.");
      const partie = { ...req.body };

      if (req.file) {
        // Normalise le chemin pour qu'il soit directement accessible via l'URL
        // L'app Express sert les fichiers statiques sur "/public" (voir src/app.js)
        let filePath = req.file.path.replace(/\\/g, "/");
        // Enlève d'éventuels préfixes/diagonales et force le préfixe "/public/"
        filePath = filePath.replace(/^\/*/, ""); // supprime les "/" de début
        if (!filePath.startsWith("public/")) {
          filePath = `public/${filePath.replace(/^public\/?/, "")}`;
        }
        partie.photo_scenario = `/${filePath}`; // garantit un chemin commençant par "/public/..."
      } else {
        // Image par défaut (non montée en volume)
        partie.photo_scenario = "/public/_defaults/dragonBook.webp";
      }

      const created = await models.partie.insert(partie);

      // Préparer le message pour Discord
      const discordMessage = `🎲 **Nouvelle partie créée !**
**Titre :** ${partie.titre}
**Description :** ${partie.description}
**Date :** ${partie.date}
**Lieu :** ${partie.lieu}`;

      // Envoyer le message sur Discord (si configuré)
      if (DISCORD_WEBHOOK_URL) {
        try {
          await axios.post(DISCORD_WEBHOOK_URL, { content: discordMessage });
        } catch (discordErr) {
          console.warn("Erreur lors de l'envoi du message Discord:", discordErr?.message || discordErr);
        }
      }

      res.status(201).json(created);
    } catch (err) {
      console.error("Erreur lors de l'ajout de la partie :", err);
      res.sendStatus(500);
    }
  }

  // PUT /parties/:id (Méthode pour éditer une partie existante)
  static async edit(req, res) {
    const id = parseInt(req.params.id, 10);
    console.info(`Modification de la partie avec l'ID: ${id}`);

    const partie = { ...req.body };
    partie.id = id;

    // Gestion du chemin de l'image (toujours "/public/..." pour correspondre au static)
    if (req.file) {
      let fp = req.file.path.replace(/\\/g, "/");
      fp = fp.replace(/^\/*/, "");
      if (!fp.startsWith("public/")) {
        fp = `public/${fp.replace(/^public\/?/, "")}`;
      }
      partie.photo_scenario = `/${fp}`;
    }

    console.info("Données de la partie pour mise à jour:", partie);

    try {
      const updated = await models.partie.update(partie);

      console.info(`Partie avec l'ID ${id} mise à jour avec succès.`);

      // Préparation du message Discord
      const discordMessage = {
        content: `📢 Une partie a été modifiée !`,
        embeds: [
          {
            title: `Partie : ${partie.titre || "Non spécifié"}`,
            description: partie.description || "Aucune description fournie.",
            color: 3447003,
            fields: [
              {
                name: "Date",
                value: partie.date || "Non spécifiée",
                inline: true,
              },
              {
                name: "Lieu",
                value: partie.lieu || "Non spécifié",
                inline: true,
              },
              {
                name: "Nombre de joueurs",
                value: partie.nb_max_joueurs
                  ? `${partie.nb_max_joueurs} joueur(s) maximum`
                  : "Non spécifié",
                inline: false,
              },
            ],
            timestamp: new Date().toISOString(),
            footer: { text: `ID de la partie : ${id}` },
          },
        ],
      };

      try {
        await axios.post(process.env.DISCORD_WEBHOOK_URL, discordMessage);
        console.info("Message envoyé à Discord avec succès.");
      } catch (discordError) {
        console.error(
          "Erreur lors de l'envoi du message à Discord :",
          discordError.message
        );
      }

      return res.status(200).json(updated);
    } catch (err) {
      console.error("Erreur lors de la mise à jour de la partie :", err.message);
      return res.status(500).json({ error: "Erreur serveur lors de la mise à jour." });
    }
  }

  // DELETE /parties/:id
  static async deleteByPartyId(req, res) {
    const partyId = parseInt(req.params.id, 10);

    if (!partyId) {
      return res.status(400).json({ error: "L'ID de la partie est requis." });
    }

    try {
      console.info(`Suppression des dépendances pour la partie ID: ${partyId}`);

      // Suppression des dépendances
      await Promise.all([
        models.participation.deleteByPartyId(partyId),
        models.repas.deleteByPartyId(partyId),
        models.covoiturage.deleteByPartyId(partyId),
      ]);

      // Suppression de la partie elle-même
      await models.partie.deleteByPartyId(partyId);

      console.info(`Partie ID: ${partyId} et dépendances supprimées.`);
      res.status(204).send();
    } catch (err) {
      console.error("Erreur lors de la suppression de la partie :", err);
      res.status(500).json({ error: "Erreur serveur." });
    }
  }

  // GET /parties/affichage
  static affichageInfoPartie(req, res) {
    models.partie
      .getAffichageInfoPartie()
      .then((rows) => {
        const enriched = rows.map((p) => {
          const base = {
            ...p,
            photo_scenario_url: scenarioPhotoUrl(p.photo_scenario),
          };
          return p.utilisateur
            ? {
                ...base,
                utilisateur: {
                  ...p.utilisateur,
                  photo_url: profilePhotoUrl(p.utilisateur.photo_profil),
                },
              }
            : base;
        });
        res.status(200).json(enriched);
      })
      .catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
  }

  // GET /parties/affichage/:date
  static affichageInfoPartieDate(req, res) {
    const date = req.params.date;
    models.partie
      .getAffichageInfoPartieDate(date)
      .then((rows) => {
        const enriched = rows.map((p) => {
          const base = {
            ...p,
            photo_scenario_url: scenarioPhotoUrl(p.photo_scenario),
          };
          return p.utilisateur
            ? {
                ...base,
                utilisateur: {
                  ...p.utilisateur,
                  photo_url: profilePhotoUrl(p.utilisateur.photo_profil),
                },
              }
            : base;
        });
        res.status(200).json(enriched);
      })
      .catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
  }

  // GET /parties/utilisateur/:id
  static partieByUtilisateurId(req, res) {
    const utilisateurId = parseInt(req.params.id, 10);
    models.partie
      .findPartieByUtilisateurId(utilisateurId)
      .then((rows) => {
        const enriched = rows.map((p) => {
          const base = {
            ...p,
            photo_scenario_url: scenarioPhotoUrl(p.photo_scenario),
          };
          return p.utilisateur
            ? {
                ...base,
                utilisateur: {
                  ...p.utilisateur,
                  photo_url: profilePhotoUrl(p.utilisateur.photo_profil),
                },
              }
            : base;
        });
        res.status(200).json(enriched);
      })
      .catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
  }

  // GET /parties/joueurs/:id
  static joueursByPartieId(req, res) {
    const partieId = parseInt(req.params.id, 10);

    models.partie
      .findJoueursByPartieId(partieId)
      .then((rows) => {
        const enriched = rows.map((u) => ({
          ...u,
          photo_url: profilePhotoUrl(u.photo_profil),
        }));
        res.status(200).json(enriched);
      })
      .catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
  }

  // GET /parties/meneur/:id
  static partieMeneurByUtilisateurId(req, res) {
    const utilisateurId = parseInt(req.params.id, 10);

    models.partie
      .findPartieMeneurByUtilisateurId(utilisateurId)
      .then((rows) => {
        res.status(200).json(rows);
      })
      .catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
  }

  // GET /parties/count/:id
  static countPartieById(req, res) {
    const partieId = parseInt(req.params.id, 10);

    models.partie
      .getCountPartieById(partieId)
      .then((obj) => {
        res.status(200).json(obj);
      })
      .catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
  }

  // // DELETE /parties/destroyer/:id
  // static destroyeurDePartie(req, res) {
  //   const id = parseInt(req.params.id, 10);
  //
  //   models.partie
  //     .getDestroyeurDePartie(id)
  //     .then(() => {
  //       res.sendStatus(204);
  //       console.info("La suppression de la partie et des participations a réussi");
  //     })
  //     .catch((err) => {
  //       console.error(err);
  //       res.sendStatus(500);
  //       console.info("Échec de la suppression de la partie et des participations");
  //     });
  // }
}

export default PartieControllers;
