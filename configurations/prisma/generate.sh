#!/bin/bash
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


# Copying prisma/schema.prisma to prisma/schema-rs.prisma
cp -f prisma/schema.prisma prisma/schema-rs.prisma

# Removing the first 9 lines from prisma/schema-rs.prisma
tail -n +5 prisma/schema-rs.prisma > prisma/schema-rs-updated.prisma && mv prisma/schema-rs-updated.prisma prisma/schema-rs.prisma

# Adding generator configuration to the top of prisma/schema-rs.prisma
echo -e "generator prisma {\n  provider        = \"cargo prisma\"\n  output          = \"../../../crates/prisma/src/lib.rs\"\n  previewFeatures = [\"fullTextSearch\"]\n}\n$(cat prisma/schema-rs.prisma)" > prisma/schema-rs.prisma

# Remove the zod-prisma generator configuration from prisma/schema-rs.prisma
if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i "" -e '7,18d' prisma/schema-rs.prisma
    sed -i "" -e '10d' prisma/schema-rs.prisma
else
    sed -i -e '7,18d' prisma/schema-rs.prisma
    sed -i -e '10d' prisma/schema-rs.prisma
fi
