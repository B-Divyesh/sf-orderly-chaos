FROM node:22-slim AS web
WORKDIR /app
ARG BUILD_SHA=dev
COPY package.json package-lock.json ./
RUN npm ci
COPY index.html tsconfig.json vite.config.ts ./
COPY public ./public
COPY src ./src
RUN BUILD_SHA="$BUILD_SHA" npm run build

FROM rust:1-slim AS server
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends build-essential pkg-config && rm -rf /var/lib/apt/lists/*
ARG BUILD_SHA=dev
COPY Cargo.toml Cargo.lock ./
COPY src/main.rs ./src/main.rs
RUN BUILD_SHA="$BUILD_SHA" cargo build --release --locked

FROM debian:bookworm-slim AS runtime
RUN groupadd --system orderly && useradd --system --gid orderly --home-dir /app orderly
WORKDIR /app
COPY --from=server /app/target/release/orderly-chaos-server /usr/local/bin/orderly-chaos-server
COPY --from=web /app/dist ./dist
RUN mkdir -p /data && chown -R orderly:orderly /app /data
USER orderly
ENV PORT=8080
EXPOSE 8080
CMD ["/usr/local/bin/orderly-chaos-server"]
