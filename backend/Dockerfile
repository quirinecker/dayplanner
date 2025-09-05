FROM oven/bun:latest AS build

WORKDIR /app

COPY package.json ./

COPY bun.lock ./

RUN bun install

COPY src ./src

RUN ls && bun run build

FROM oven/bun:latest AS run

WORKDIR /app

COPY --from=build /app/dist/ .

EXPOSE 3000

CMD ["bun", "run", "main.js"]
