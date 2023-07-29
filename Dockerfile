# From: https://raw.githubusercontent.com/ultrasoundmoney/eth-analysis-rs/main/Dockerfile
# Thank you to the ultrasoundmoney team for the Dockerfile!
# Awesome work for the ethereum community!

# Specify sccache related args
ARG AWS_ACCESS_KEY_ID
ARG AWS_SECRET_ACCESS_KEY
ARG SCCACHE_ENDPOINT
ARG SCCACHE_BUCKET=sccache
ARG SCCACHE_REGION=auto
ARG SCCACHE_S3_USE_SSL=true
ARG TURBO_TEAM
ARG TURBO_TOKEN

# Specify the base image we're building from.
FROM rust:1.70 AS builder

WORKDIR /app

# Specify the target we're building for.
ENV DOCKER=true

# Specify sccache related envs.
ENV AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
ENV AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY
ENV SCCACHE_ENDPOINT=$SCCACHE_ENDPOINT
ENV SCCACHE_BUCKET=$SCCACHE_BUCKET
ENV SCCACHE_REGION=$SCCACHE_REGION
ENV SCCACHE_S3_USE_SSL=$SCCACHE_S3_USE_SSL

# Specify turborepo related envs.
ENV TURBO_TEAM=$TURBO_TEAM
ENV TURBO_TOKEN=$TURBO_TOKEN

# We only pay the installation cost once,
# it will be cached from the second build onwards
# From: https://github.com/LukeMathWalker/cargo-chef#without-the-pre-built-image
RUN cargo install sccache

# Specify sccache as the rustc wrapper for subsequent runs.
# ENV RUSTC_WRAPPER="sccache"

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
RUN make install && turbo run prisma && cargo build --release

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
