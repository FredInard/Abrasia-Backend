// controllers/RepasControllers.js

import models from "../models/index.js";

class RepasControllers {
  // GET /repas
  static browse(req, res) {
    models.repas
      .findAll()
      .then((rows) => {
        res.status(200).json(rows);
      })
      .catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
  }

  // GET /repas/:id
  static read(req, res) {
    const id = parseInt(req.params.id, 10);

    models.repas
      .find(id)
      .then((row) => {
        if (row) return res.status(200).json(row);
        return res.sendStatus(404);
      })
      .catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
  }

  // GET /repas/:id
  static getRepasByPartyId(req, res) {
    const id = parseInt(req.params.id, 10);

    models.repas
      .getRepasByPartyId(id)
      .then((rows) => {
        console.info("Repas trouvés dans la base de données :", rows) // vérification des données avant de les renvoyer
        res.status(200).json(rows) // Renvoie tous les repas, même si le tableau est vide
      })
      .catch((err) => {
        console.error(err);
        res.sendStatus(500) // Problème côté serveur
      });
  }

  // POST /repas
  static add(req, res) {
    const repas = req.body;

    models.repas
      .insert(repas)
      .then((created) => {
        res.status(201).json(created);
      })
      .catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
  }

  // PUT /repas/:id
  static edit(req, res) {
    const repas = { ...req.body, id: parseInt(req.params.id, 10) };

    models.repas
      .update(repas)
      .then((updated) => {
        if (!updated) return res.sendStatus(404);
        return res.status(200).json(updated);
      })
      .catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
  }

  // DELETE /repas/:id
  static destroy(req, res) {
    const id = parseInt(req.params.id, 10);

    models.repas
      .delete(id)
      .then(() => {
        res.sendStatus(204);
      })
      .catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
  }
}

export default RepasControllers;
