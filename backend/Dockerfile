# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma/
RUN npm ci --omit=dev && npx prisma generate

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma
COPY . .
RUN npx prisma generate && npm run build

# Stage 3: Production
FROM node:20-alpine AS production
RUN apk add --no-cache dumb-init
WORKDIR /app
ENV NODE_ENV=production

# Non-root user
RUN addgroup -g 1001 hub4estate && adduser -u 1001 -G hub4estate -s /bin/sh -D hub4estate

COPY --from=deps --chown=hub4estate:hub4estate /app/node_modules ./node_modules
COPY --from=builder --chown=hub4estate:hub4estate /app/dist ./dist
COPY --from=builder --chown=hub4estate:hub4estate /app/prisma ./prisma
COPY --chown=hub4estate:hub4estate package.json ./

USER hub4estate

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
