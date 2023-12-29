FROM oven/bun:debian

WORKDIR /app

# Install nodejs using n
# RUN apt-get -y update; apt-get -y install curl
# ARG NODE_VERSION=18
# RUN curl -L https://raw.githubusercontent.com/tj/n/master/bin/n -o n \
#     && bash n $NODE_VERSION \
#     && rm n \
#     && npm install -g n

ENV NODE_ENV production
ENV HOST=0.0.0.0
ENV PORT=80

COPY package.json .
COPY bun.lockb .

RUN bun install --production

COPY . .

RUN echo "Generating Prisma Client"
RUN bunx prisma generate

RUN bun run build

EXPOSE 80

CMD ["bun", "run", "start"]
