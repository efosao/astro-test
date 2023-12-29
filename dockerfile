FROM oven/bun:latest AS base
WORKDIR /app

# By copying only the package.json and package-lock.json here, we ensure that the following `-deps` steps are independent of the source code.
# Therefore, the `-deps` steps will be skipped if only the source code changes.
COPY package.json ./
COPY bun.lockb ./

FROM base AS prod-deps
RUN bun install --production
COPY prisma ./prisma
RUN bunx prisma generate

FROM base AS build-deps
RUN bun install

FROM build-deps AS build
COPY . .
RUN bun run build
COPY prisma ./prisma
RUN bunx prisma generate

FROM base AS runtime
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

ENV HOST=0.0.0.0
ENV PORT=80
EXPOSE 80
CMD bun --bun ./dist/server/entry.mjs
