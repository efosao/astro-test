FROM oven/bun

WORKDIR /app

# Install nodejs using n
RUN apt-get -y update; apt-get -y install curl
ARG NODE_VERSION=18
RUN curl -L https://raw.githubusercontent.com/tj/n/master/bin/n -o n \
    && bash n $NODE_VERSION \
    && rm n \
    && npm install -g n

# Update bun
RUN apt install zip -y
RUN bun upgrade

COPY package.json .
COPY bun.lockb .

RUN bun install --production

# COPY tailwind.config.js .
# COPY tsconfig.json .
# COPY prisma ./prisma
# COPY src ./src
COPY . .

RUN echo "Generating Prisma Client"
ENV NODE_ENV production
RUN bunx prisma generate

# RUN bun run build:scripts:prod
# RUN bun run build:css:prod

RUN bun run build

# CMD ["bun", "src/index.tsx"]
# CMD ["node", "dist/server/entry.mjs"]

# EXPOSE 80

ENV PORT=4321
EXPOSE 4321
CMD node ./dist/server/entry.mjs