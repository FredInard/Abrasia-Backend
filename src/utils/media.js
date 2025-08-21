// src/utils/media.js
const baseFromEnv =
  process.env.PUBLIC_BASE_URL ||
  `http://localhost:${process.env.PORT || process.env.APP_PORT || 4242}`;

const BASE = baseFromEnv.replace(/\/+$/, "");

export function publicUrl(relative) {
  const rel = String(relative || "").replace(/\/{2,}/g, "/");
  return `${BASE}${rel.startsWith("/") ? "" : "/"}${rel}`;
}

/**
 * URL d'avatar:
 * - si photo_profil est un nom de fichier -> /public/profilPictures/<fichier>
 * - si photo_profil est déjà un chemin /public/... -> le réutiliser tel quel
 * - sinon fallback -> /public/_defaults/dragonBook.webp
 */
export function profilePhotoUrl(photoProfil) {
  if (!photoProfil) return publicUrl("/public/_defaults/dragonBook.webp");
  const v = String(photoProfil);
  if (v.startsWith("/public/") || v.startsWith("public/")) {
    return publicUrl(v.startsWith("/") ? v : `/${v}`);
  }
  return publicUrl(`/public/profilPictures/${v}`);
}

/**
 * (optionnel) URL de photo de scénario/partie
 */
export function scenarioPhotoUrl(photoScenario) {
  if (!photoScenario) return publicUrl("/public/_defaults/dragonBook.webp");
  const v = String(photoScenario);
  if (v.startsWith("/public/") || v.startsWith("public/")) {
    return publicUrl(v.startsWith("/") ? v : `/${v}`);
  }
  return publicUrl(`/public/uploads/${v}`);
}
