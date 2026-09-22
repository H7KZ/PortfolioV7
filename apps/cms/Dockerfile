ARG NODE_VERSION=24

FROM node:${NODE_VERSION}-alpine AS base
RUN apk add --no-cache libc6-compat
RUN npm install -g pnpm@12.4.1 turbo@2.11.2

FROM base AS pruner
WORKDIR /app
COPY . .
RUN turbo prune @portfolio/cms --docker

FROM base AS installer
WORKDIR /app
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile --ignore-scripts

FROM base AS builder
WORKDIR /app
COPY --from=installer /app/node_modules ./node_modules
COPY --from=pruner /app/out/full/ .
COPY tsconfig.base.json ./tsconfig.base.json
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
RUN pnpm install --frozen-lockfile
# config.ts refuses to start without production secrets; the build only compiles, it never connects.
ENV BUILD_STANDALONE=1 PAYLOAD_SKIP_ENV_CHECK=1 NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter @portfolio/cms run build

FROM node:${NODE_VERSION}-alpine AS runner
WORKDIR /app
RUN apk add --no-cache libc6-compat && addgroup -S cms && adduser -S cms -G cms && mkdir -p /data/media && chown cms:cms /data/media
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
# Docker sets HOSTNAME to the container id, which Next's standalone server would bind to exclusively.
ENV HOSTNAME=0.0.0.0
ENV MEDIA_DIR=/data/media
COPY --from=builder --chown=cms:cms /app/apps/cms/.next/standalone ./
COPY --from=builder --chown=cms:cms /app/apps/cms/.next/static ./apps/cms/.next/static
ARG APP_VERSION=unknown
ARG GIT_SHA=unknown
ENV APP_VERSION=$APP_VERSION GIT_SHA=$GIT_SHA
USER cms
EXPOSE 3000
CMD ["node", "apps/cms/server.js"]
