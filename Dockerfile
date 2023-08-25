# From: https://raw.githubusercontent.com/ultrasoundmoney/eth-analysis-rs/main/Dockerfile
# Thank you to the ultrasoundmoney team for the Dockerfile!
# Awesome work for the ethereum community!

# Specify the base image we're building from.
FROM rust:1.71 AS builder

# Specify turborepo related args
ARG TURBO_TEAM
ARG TURBO_TOKEN

# Specify the working directory.
WORKDIR /app

# Specify the target we're building for.
ENV DOCKER=true

# Specify turborepo related envs.
ENV TURBO_TEAM=${TURBO_TEAM}
ENV TURBO_TOKEN=${TURBO_TOKEN}

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
  apt-get -y install build-essential git clang curl libsasl2-dev libssl-dev llvm libudev-dev make protobuf-compiler && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists/*

# Run the build.
RUN make install && \
    turbo run prisma && \
    cargo build --release

# Slim down the image for runtime.
FROM debian:bullseye-slim AS runtime

# Switch to the runtime directory.
WORKDIR /app

# sqlx depends on native TLS, which is missing in buster-slim.
RUN apt update && apt install -y libsasl2-dev libssl1.1 ca-certificates

# Copy over the binaries.
COPY --from=builder /app/target/release/lightdotso-bin /usr/local/bin
COPY --from=builder /app/target/release/bundler /usr/local/bin
COPY --from=builder /app/target/release/cli /usr/local/bin
COPY --from=builder /app/target/release/consumer /usr/local/bin
COPY --from=builder /app/target/release/indexer /usr/local/bin
COPY --from=builder /app/target/release/paymaster /usr/local/bin
COPY --from=builder /app/target/release/prometheus /usr/local/bin
COPY --from=builder /app/target/release/rpc /usr/local/bin
COPY --from=builder /app/target/release/simulator /usr/local/bin

# Run the binary.
EXPOSE 3002
ENTRYPOINT ["/usr/local/bin/lightdotso-bin"]
