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

# From: https://github.com/risedle/monorepo/blob/cd0c87127ad81e613e732d7e1a68a0869b03a54a/apps/graph-node/Dockerfile

FROM graphprotocol/graph-node:v0.32.0

RUN apt update -y && apt install nginx -y

# COPY nginx/default /etc/nginx/sites-available/default
COPY nginx/graphiql /etc/nginx/sites-enabled/graphiql
COPY nginx/admin /etc/nginx/sites-enabled/admin
COPY nginx/metrics /etc/nginx/sites-enabled/metrics
COPY nginx/index_node /etc/nginx/sites-enabled/index_node

EXPOSE 80/tcp

COPY run-node .
CMD ["./run-node"]
