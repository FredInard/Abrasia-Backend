import argon2 from "argon2";
import jwt from "jsonwebtoken";

// ✅ Options de hachage sécurisées pour Argon2
const HASHING_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 2 ** 16, // 64 MB
  timeCost: 5,
  parallelism: 1,
};

// ✅ Middleware pour hacher un mot de passe avant stockage
export const hashPassword = async (req, res, next) => {
  try {
    const { motDePasse } = req.body;

    if (!motDePasse || typeof motDePasse !== "string") {
      return res.status(400).json({ error: "Un mot de passe valide est requis." });
    }

    // Harmonisation du champ attendu côté controllers/managers
    // La BDD utilise la colonne `hashedpassword` (prisma), et les controllers lisent `hashedPassword` dans req.body
    // On remplit donc `req.body.hashedPassword` ici (au lieu de `mot_de_passe`)
    req.body.hashedPassword = await argon2.hash(motDePasse, HASHING_OPTIONS);
    // Si d'autres parties du code lisent encore `mot_de_passe`, on peut conserver la compatibilité:
    // req.body.mot_de_passe = req.body.hashedPassword;
    next();
  } catch (error) {
    console.error("❌ Erreur lors du hachage du mot de passe:", error);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
};

// ✅ Vérification du mot de passe à la connexion
export const verifyPassword = async (req, res) => {
  try {
    const { motDePasse } = req.body;
    // Prisma renvoie le champ "hashedpassword" (snake/camel mix). On le mappe vers hashedPassword.
    const { hashedpassword: hashedPassword, id, role, pseudo, email } = req.utilisateur;

    if (!motDePasse || typeof motDePasse !== "string") {
      return res.status(400).json({ error: "Le mot de passe est requis." });
    }

    const isVerified = await argon2.verify(hashedPassword, motDePasse);

    if (!isVerified) {
      return res.status(401).json({ error: "Mot de passe incorrect." });
    }

    // ✅ Génération du token JWT sécurisé
    // Inclure aussi `id` pour compatibilité avec le front qui lit decodedToken.id
    const token = jwt.sign({ sub: id, id, role, pseudo, email }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRATION || "12h", // Configurable via .env
    });

    // ✅ Suppression des informations sensibles avant envoi
    const utilisateur = { id, role, pseudo, email };

    res.status(200).json({ token, utilisateur });
  } catch (error) {
    console.error("❌ Erreur lors de la vérification du mot de passe:", error);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
};

// ✅ Middleware pour vérifier un token JWT
export const verifyToken = (req, res, next) => {
  try {
    const authorizationHeader = req.get("Authorization");

    if (!authorizationHeader) {
      return res.status(401).json({ error: "Header d'authentification manquant." });
    }

    const [type, token] = authorizationHeader.split(" ");

    if (type !== "Bearer" || !token) {
      return res.status(401).json({ error: "Type d'authentification invalide." });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.utilisateur = payload; // Ajoute les infos utilisateur à la requête

    next();
  } catch (error) {
    console.error("❌ Erreur lors de la vérification du token:", error);
    res.status(401).json({ error: "Token invalide ou expiré." });
  }
};

// ✅ Middleware pour restreindre l'accès aux admins uniquement
export const requireAdmin = (req, res, next) => {
  if (req.utilisateur?.role !== "admin") {
    return res.status(403).json({ error: "Accès refusé. Administrateur requis." });
  }
  next();
};

// ✅ Middleware pour restreindre l'accès aux utilisateurs actifs uniquement
export const requireActiveUser = (req, res, next) => {
  if (req.utilisateur?.role === "inactif") {
    return res
      .status(403)
      .json({ error: "Votre compte est désactivé. Contactez un administrateur." });
  }
  next();
};
