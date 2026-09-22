ARG NODE_VERSION=24

FROM node:${NODE_VERSION}-alpine AS base
RUN npm install -g pnpm@12.4.1 turbo@2.11.2

FROM base AS pruner
WORKDIR /app
COPY . .
RUN turbo prune @portfolio/web --docker

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
# turbo prune leaves the root tsconfig.base.json behind; packages extend it.
COPY tsconfig.base.json ./tsconfig.base.json
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @portfolio/web run build

FROM node:${NODE_VERSION}-alpine AS runner
WORKDIR /app
RUN addgroup -S web && adduser -S web -G web
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
COPY --from=builder --chown=web:web /app/apps/web/.output ./.output
ARG APP_VERSION=unknown
ARG GIT_SHA=unknown
ENV APP_VERSION=$APP_VERSION GIT_SHA=$GIT_SHA
USER web
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
