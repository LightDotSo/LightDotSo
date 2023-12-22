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

FROM quay.io/soketi/soketi:1.0-16-debian

ARG SOKETI_DEFAULT_APP_ID
ARG SOKETI_DEFAULT_APP_KEY
ARG SOKETI_DEFAULT_APP_SECRET

ENV SOKETI_DEFAULT_APP_ID=${SOKETI_DEFAULT_APP_ID}
ENV SOKETI_DEFAULT_APP_KEY=${SOKETI_DEFAULT_APP_KEY}
ENV SOKETI_DEFAULT_APP_SECRET=${SOKETI_DEFAULT_APP_SECRET}

ENV SOKETI_DEBUG=1
ENV SOKETI_METRICS_ENABLED=1
ENV PORT=6001
ENV MODE=worker
