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

FROM danielqsj/kafka-exporter:latest

ARG KAFKA_BROKER
ARG KAFKA_USERNAME
ARG KAFKA_PASSWORD

ENV KAFKA_BROKER=$KAFKA_BROKER
ENV KAFKA_USERNAME=$KAFKA_USERNAME
ENV KAFKA_PASSWORD=$KAFKA_PASSWORD

ENTRYPOINT []

CMD kafka_exporter --kafka.server=$KAFKA_BROKER --sasl.username=$KAFKA_USERNAME --sasl.password=$KAFKA_PASSWORD --sasl.enabled --sasl.handshake --sasl.mechanism=SCRAM-SHA256 --tls.insecure-skip-tls-verify --tls.enabled --log.enable-sarama
