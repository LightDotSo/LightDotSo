## From: https://raw.githubusercontent.com/ultrasoundmoney/eth-analysis-rs/main/Dockerfile
## Thank you to the ultrasoundmoney team for the Dockerfile!
## Awesome work for the ethereum community!

FROM lukemathwalker/cargo-chef:latest-rust-latest AS chef
WORKDIR /app

FROM chef AS planner

# Specify the target we're building for.
ENV docker=true

ARG TURBO_TEAM
ENV TURBO_TEAM=$TURBO_TEAM

ARG TURBO_TOKEN
ENV TURBO_TOKEN=$TURBO_TOKEN

COPY . .

# Install nodejs and clang dependencies.
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
RUN apt update && apt install -y git nodejs build-essential software-properties-common clang libclang-dev

# Figure out if dependencies have changed.
RUN cargo chef prepare --recipe-path recipe.json && \
      npm install -g turbo@1.10.11 pnpm@8.6.9 solc@0.8.18 && \
      turbo run prisma

FROM chef AS builder
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
# COPY --from=builder /app/target/release/record-eth-price /usr/local/bin
# COPY --from=builder /app/target/release/serve /usr/local/bin
# COPY --from=builder /app/target/release/sync-beacon-states /usr/local/bin
# COPY --from=builder /app/target/release/sync-execution-blocks /usr/local/bin
# COPY --from=builder /app/target/release/sync-execution-supply-deltas /usr/local/bin
# COPY --from=builder /app/target/release/update-effective-balance-sum /usr/local/bin
# COPY --from=builder /app/target/release/update-issuance-breakdown /usr/local/bin
# COPY --from=builder /app/target/release/update-issuance-estimate /usr/local/bin
# COPY --from=builder /app/target/release/update-supply-projection-inputs /usr/local/bin
# COPY --from=builder /app/target/release/update-validator-rewards /usr/local/bin

EXPOSE 3002
ENTRYPOINT ["/usr/local/bin/lightdotso-bin"]
