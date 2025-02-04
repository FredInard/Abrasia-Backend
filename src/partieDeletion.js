// auth.js (Version ESM)

import argon2 from "argon2";
import jwt from "jsonwebtoken";

// Options de hachage pour Argon2
const hashingOptions = {
  type: argon2.argon2id,
  memoryCost: 2 ** 16, // 64 MB
  timeCost: 5,
  parallelism: 1,
};

// Middleware pour hacher le mot de passe avant de le stocker
export const hashPassword = async (req, res, next) => {
  try {
    const { motDePasse } = req.body;

    if (!motDePasse) {
      return res.status(400).send("Le mot de passe est requis.");
    }

    // Hachage du mot de passe
    const hashedPassword = await argon2.hash(motDePasse, hashingOptions);

    // Remplacer le mot de passe en clair par le mot de passe haché
    req.body.mot_de_passe = hashedPassword;

    next();
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
};

// Vérification du mot de passe lors de la connexion
export const verifyPassword = async (req, res) => {
  try {
    const { motDePasse } = req.body;
    const { mot_de_passe: hashedPassword } = req.utilisateur;

    if (!motDePasse) {
      return res.status(400).send("Le mot de passe est requis.");
    }

    // Vérification du mot de passe
    const isVerified = await argon2.verify(hashedPassword, motDePasse);

    if (isVerified) {
      // Génération du token JWT
      const payload = { sub: req.utilisateur.id };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "12h",
      });

      // Suppression du mot de passe avant de renvoyer l'utilisateur
      delete req.utilisateur.mot_de_passe;

      res.status(200).send({ token, utilisateur: req.utilisateur });
    } else {
      res.status(401).send("Mot de passe incorrect.");
    }
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
};

// Middleware pour vérifier le token JWT
export const verifyToken = (req, res, next) => {
  try {
    const authorizationHeader = req.get("Authorization");

    if (!authorizationHeader) {
      return res.status(401).send("Header d'authentification manquant.");
    }

    const [type, token] = authorizationHeader.split(" ");

    if (type !== "Bearer" || !token) {
      return res.status(401).send("Type d'authentification invalide.");
    }

    // Vérification du token
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Ajout des informations du token à la requête
    req.payload = payload;

    next();
  } catch (err) {
    console.error(err);
    res.status(401).send("Token invalide ou expiré.");
  }
};
