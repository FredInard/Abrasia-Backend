# ---------- deps ----------
    FROM node:22-alpine AS deps
    WORKDIR /app
    COPY package.json pnpm-lock.yaml ./
    # PNPM via Corepack + install (lock respecté)
    RUN corepack enable && pnpm install --frozen-lockfile
    
    # ---------- build (génère Prisma Client) ----------
    FROM node:22-alpine AS build
    WORKDIR /app
    COPY --from=deps /app/node_modules ./node_modules
    COPY --chown=node:node package.json pnpm-lock.yaml ./
    COPY --chown=node:node prisma ./prisma
    COPY --chown=node:node src ./src
    COPY --chown=node:node public ./public
    COPY --chown=node:node index.js ./
    # Génère Prisma Client puis ne garde que les deps prod
    RUN corepack enable \
     && npx prisma generate \
     && pnpm prune --prod
    
    # ---------- runtime ----------
    FROM node:22-alpine
    WORKDIR /app
    ENV NODE_ENV=production
    ENV PORT=4242
    ENV HOST=0.0.0.0
    # Empêche toute régénération Prisma en runtime
    ENV PRISMA_SKIP_POSTINSTALL=1
    
    # utilitaires (healthcheck)
    RUN apk add --no-cache curl
    
    # Copie l'app déjà prête, en possession de 'node'
    COPY --from=build --chown=node:node /app ./
    
    # Garantit les répertoires d’upload et leurs droits
    RUN mkdir -p /app/public/uploads /app/public/profilPictures \
     && chown -R node:node /app/public
    
    USER node
    EXPOSE 4242
    HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD curl -fsS http://localhost:4242/health || exit 1
    CMD ["node", "index.js"]
    