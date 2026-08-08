FROM node:20-alpine AS base
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/package.json
RUN pnpm install --filter @pulse/web --frozen-lockfile=false
COPY . .
RUN pnpm --filter @pulse/web build
EXPOSE 3000
CMD ["pnpm","--filter","@pulse/web","start"]
