# Copyright 2023-2024 Light
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

FROM danielqsj/kafka-exporter:latest

ARG KAFKA_BROKER
ARG KAFKA_USERNAME
ARG KAFKA_PASSWORD

ENV KAFKA_BROKER=$KAFKA_BROKER
ENV KAFKA_USERNAME=$KAFKA_USERNAME
ENV KAFKA_PASSWORD=$KAFKA_PASSWORD

ENTRYPOINT []

CMD kafka_exporter --kafka.server=$KAFKA_BROKER --sasl.username=$KAFKA_USERNAME --sasl.password=$KAFKA_PASSWORD --sasl.enabled --sasl.handshake --sasl.mechanism=SCRAM-SHA256 --tls.insecure-skip-tls-verify --tls.enabled --log.enable-sarama
