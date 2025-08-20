import AbstractManager from "./AbstractManager.js";

class PartieManager extends AbstractManager {
  constructor() {
    super({ table: "partie" })
  }

  // Insert a new partie
  insert(partie) {
    // Normalisations/sanitisations des champs issus d'un FormData (tout arrive en string)
    const normalizeType = (t) => {
      if (!t || t === "undefined") return undefined; // laisser Prisma appliquer le default (jeux)
      const v = String(t).toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
      // Prisma enum: jeux | evenement
      if (v === "jeux") return "jeux";
      if (v === "evenement") return "evenement";
      return undefined; // valeur inconnue -> utilise le default
    };
    const toIntOrNull = (v) => {
      if (v === undefined || v === null || v === "" || v === "null") return null;
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    };

    return this.database.partie.create({
      data: {
        titre: partie.titre,
        type: normalizeType(partie.type),
        description: partie.description ?? null,
        date: new Date(partie.date),
        nb_max_joueurs: toIntOrNull(partie.nb_max_joueurs),
        id_maitre_du_jeu: toIntOrNull(partie.id_maitre_du_jeu),
        duree_estimee: toIntOrNull(partie.duree_estimee),
        lieu: partie.lieu ?? null,
        photo_scenario: partie.photo_scenario ?? null,
        strict_nb_joueurs: partie.strict_nb_joueurs === "1" || partie.strict_nb_joueurs === true,
      },
    })
  }

  // Update an existing partie
  update(partie) {
    const normalizeType = (t) => {
      if (!t || t === "undefined") return undefined;
      const v = String(t).toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
      if (v === "jeux") return "jeux";
      if (v === "evenement") return "evenement";
      return undefined;
    };
    const toIntOrNull = (v) => {
      if (v === undefined || v === null || v === "" || v === "null") return null;
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    };

    return this.database.partie.update({
      where: { id: Number(partie.id) },
      data: {
        titre: partie.titre,
        type: normalizeType(partie.type),
        description: partie.description ?? null,
        date: new Date(partie.date),
        nb_max_joueurs: toIntOrNull(partie.nb_max_joueurs),
        id_maitre_du_jeu: toIntOrNull(partie.id_maitre_du_jeu),
        duree_estimee: toIntOrNull(partie.duree_estimee),
        lieu: partie.lieu ?? null,
        photo_scenario: partie.photo_scenario ?? null,
        strict_nb_joueurs: partie.strict_nb_joueurs === "1" || partie.strict_nb_joueurs === true,
      },
    })
  }

  // Supprimer les parties par id_maitre_du_jeu
  deleteByMaitreDuJeuId(maitreDuJeuId) {
    return this.database.partie.deleteMany({ where: { id_maitre_du_jeu: Number(maitreDuJeuId) } })
  }

  // Find all parties
  findAll() {
    return this.database.partie.findMany()
  }

  // Find a partie by ID, including the pseudo and photo_profil of the maître du jeu
  find(id) {
    return this.database.partie.findUnique({
      where: { id: Number(id) },
      include: {
        utilisateur: { select: { pseudo: true, photo_profil: true } },
      },
    })
  }

  // Get detailed info of all parties
  getAffichageInfoPartie() {
    return this.database.partie.findMany({
      include: { utilisateur: { select: { pseudo: true, photo_profil: true } } },
    })
  }

  // Get detailed info of parties on a specific date
  getAffichageInfoPartieDate(date) {
    const d = new Date(date)
    const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0))
    const end = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1, 0, 0, 0))
    return this.database.partie.findMany({
      where: { date: { gte: start, lt: end } },
      include: {
        utilisateur: { select: { pseudo: true, photo_profil: true } },
      },
    })
  }

  // Find all parties by utilisateur ID
  findPartieByUtilisateurId(id) {
    const userId = Number(id)
    return this.database.partie.findMany({
      where: {
        OR: [
          { id_maitre_du_jeu: userId },
          { participation: { some: { utilisateur_id: userId } } },
        ],
      },
      include: {
        utilisateur: { select: { pseudo: true, photo_profil: true } },
      },
    }).then((parties) =>
      parties.map((p) => ({
        ...p,
        role: p.id_maitre_du_jeu === userId ? 'maitre_du_jeu' : 'participant',
      }))
    )
  }

  // Find participants of a partie by partie ID
  findJoueursByPartieId(partieId) {
    return this.database.participation.findMany({
      where: { partie_id: Number(partieId) },
      include: { utilisateur: { select: { id: true, pseudo: true, photo_profil: true } } },
    }).then((rows) => rows.map((r) => r.utilisateur))
  }

  // Find parties where the utilisateur is the maitre du jeu
  findPartieMeneurByUtilisateurId(utilisateurId) {
    return this.database.partie.findMany({
      where: { id_maitre_du_jeu: Number(utilisateurId) },
      include: {
        participation: {
          include: { utilisateur: { select: { pseudo: true, photo_profil: true } } },
        },
      },
    }).then((rows) =>
      rows.map((p) => ({
        partieId: p.id,
        titre: p.titre,
        type: p.type,
        description: p.description,
        date: p.date,
        nb_max_joueurs: p.nb_max_joueurs,
        id_maitre_du_jeu: p.id_maitre_du_jeu,
        duree_estimee: p.duree_estimee,
        lieu: p.lieu,
        photo_scenario: p.photo_scenario,
        pseudosParticipants: p.participation.map((pa) => pa.utilisateur?.pseudo).filter(Boolean).join(','),
        photosProfilsParticipants: p.participation.map((pa) => pa.utilisateur?.photo_profil).filter(Boolean).join(','),
      }))
    )
  }

  // Get the count of participants in a partie
  getCountPartieById(partieId) {
    return this.database.participation.count({ where: { partie_id: Number(partieId) } })
      .then((count) => ({ partie_id: Number(partieId), nbParticipants: count }))
  }

  // Delete a partie and its related participations
  // getDestroyeurDePartie(partieId) {
  //   return this.database.query("DELETE FROM partie WHERE id = ?", [partieId])
  // }

  deleteByPartyId(partyId) {
    // Suppression d'une partie par son id
    return this.database.partie.delete({ where: { id: Number(partyId) } })
  }
}


export default PartieManager;
