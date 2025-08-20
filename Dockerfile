# ---------- deps ----------
    FROM node:22-alpine AS deps
    WORKDIR /app
    COPY package.json pnpm-lock.yaml ./
    # Active Corepack et installe PNPM défini par "packageManager"
    RUN corepack enable && pnpm install --frozen-lockfile
    
    # ---------- build (génère Prisma Client) ----------
    FROM node:22-alpine AS build
    WORKDIR /app
    COPY --from=deps /app/node_modules node_modules
    COPY . .
    # Active PNPM dans cette étape aussi + génère Prisma Client
    RUN corepack enable && npx prisma generate && pnpm prune --prod
    
    # ---------- runtime ----------
    FROM node:22-alpine
    WORKDIR /app
    ENV NODE_ENV=production
    ENV PORT=4242
    # (optionnel) forcer l'écoute sur 0.0.0.0 via ENV si tu veux
    ENV HOST=0.0.0.0
    
    # utilitaire pour le healthcheck
    RUN apk add --no-cache curl
    
    # Utiliser l'utilisateur 'node' déjà présent dans l'image
    USER node
    
    # Copie du code + node_modules de prod
    COPY --from=build /app ./
    
    EXPOSE 4242
    HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD curl -fsS http://localhost:4242/health || exit 1
    
    # Démarre l'app (pas de migrate ici car prisma CLI est devDependency et pruné)
    CMD ["node", "index.js"]
    