import AbstractManager from "./AbstractManager.js";

class PasswordResetManager extends AbstractManager {
  constructor() {
    super({ table: "password_reset_tokens" })
  }

  // Insérer un nouveau token
  insert(data) {
    return this.database.password_reset_tokens.create({
      data: {
        utilisateur_id: data.utilisateur_id,
        token: data.token,
        expiration: data.expiration,
      },
    })
  }

  // Rechercher un token par sa valeur
  findByToken(token) {
    return this.database.password_reset_tokens.findFirst({ where: { token } })
  }

  // Supprimer un token par ID
  delete(id) {
    return this.database.password_reset_tokens.delete({ where: { id: Number(id) } })
  }
}

export default PasswordResetManager;