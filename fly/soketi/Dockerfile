# Copyright 2023-2024 LightDotSo.
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

FROM quay.io/soketi/soketi:1.4-16-debian

ARG SOKETI_DEFAULT_APP_ID
ARG SOKETI_DEFAULT_APP_KEY
ARG SOKETI_DEFAULT_APP_SECRET

ENV SOKETI_DEFAULT_APP_ID=${SOKETI_DEFAULT_APP_ID}
ENV SOKETI_DEFAULT_APP_KEY=${SOKETI_DEFAULT_APP_KEY}
ENV SOKETI_DEFAULT_APP_SECRET='PUSHER_SECRET'

ENV SOKETI_DEBUG=1
ENV SOKETI_METRICS_ENABLED=1
ENV PORT=6001
ENV MODE=worker
