## From: https://raw.githubusercontent.com/ultrasoundmoney/eth-analysis-rs/main/Dockerfile
## Thank you to the ultrasoundmoney team for the Dockerfile!
## Awesome work for the ethereum community!

FROM ubuntu:20.04 AS base

WORKDIR /rust

# Install nodejs and clang dependencies.
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -

# Install rust and cargo chef.
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:$PATH"

# We only pay the installation cost once,
# it will be cached from the second build onwards
RUN cargo install cargo-chef

FROM base AS planner

WORKDIR /app

# Specify the target we're building for.
ENV docker=true

ARG TURBO_TEAM
ENV TURBO_TEAM=$TURBO_TEAM

ARG TURBO_TOKEN
ENV TURBO_TOKEN=$TURBO_TOKEN

COPY . .

RUN apt-get update && \
  apt-get -y upgrade && \
  apt-get install -y build-essential software-properties-common curl git clang libclang-dev nodejs && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists/*

# Figure out if dependencies have changed.
RUN cargo chef prepare --recipe-path recipe.json && \
      npm install -g turbo@1.10.11 pnpm@8.6.9 && \
      turbo run prisma

FROM base AS builder
COPY --from=planner /app/recipe.json recipe.json

# Build dependencies - this layer is cached for massive speed up.
RUN cargo chef cook --release --recipe-path recipe.json

# Build application - this should be re-done every time we update our src.
COPY . .
COPY --from=planner /app/crates/prisma/src/lib.rs crates/prisma/src/lib.rs

RUN cargo build --release

FROM debian:bullseye-slim AS runtime
WORKDIR /app

# sqlx depends on native TLS, which is missing in buster-slim.
RUN apt update && apt install -y libssl1.1 ca-certificates

COPY --from=builder /app/target/release/lightdotso-bin /usr/local/bin
COPY --from=builder /app/target/release/cli /usr/local/bin
COPY --from=builder /app/target/release/rpc /usr/local/bin
COPY --from=builder /app/target/release/serve /usr/local/bin
EXPOSE 3002
ENTRYPOINT ["/usr/local/bin/lightdotso-bin"]
