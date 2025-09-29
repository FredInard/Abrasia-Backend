# ---------- deps ----------
    FROM node:22-alpine AS deps
    WORKDIR /app
    COPY package.json pnpm-lock.yaml ./
    # PNPM via Corepack + install prod (avec lock)
    RUN corepack enable && pnpm install --frozen-lockfile
    
    # ---------- build (génère Prisma Client) ----------
    FROM node:22-alpine AS build
    WORKDIR /app
    COPY --from=deps /app/node_modules ./node_modules
    COPY package.json pnpm-lock.yaml ./
    COPY prisma ./prisma
    COPY src ./src
    COPY public ./public              # <- important : /app/public
    COPY index.js ./
    # Génère Prisma Client puis ne garde que les deps prod
    RUN corepack enable && npx prisma generate && pnpm prune --prod
    
    # ---------- runtime ----------
    FROM node:22-alpine
    WORKDIR /app
    ENV NODE_ENV=production
    ENV PORT=4242
    ENV HOST=0.0.0.0
    
    # utilitaire pour healthcheck
    RUN apk add --no-cache curl
    
    # Exécuter en user non-root
    USER node
    
    # Copie du build (code + node_modules prod + public + prisma client)
    COPY --from=build /app ./
    
    EXPOSE 4242
    HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
      CMD curl -fsS http://localhost:4242/health || exit 1
    
    CMD ["node", "index.js"]
    