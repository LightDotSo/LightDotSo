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

FROM --platform=linux/x86_64 ubuntu:22.04

ARG DEBIAN_FRONTEND=noninteractive

ENV ARGS=""

RUN apt update \
  && apt install -y sudo curl postgresql postgresql-contrib

RUN curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - \
  && sudo apt-get install -y nodejs

RUN curl -OL https://github.com/LimeChain/matchstick/releases/download/0.5.0/binary-linux-22 \
  && chmod a+x binary-linux-22

RUN mkdir matchstick
WORKDIR /matchstick

# Commenting out for now as it seems there's no need to copy when using bind mount
# COPY ./ .

CMD ../binary-linux-22 ${ARGS}
