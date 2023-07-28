## From: https://raw.githubusercontent.com/ultrasoundmoney/eth-analysis-rs/main/Dockerfile
## Thank you to the ultrasoundmoney team for the Dockerfile!
## Awesome work for the ethereum community!

# Specify the base image we're building from.
FROM rust:1 AS builder

WORKDIR /app

# Specify the target we're building for.
ENV DOCKER=true

# Specify turborepo related args and envs.
ARG TURBO_TEAM
ENV TURBO_TEAM=$TURBO_TEAM
ARG TURBO_TOKEN
ENV TURBO_TOKEN=$TURBO_TOKEN

# Install nodejs 18.
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -

# Install planning dependencies.
RUN apt install -y python3-pip nodejs

# Copy over dir.
COPY . .

# Figure out if dependencies have changed.
RUN cargo chef prepare --recipe-path recipe.json && \
      npm install -g turbo@1.10.11 pnpm@8.6.9 && \
      turbo run prisma

# Install building dependencies.
RUN apt-get update && apt-get -y install build-essential git clang curl libssl-dev llvm libudev-dev make protobuf-compiler

# Run the build.
RUN make install && cargo build --release

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
