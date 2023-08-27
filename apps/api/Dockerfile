# Copyright (C) 2023 Light, Inc.
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.

# Dockerfile heavily inspired by https://github.com/supabase/supabase/blob/6fc14dd7d3050e733fc91414526a6d2e7fc3c919/studio/Dockerfile
# License: MIT License

FROM node:18-slim AS base

ARG INNGEST_SIGNING_KEY
ARG TARGETARCH
ARG TURBO_TEAM
ARG TURBO_TOKEN

ENV INNGEST_SIGNING_KEY=${INNGEST_SIGNING_KEY}
ENV TURBO_TEAM=${TURBO_TEAM}
ENV TURBO_TOKEN=${TURBO_TOKEN}

# Fixes issues with Sentry CLI and SSL certificates during build
RUN apt-get update -qq && \
    apt-get install -y ca-certificates && \
    rm -rf /var/lib/apt/lists/* && \
    update-ca-certificates

# Build the prisma dep.
RUN npm install -g turbo@1.10.11 pnpm@8.6.9

WORKDIR /app

# Builder
FROM base as turbo

# Copy over dir.
COPY . .
RUN turbo prune --scope=@lightdotso/api --docker

# Dependencies Stage
FROM base AS dependencies

COPY --from=turbo /app/out/json ./
COPY --from=turbo /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

# Install additional dependencies for arm64 build (required by bufferutil)
RUN if [ "$TARGETARCH" = "arm64" ]; then \
    apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    build-essential \
    && rm -rf /var/lib/apt/lists/*; fi

RUN pnpm install

# dev contains dependencies and source code not compiled
FROM dependencies as dev

RUN ls
COPY --from=turbo /app/out/full ./
COPY turbo.json turbo.json

FROM dev as builder

RUN pnpm turbo run build --filter @lightdotso/api  --include-dependencies --no-deps

# Runner Stage
FROM dependencies AS runner

COPY --from=builder /app/api/public ./api/public
COPY --from=builder /app/api/.next/standalone/app ./
COPY --from=builder /app/api/.next/static ./api/.next/static
EXPOSE 3000

CMD ["node", "api/server.js"]
