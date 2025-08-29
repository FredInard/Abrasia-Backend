// UtilisateurManager.js

import AbstractManager from "./AbstractManager.js";

class UtilisateurManager extends AbstractManager {
  constructor() {
    super({ table: "utilisateur" });
  }

  findByEmailOrPseudo(email, pseudo) {
    return this.database.utilisateur.findFirst({
      where: {
        OR: [
          { email: { equals: email, mode: 'insensitive' } },
          { pseudo },
        ],
      },
    });
  }

  // Anonymise toutes les infos (sauf id, date_inscription)
  anonymize(id) {
    return this.database.utilisateur.update({
      where: { id: Number(id) },
      data: {
        nom: '...',
        prenom: '...',
        email: '...',
        pseudo: '...',
        role: 'inactif',
        date_naissance: null,
        adresse: '...',
        ville: '...',
        telephone: '...',
        bio: '...',
        photo_profil: null,
        hashedpassword: 'AnonymizedPassword123!',
        // date_inscription: keep as is
        dernier_login: null,
      },
    });
  }

  // Insérer un nouvel utilisateur
  insert(utilisateur) {
    return this.database.utilisateur.create({
      data: {
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        email: utilisateur.email,
        pseudo: utilisateur.pseudo,
        hashedpassword: utilisateur.hashedPassword,
        role: utilisateur.role || 'membre',
        date_naissance: utilisateur.date_naissance || null,
        adresse: utilisateur.adresse || null,
        ville: utilisateur.ville || null,
        code_postal: utilisateur.code_postal || null,
        telephone: utilisateur.telephone || null,
        bio: utilisateur.bio || null,
        photo_profil: utilisateur.photo_profil || null,
        cgu_accepted: Boolean(utilisateur.cgu_accepted),
        cookies_accepted: Boolean(utilisateur.cookies_accepted),
      },
    });
  }

  // Mettre à jour un utilisateur existant
  update(utilisateur) {
    console.info("utilisateur manager", utilisateur);
    return this.database.utilisateur.update({
      where: { id: Number(utilisateur.id) },
      data: {
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        email: utilisateur.email,
        pseudo: utilisateur.pseudo,
        // N'update le rôle que s'il est fourni (évite de passer undefined à un enum Prisma)
        ...(Object.prototype.hasOwnProperty.call(utilisateur, "role")
          ? { role: utilisateur.role }
          : {}),
        date_naissance: utilisateur.date_naissance || null,
        adresse: utilisateur.adresse || null,
        ville: utilisateur.ville || null,
        code_postal: utilisateur.code_postal || null,
        telephone: utilisateur.telephone || null,
        bio: utilisateur.bio || null,
        // N'update la photo que si fournie (undefined => ne pas toucher, "" => null)
        ...(Object.prototype.hasOwnProperty.call(utilisateur, "photo_profil")
          ? { photo_profil: utilisateur.photo_profil || null }
          : {}),
      },
    });
  }

  // Trouver tous les utilisateurs
  findAll() {
    return this.database.utilisateur.findMany({
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        pseudo: true,
        role: true,
        date_naissance: true,
        adresse: true,
        ville: true,
        code_postal: true,
        telephone: true,
        bio: true,
        photo_profil: true,
        date_inscription: true,
        dernier_login: true,
      },
    });
  }

  // Trouver un utilisateur par ID
  find(id) {
    return this.database.utilisateur.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        pseudo: true,
        role: true,
        date_naissance: true,
        adresse: true,
        ville: true,
        code_postal: true,
        telephone: true,
        bio: true,
        photo_profil: true,
        date_inscription: true,
        dernier_login: true,
      },
    });
  }

  // Supprimer un utilisateur par ID
  delete(id) {
    return this.database.utilisateur.delete({ where: { id: Number(id) } });
  }

  // Trouver un utilisateur par pseudo
  findByPseudo(pseudo) {
    return this.database.utilisateur.findUnique({
      where: { pseudo },
      select: { id: true, pseudo: true },
    });
  }

  // Trouver un utilisateur par email avec le mot de passe
  findByEmailWithPassword(email) {
    console.info(" [DB] Requête pour trouver l'utilisateur :", email);

    return this.database.utilisateur.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
      select: {
        id: true,
        email: true,
        hashedpassword: true,
        role: true,
        pseudo: true,
        photo_profil: true,
      },
    })
      .then((user) => {
        console.info(" [DB] Utilisateur trouvé dans la base :", user || "Aucun utilisateur");
        // Mimer le retour mysql2: [rows]
        return [user ? [user] : []];
      })
      .catch((err) => {
        console.error(" [DB] Erreur lors de la récupération de l'utilisateur :", err);
        throw err;
      });
  }

  // Mettre à jour le mot de passe
  updatePassword(id, hashedPassword) {
    return this.database.utilisateur.update({
      where: { id: Number(id) },
      data: { hashedpassword: hashedPassword },
    });
  }

  // Mettre à jour la photo de profil
  updatePhotoProfil(id, photoProfil) {
    return this.database.utilisateur.update({
      where: { id: Number(id) },
      data: { photo_profil: photoProfil },
    });
  }

  // Récupérer le profil d'un utilisateur par ID (sans le mot de passe)
  findProfileById(id) {
    return this.database.utilisateur.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        pseudo: true,
        role: true,
        date_naissance: true,
        adresse: true,
        ville: true,
        code_postal: true,
        telephone: true,
        bio: true,
        photo_profil: true,
        date_inscription: true,
        dernier_login: true,
      },
    });
  }

  // Recherche d'un utilisateur par email
  findByEmail(email) {
    return this.database.utilisateur.findFirst({ where: { email: { equals: email, mode: 'insensitive' } } });
  }
}

// Export par défaut
export default UtilisateurManager;
