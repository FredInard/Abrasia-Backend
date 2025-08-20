import AbstractManager from "./AbstractManager.js";

class CovoiturageManager extends AbstractManager {
  constructor() {
    super({ table: "covoiturage" })
  }

  // Insérer un nouveau covoiturage
  insert(covoiturage) {
    return this.database.covoiturage.create({
      data: {
        utilisateur_id: covoiturage.utilisateur_id,
        partie_id: covoiturage.partie_id,
        ville_depart: covoiturage.ville_depart,
        ville_arrivee: covoiturage.ville_arrivee,
        heure_depart: covoiturage.heure_depart,
        propose_retour: Boolean(covoiturage.propose_retour),
      },
    })
  }

  // Mettre à jour un covoiturage existant
  update(covoiturage) {
    return this.database.covoiturage.update({
      where: { id: Number(covoiturage.id) },
      data: {
        utilisateur_id: covoiturage.utilisateur_id,
        partie_id: covoiturage.partie_id,
        ville_depart: covoiturage.ville_depart,
        ville_arrivee: covoiturage.ville_arrivee,
        heure_depart: covoiturage.heure_depart,
        propose_retour: Boolean(covoiturage.propose_retour),
      },
    })
  }

  // Récupérer tous les covoiturages avec pseudo utilisateur et titre de partie
  findAll() {
    return this.database.covoiturage.findMany({
      include: {
        utilisateur: { select: { pseudo: true } },
        partie: { select: { titre: true } },
      },
    })
  }

  // Récupérer un covoiturage par ID
  find(id) {
    return this.database.covoiturage.findUnique({ where: { id: Number(id) } })
  }

  // Récupérer les covoiturages pour une partie spécifique par son ID avec le pseudo de l'utilisateur
  findCovoiturageByPartyId(partyId) {
    return this.database.covoiturage.findMany({
      where: { partie_id: Number(partyId) },
      include: { utilisateur: { select: { pseudo: true } } },
    })
  }

  // Supprimer les covoiturages par utilisateur_id
  deleteByUtilisateurId(utilisateurId) {
    return this.database.covoiturage.deleteMany({ where: { utilisateur_id: Number(utilisateurId) } })
  }

  deleteByPartyAndUserId(partyId, userId) {
    return this.database.covoiturage.deleteMany({ where: { partie_id: Number(partyId), utilisateur_id: Number(userId) } })
  }

  // Supprimer un covoiturage par ID
  delete(id) {
    return this.database.covoiturage.delete({ where: { id: Number(id) } })
  }

  deleteByPartyId(partyId) {
    return this.database.covoiturage.deleteMany({ where: { partie_id: Number(partyId) } })
  }
}

export default CovoiturageManager;
