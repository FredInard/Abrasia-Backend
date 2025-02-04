// controllers/CovoiturageControllers.js

import models from "../models/index.js"; // Adapter selon votre structure de projet




class CovoiturageControllers {
  // GET /covoiturages
  static browse(req, res) {
    models.covoiturage
      .findAll()
      .then(([rows]) => {
        res.status(200).json(rows)
      })
      .catch((err) => {
        console.error(err)
        res.sendStatus(500)
      })
  }

  // GET /covoiturages/:id
  static read(req, res) {
    const id = parseInt(req.params.id, 10)

    models.covoiturage
      .find(id)
      .then(([rows]) => {
        if (rows[0]) {
          res.status(200).json(rows[0])
        } else {
          res.sendStatus(404)
        }
      })
      .catch((err) => {
        console.error(err)
        res.sendStatus(500)
      })
  }

  // GET /covoiturages/:idPartie
  static getCovoiturageByPartyId(req, res) {
    const id = parseInt(req.params.id, 10)

    models.covoiturage
      .findCovoiturageByPartyId(id)
      .then(([rows]) => {
        if (rows) {
          res.status(200).json(rows)
        } else {
          res.sendStatus(404)
        }
      })
      .catch((err) => {
        console.error(err)
        res.sendStatus(500)
      })
  }

  // POST /covoiturages
  static add(req, res) {
    const covoiturage = req.body

    // TODO: Validations (length, format...)

    models.covoiturage
      .insert(covoiturage)
      .then(([result]) => {
        res.status(201).json({ id: result.insertId, ...covoiturage })
      })
      .catch((err) => {
        console.error(err)
        res.sendStatus(500)
      })
  }

  // PUT /covoiturages/:id
  static edit(req, res) {
    const id = parseInt(req.params.id, 10)
    const covoiturage = req.body
    covoiturage.id = id

    // TODO: Validations (length, format...)

    models.covoiturage
      .update(covoiturage)
      .then(([result]) => {
        if (result.affectedRows === 0) {
          res.sendStatus(404)
        } else {
          res.status(200).json(covoiturage)
        }
      })
      .catch((err) => {
        console.error(err)
        res.sendStatus(500)
      })
  }

  // DELETE /covoiturages/:id
  static destroy(req, res) {
    const id = parseInt(req.params.id, 10)

    models.covoiturage
      .delete(id)
      .then(([result]) => {
        if (result.affectedRows === 0) {
          res.sendStatus(404)
        } else {
          res.sendStatus(204)
        }
      })
      .catch((err) => {
        console.error(err)
        res.sendStatus(500)
      })
  }
}


export default CovoiturageControllers;
