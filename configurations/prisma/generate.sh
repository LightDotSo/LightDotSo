#!/bin/bash

# Copyright 2023-2024 Light, Inc.
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


# Copying prisma/schema.prisma to prisma/schema-rs.prisma
cp -f prisma/schema.prisma prisma/schema-rs.prisma

# Removing the first 9 lines from prisma/schema-rs.prisma
tail -n +5 prisma/schema-rs.prisma > prisma/schema-rs-updated.prisma && mv prisma/schema-rs-updated.prisma prisma/schema-rs.prisma

# Adding generator configuration to the top of prisma/schema-rs.prisma
echo -e "generator prisma {\n  provider        = \"cargo prisma\"\n  output          = \"../../../crates/prisma/src/lib.rs\"\n  previewFeatures = [\"fullTextSearch\"]\n}\n$(cat prisma/schema-rs.prisma)" > prisma/schema-rs.prisma

# Remove the zod-prisma generator configuration from prisma/schema-rs.prisma
if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i "" -e '7,25d' prisma/schema-rs.prisma
    sed -i "" -e '10d' prisma/schema-rs.prisma
else
    sed -i -e '7,25d' prisma/schema-rs.prisma
    sed -i -e '10d' prisma/schema-rs.prisma
fi
