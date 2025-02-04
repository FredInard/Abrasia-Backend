// verifyToken.js (Version ESM)

import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Récupération du token

  if (!token) {
    return res.status(401).json({ error: "Accès non autorisé." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Vérifie le token
    req.user = decoded;

    // Vérifie si l'utilisateur est inactif
    if (decoded.role === "inactif") {
      return res.status(403).json({
        error: "Ce compte est désactivé. Veuillez contacter un administrateur.",
      });
    }

    next(); // Token valide
  } catch (err) {
    console.error("Erreur lors de la vérification du token :", err);
    return res.status(403).json({ error: "Token invalide." });
  }
};
