import AbstractManager from "./AbstractManager.js";

class ParticipationManager extends AbstractManager {
  constructor() {
    super({ table: "participation" })
  }

  // Insert a new participation
  insert(participation) {
    return this.database.participation.create({
      data: {
        utilisateur_id: participation.utilisateur_id,
        partie_id: participation.partie_id,
        date_participation: participation.date_participation || new Date(),
      },
    })
  }

  // Update an existing participation
  update(participation) {
    return this.database.participation.update({
      where: { id: Number(participation.id) },
      data: {
        utilisateur_id: participation.utilisateur_id,
        partie_id: participation.partie_id,
        date_participation: participation.date_participation || null,
      },
    })
  }

  // Supprimer les participations par utilisateur_id
  deleteByUtilisateurId(utilisateurId) {
    return this.database.participation.deleteMany({
      where: { utilisateur_id: Number(utilisateurId) },
    })
  }

  // Find all participations with additional details
  findAll() {
    return this.database.participation.findMany({
      include: {
        utilisateur: { select: { pseudo: true } },
        partie: { select: { titre: true } },
      },
    })
  }

  // Find a participation by ID
  find(id) {
    return this.database.participation.findUnique({ where: { id: Number(id) } })
  }

  async findParticipationsByPartyId(partyId) {
    const partie = await this.database.partie.findUnique({
      where: { id: Number(partyId) },
      select: { id_maitre_du_jeu: true },
    })
    return this.database.participation.findMany({
      where: {
        partie_id: Number(partyId),
        NOT: partie?.id_maitre_du_jeu
          ? { utilisateur_id: partie.id_maitre_du_jeu }
          : undefined,
      },
      include: {
        utilisateur: { select: { id: true, pseudo: true, photo_profil: true } },
      },
    })
  }

  findByPartyAndUserId(partyId, userId) {
    return this.database.participation.findUnique({
      where: {
        utilisateur_id_partie_id: {
          utilisateur_id: Number(userId),
          partie_id: Number(partyId),
        },
      },
    })
  }

  // Delete a participation by ID
  delete(id) {
    return this.database.participation.delete({ where: { id: Number(id) } })
  }

  deleteByPartyAndUserId(partyId, userId) {
    return this.database.participation.deleteMany({
      where: { partie_id: Number(partyId), utilisateur_id: Number(userId) },
    })
  }

  // Get count of participations for a user in a specific partie
  getCountUserParticipation(utilisateurId, partieId) {
    return this.database.participation.count({
      where: { utilisateur_id: Number(utilisateurId), partie_id: Number(partieId) },
    })
  }

  // Delete a participation by user ID and partie ID
  deleteByUserAndPartie(utilisateurId, partieId) {
    return this.database.participation.deleteMany({
      where: { utilisateur_id: Number(utilisateurId), partie_id: Number(partieId) },
    })
  }

  // Ajoute un utilisateur à la participation
  addParticipantToParty(partyId, userId) {
    return this.database.participation.create({
      data: { partie_id: Number(partyId), utilisateur_id: Number(userId) },
    })
  }

  deleteByPartyId(partyId) {
    return this.database.participation.deleteMany({ where: { partie_id: Number(partyId) } })
  }
}

export default ParticipationManager;
