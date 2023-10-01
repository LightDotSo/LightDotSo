# From: https://raw.githubusercontent.com/ultrasoundmoney/eth-analysis-rs/main/Dockerfile
# Thank you to the ultrasoundmoney team for the Dockerfile!
# Awesome work for the ethereum community!

# Specify the base image we're building from.
FROM rust:1.71 AS builder

# Specify turborepo related args
ARG AWS_ACCESS_KEY_ID
ARG AWS_SECRET_ACCESS_KEY
ARG SCCACHE_ENDPOINT
ARG TURBO_TEAM
ARG TURBO_TOKEN

# Specify the working directory.
WORKDIR /app

# Install nodejs 18.
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -

# Install planning dependencies.
RUN apt install -y python3-pip nodejs

# Install building dependencies.
RUN apt-get update && \
  apt-get -y install build-essential git clang curl libsasl2-dev libssl-dev llvm libudev-dev make protobuf-compiler && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists/*

  # Build the prisma dep.
RUN npm install -g turbo@1.10.11 pnpm@8.6.9 yarn@1.22.19

# Install sccache dependencies.
ENV SCCACHE_VERSION=0.5.4
RUN curl -L https://github.com/mozilla/sccache/releases/download/v${SCCACHE_VERSION}/sccache-v${SCCACHE_VERSION}-x86_64-unknown-linux-musl.tar.gz -o sccache-v${SCCACHE_VERSION}-x86_64-unknown-linux-musl.tar.gz \
    && tar -xzf sccache-v${SCCACHE_VERSION}-x86_64-unknown-linux-musl.tar.gz \
    && mv sccache-v${SCCACHE_VERSION}-x86_64-unknown-linux-musl/sccache /usr/local/bin/ \
    && chmod +x /usr/local/bin/sccache

# Install foundry.
SHELL ["/bin/bash", "-c"]
RUN curl -L https://foundry.paradigm.xyz | bash
ENV PATH="/root/.foundry/bin:${PATH}"
RUN foundryup

# Copy over dir.
COPY . .

# Specify the build related environment variables.
ENV \
  AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID \
  AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY \
  CARGO_INCREMENTAL=0 \
  DOCKER=true \
  RUST_LOG="sccache=trace" \
  RUST_BACKTRACE=1 \
  RUSTFLAGS="-D warnings" \
  RUSTC_WRAPPER="/usr/local/bin/sccache" \
  SCCACHE_BUCKET="sccache" \
  SCCACHE_ENDPOINT=$SCCACHE_ENDPOINT \
  SCCACHE_IDLE_TIMEOUT="0" \
  SCCACHE_REGION=auto \
  SCCACHE_LOG="info,sccache::cache=debug" \
  TURBO_TEAM=$TURBO_TEAM \
  TURBO_TOKEN=$TURBO_TOKEN

# Run the build.
RUN make install && \
    sccache --start-server && \
    turbo run prisma && \
    cargo build --release && \
    sccache --show-stats

# Slim down the image for runtime.
FROM debian:bullseye-slim AS runtime

# Switch to the runtime directory.
WORKDIR /app

# sqlx depends on native TLS, which is missing in buster-slim.
RUN apt update && apt install -y libsasl2-dev libssl1.1 ca-certificates

# Copy over the binaries.
COPY --from=builder /app/target/release/lightdotso-bin /usr/local/bin
COPY --from=builder /app/target/release/api /usr/local/bin
COPY --from=builder /app/target/release/bundler /usr/local/bin
COPY --from=builder /app/target/release/cli /usr/local/bin
COPY --from=builder /app/target/release/consumer /usr/local/bin
COPY --from=builder /app/target/release/gas /usr/local/bin
COPY --from=builder /app/target/release/indexer /usr/local/bin
COPY --from=builder /app/target/release/paymaster /usr/local/bin
COPY --from=builder /app/target/release/polling /usr/local/bin
COPY --from=builder /app/target/release/prometheus /usr/local/bin
COPY --from=builder /app/target/release/rpc /usr/local/bin
COPY --from=builder /app/target/release/simulator /usr/local/bin

# Run the binary.
EXPOSE 3002
ENTRYPOINT ["/usr/local/bin/lightdotso-bin"]
