import AbstractManager from "./AbstractManager.js";

class RepasManager extends AbstractManager {
  constructor() {
    super({ table: "repas" })
  }

  // Insérer un nouveau repas
  insert(repas) {
    return this.database.repas.create({
      data: {
        utilisateur_id: repas.utilisateur_id,
        partie_id: repas.partie_id,
        contenu: repas.contenu,
      },
    })
  }

  // Mettre à jour un repas existant
  update(repas) {
    return this.database.repas.update({
      where: { id: Number(repas.id) },
      data: {
        utilisateur_id: repas.utilisateur_id,
        partie_id: repas.partie_id,
        contenu: repas.contenu,
      },
    })
  }

  // Récupérer tous les repas avec les informations utilisateur et partie
  findAll() {
    return this.database.repas.findMany({
      include: {
        utilisateur: { select: { pseudo: true } },
        partie: { select: { titre: true } },
      },
    })
  }

  // Récupérer tous les repas pour une partie spécifique par son ID avec le pseudo de l'utilisateur
  getRepasByPartyId(partyId) {
    return this.database.repas.findMany({
      where: { partie_id: Number(partyId) },
      include: { utilisateur: { select: { pseudo: true } } },
    })
  }

  // Supprimer les repas par utilisateur_id
  deleteByUtilisateurId(utilisateurId) {
    return this.database.repas.deleteMany({ where: { utilisateur_id: Number(utilisateurId) } })
  }

  // Récupérer un repas par ID
  find(id) {
    return this.database.repas.findUnique({ where: { id: Number(id) } })
  }

  deleteByPartyAndUserId(partyId, userId) {
    return this.database.repas.deleteMany({ where: { partie_id: Number(partyId), utilisateur_id: Number(userId) } })
  }

  // Supprimer un repas par ID
  delete(id) {
    return this.database.repas.delete({ where: { id: Number(id) } })
  }

  deleteByPartyId(partyId) {
    return this.database.repas.deleteMany({ where: { partie_id: Number(partyId) } })
  }
}
export default RepasManager;

