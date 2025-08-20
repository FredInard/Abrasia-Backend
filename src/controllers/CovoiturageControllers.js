// controllers/CovoiturageControllers.js

import models from "../models/index.js"; // Adapter selon votre structure de projet




class CovoiturageControllers {
  // GET /covoiturages
  static browse(req, res) {
    models.covoiturage
      .findAll()
      .then((rows) => {
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
      .then((row) => {
        if (row) return res.status(200).json(row)
        return res.sendStatus(404)
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
      .then((rows) => {
        res.status(200).json(rows)
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
      .then((created) => {
        res.status(201).json(created)
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
      .then((updated) => {
        if (!updated) return res.sendStatus(404)
        return res.status(200).json(updated)
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
      .then(() => {
        res.sendStatus(204)
      })
      .catch((err) => {
        console.error(err)
        res.sendStatus(500)
      })
  }
}


export default CovoiturageControllers;
