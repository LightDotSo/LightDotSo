# From: https://raw.githubusercontent.com/ultrasoundmoney/eth-analysis-rs/main/Dockerfile
# Thank you to the ultrasoundmoney team for the Dockerfile!
# Awesome work for the ethereum community!

# Specify the base image we're building from.
FROM rust:1.70 AS chef

WORKDIR /app

# Specify the target we're building for.
ENV DOCKER=true
ENV RUSTC_WRAPPER="sccache"

# Specify sccache related args and envs.
ARG SCCACHE_KEY_ID
ENV AWS_ACCESS_KEY_ID=$SCCACHE_KEY_ID
ARG SCCACHE_SECRET
ENV AWS_SECRET_ACCESS_KEY=$SCCACHE_SECRET
ARG SCCACHE_ENDPOINT
ENV SCCACHE_ENDPOINT=$SCCACHE_ENDPOINT
ENV SCCACHE_BUCKET=sccache
ENV SCCACHE_REGION=auto

# Specify turborepo related args and envs.
ARG TURBO_TEAM
ENV TURBO_TEAM=$TURBO_TEAM
ARG TURBO_TOKEN
ENV TURBO_TOKEN=$TURBO_TOKEN

# We only pay the installation cost once,
# it will be cached from the second build onwards
# From: https://github.com/LukeMathWalker/cargo-chef#without-the-pre-built-image
RUN cargo install cargo-chef sccache

# Install nodejs 18.
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -

# Install planning dependencies.
RUN apt install -y python3-pip nodejs

# Copy over dir.
COPY . .

# Build the prisma dep.
RUN npm install -g turbo@1.10.11 pnpm@8.6.9

# Install building dependencies.
RUN apt-get update && \
  apt-get -y install build-essential git clang curl libssl-dev llvm libudev-dev make protobuf-compiler && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists/*

# Run the build.
RUN make install

FROM chef AS planner

COPY . .
RUN cargo chef prepare --recipe-path recipe.json && \
  turbo run prisma

FROM chef AS builder

COPY --from=planner /app/recipe.json recipe.json
COPY --from=planner /app/crates/prisma/src/lib.rs crates/prisma/src/lib.rs
# Build dependencies - this is the caching Docker layer!
RUN cargo chef cook --release --recipe-path recipe.json

# Build application
COPY . .
RUN cargo build --release

# Slim down the image for runtime.
FROM debian:bullseye-slim AS runtime
WORKDIR /app

# sqlx depends on native TLS, which is missing in buster-slim.
RUN apt update && apt install -y libssl1.1 ca-certificates

# Copy over the binaries.
COPY --from=builder /app/target/release/lightdotso-bin /usr/local/bin
COPY --from=builder /app/target/release/cli /usr/local/bin
COPY --from=builder /app/target/release/rpc /usr/local/bin
COPY --from=builder /app/target/release/serve /usr/local/bin

# Run the binary.
EXPOSE 3002
ENTRYPOINT ["/usr/local/bin/lightdotso-bin"]
