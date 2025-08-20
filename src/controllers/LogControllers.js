// controllers/LogControllers.js


import models from "../models/index.js"; // Adapter selon votre structure de projet


class LogControllers {
  // GET /logs
  static browse(req, res) {
    models.log
      .findAll()
      .then((rows) => {
        res.status(200).json(rows)
      })
      .catch((err) => {
        console.error(err)
        res.sendStatus(500)
      })
  }

  // GET /logs/:id
  static read(req, res) {
    const id = parseInt(req.params.id, 10)

    models.log
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

  // POST /logs
  static add(req, res) {
    const log = req.body

    // TODO: Validations (length, format...)

    models.log
      .insert(log)
      .then((created) => {
        res.status(201).json(created)
      })
      .catch((err) => {
        console.error(err)
        res.sendStatus(500)
      })
  }

  // DELETE /logs/:id
  static destroy(req, res) {
    const id = parseInt(req.params.id, 10)

    models.log
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

export default LogControllers;
