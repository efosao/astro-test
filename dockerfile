FROM oven/bun:debian

WORKDIR /app

# Install nodejs using n
# RUN apt-get -y update; apt-get -y install curl
# ARG NODE_VERSION=18
# RUN curl -L https://raw.githubusercontent.com/tj/n/master/bin/n -o n \
#     && bash n $NODE_VERSION \
#     && rm n \
#     && npm install -g n

COPY package.json .
COPY bun.lockb .

RUN bun install --production

COPY . .

RUN echo "Generating Prisma Client"
ENV NODE_ENV production
RUN bunx prisma generate

RUN bun run build

CMD ["bun", "run", "start"]

EXPOSE 80
