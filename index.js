// index.js
import "dotenv/config";
import app from "./src/app.js";

// Si tu as un fichier src/prisma.js qui exporte un client unique :
let prisma;
try {
  ({ default: prisma } = await import("./src/prisma.js"));
} catch {
  // pas grave si tu n'utilises pas ce module
}

const port = Number(process.env.APP_PORT ?? process.env.PORT ?? 4242);
const host = process.env.HOST ?? "0.0.0.0";

console.info(`🔄 Initialisation du serveur sur ${host}:${port}...`);

const server = app.listen(port, host, (err) => {
  if (err) {
    console.error("❌ Erreur lors du démarrage du serveur :", err);
  } else {
    const shownHost = host === "0.0.0.0" ? "localhost" : host;
    console.info(`✅ Serveur opérationnel sur http://${shownHost}:${port}`);
  }
});

// Arrêt propre (CTRL+C, Docker stop, etc.)
async function shutdown(signal) {
  console.info(`\n${signal} reçu — arrêt en cours…`);
  try {
    if (prisma?.$disconnect) await prisma.$disconnect();
  } catch (e) {
    console.error("Erreur à la fermeture Prisma:", e);
  } finally {
    server.close(() => {
      console.info("Serveur HTTP arrêté. 👋");
      process.exit(0);
    });
    // garde-fou si close traîne
    setTimeout(() => process.exit(1), 5000);
  }
}
["SIGINT", "SIGTERM"].forEach((sig) => process.on(sig, () => shutdown(sig)));
process.on("uncaughtException", (e) => {
  console.error(e);
  shutdown("uncaughtException");
});
process.on("unhandledRejection", (e) => {
  console.error(e);
  shutdown("unhandledRejection");
});
