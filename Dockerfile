# ---------- deps ----------
    FROM node:22-alpine AS deps
    WORKDIR /app
    COPY package.json pnpm-lock.yaml ./
    RUN corepack enable && pnpm install --frozen-lockfile
    
    # ---------- build ----------
    FROM node:22-alpine AS build
    WORKDIR /app
    COPY --from=deps /app/node_modules ./node_modules
    COPY package.json pnpm-lock.yaml ./
    COPY prisma ./prisma
    COPY src ./src
    COPY public ./public
    COPY index.js ./
    RUN corepack enable && npx prisma generate && pnpm prune --prod
    
    # ---------- runtime ----------
    FROM node:22-alpine
    WORKDIR /app
    ENV NODE_ENV=production
    ENV PORT=4242
    ENV HOST=0.0.0.0
    RUN apk add --no-cache curl
    COPY --from=build /app ./
    USER node
    EXPOSE 4242
    HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD curl -fsS http://localhost:4242/health || exit 1
    CMD ["node", "index.js"]
    