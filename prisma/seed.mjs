// prisma/seed.mjs (ESM)
// ⚠️ Tu as généré le client Prisma dans src/generated/prisma
// donc on l’importe depuis là (et pas depuis @prisma/client).
import { PrismaClient } from "../src/generated/prisma/index.js";
import argon2 from "argon2";

const prisma = new PrismaClient();

async function main() {
  // 1) Utilisateur démo (upsert pour éviter les erreurs d'unicité si tu relances)
  const passwordHash = await argon2.hash("Password!123"); // à changer en prod
  const user = await prisma.utilisateur.upsert({
    where: { email: "jane@example.com" }, // email est unique chez toi
    update: {},                           // rien à mettre si déjà présent
    create: {
      email: "jane@example.com",
      pseudo: "jane",
      nom: "Doe",
      prenom: "Jane",
      hashedpassword: passwordHash,
      role: "membre", // enum: 'membre' | 'admin' | 'tresorier' | 'secretaire' | 'inactif'
      // autres champs facultatifs possibles:
      // ville: "Paris",
      // cgu_accepted: true,
      // cookies_accepted: true,
    },
  });

  // 2) Partie démo
  const partie = await prisma.partie.create({
    data: {
      titre: "Soirée JdR",
      type: "jeux", // enum: 'jeux' | 'evenement'
      date: new Date(),
      nb_max_joueurs: 5,
      id_maitre_du_jeu: user.id,
      strict_nb_joueurs: false,
      lieu: "Maison des asso",
    },
  });

  // 3) Participation
  await prisma.participation.create({
    data: {
      utilisateur_id: user.id,
      partie_id: partie.id,
      date_participation: new Date(),
    },
  });

  // 4) Cotisation démo
  await prisma.cotisation.create({
    data: {
      utilisateur_id: user.id,
      annee: 2025,           // SMALLINT + CHECK en DB
      montant: 20.0,
      etat: "payee",         // enum: 'payee' | 'non_payee'
      date_paiement: new Date(),
    },
  });

  // 5) (Optionnel) Covoiturage
  await prisma.covoiturage.create({
    data: {
      utilisateur_id: user.id,
      partie_id: partie.id,
      ville_depart: "Lyon",
      ville_arrivee: "Villeurbanne",
      heure_depart: new Date(Date.now() + 3600 * 1000),
      propose_retour: true,
    },
  });

  console.log("Seed OK ✅", { userId: user.id, partieId: partie.id });
}

main()
  .catch((e) => {
    console.error("Seed FAILED ❌", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
