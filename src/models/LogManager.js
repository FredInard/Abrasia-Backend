import AbstractManager from "./AbstractManager.js";

class LogManager extends AbstractManager {
  constructor() {
    super({ table: "log" })
  }

  // Insérer un nouveau log
  insert(log) {
    return this.database.log.create({
      data: {
        utilisateur_id: log.utilisateur_id,
        action: log.action,
        description: log.description || null,
        timestamp: log.timestamp || new Date(),
      },
    })
  }

  // Récupérer tous les logs
  findAll() {
    return this.database.log.findMany()
  }

  // Récupérer un log par ID
  find(id) {
    return this.database.log.findUnique({ where: { id: Number(id) } })
  }

  // Supprimer un log par ID
  delete(id) {
    return this.database.log.delete({ where: { id: Number(id) } })
  }
}

export default LogManager;
