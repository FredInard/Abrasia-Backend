// verifyToken.js (Version ESM)

import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const authorizationHeader = req.headers.authorization;

  // Vérifie la présence de l'entête Authorization
  if (!authorizationHeader) {
    return res.status(401).json({ error: "Aucun en-tête d’authentification fourni." });
  }

  // Vérifie la structure de l'entête (ex: "Bearer xxx")
  const [scheme, bearerToken] = authorizationHeader.split(" ");
  if (scheme !== "Bearer" || !bearerToken) {
    return res.status(401).json({ error: "Format d’authentification invalide." });
  }

  try {
    // Vérifie et décode le jeton
    const decoded = jwt.verify(bearerToken, process.env.JWT_SECRET);

    // Vérifie si l'utilisateur est inactif
    if (decoded.role === "inactif") {
      return res.status(403).json({
        error: "Compte désactivé. Veuillez contacter un administrateur.",
      });
    }

    // Stocke les infos du jeton dans req.user (ou req.payload)
    req.user = decoded;
    return next();
  } catch (err) {
    console.error("Erreur lors de la vérification du jeton :", err);
    return res.status(403).json({ error: "Jeton invalide ou expiré." });
  }
};
