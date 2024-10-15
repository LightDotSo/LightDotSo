#!/bin/bash

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

# Function to process schema file
process_schema() {
    input_file=$1
    output_file=$2
    generator_config=$3
    is_postgres=$4

    # Copy the input file to the output file
    cp -f "$input_file" "$output_file"

    # Remove the first 4 lines from the output file
    tail -n +5 "$output_file" > "${output_file}.tmp" && mv "${output_file}.tmp" "$output_file"

    # Add generator configuration to the top of the output file
    echo -e "${generator_config}\n$(cat "$output_file")" > "$output_file"

    # Remove the zod-prisma and kysely generator configurations
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i "" -e '/^generator zod {/,/^}/d' "$output_file"
        sed -i "" -e '/^generator kysely {/,/^}/d' "$output_file"
        # Remove extra newlines before datasource db
        sed -i "" -e '/^$/N;/^\n$/D' "$output_file"
        # Remove relationMode = "prisma" line
        sed -i "" '/relationMode = "prisma"/d' "$output_file"
    else
        sed -i -e '/^generator zod {/,/^}/d' "$output_file"
        sed -i -e '/^generator kysely {/,/^}/d' "$output_file"
        # Remove extra newlines before datasource db
        sed -i -e '/^$/N;/^\n$/D' "$output_file"
        # Remove relationMode = "prisma" line
        sed -i '/relationMode = "prisma"/d' "$output_file"
    fi

    if [ "$is_postgres" = true ] ; then
        # Update the datasource for PostgreSQL
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i "" 's/provider *= *"mysql"/provider = "postgresql"/' "$output_file"
            sed -i "" 's/url *= *env("DATABASE_URL")/url      = env("POSTGRES_URL")/' "$output_file"
            sed -i "" -E 's/BigInt(\??)([ \t]+@db\.UnsignedBigInt|[ \t]+@id)?/Decimal\1\2/g' "$output_file"
            sed -i "" -E 's/@db\.(UnsignedBigInt|UnsignedDecimal)//g' "$output_file"
        else
            sed -i 's/provider *= *"mysql"/provider = "postgresql"/' "$output_file"
            sed -i 's/url *= *env("DATABASE_URL")/url      = env("POSTGRES_URL")/' "$output_file"
            sed -i -E 's/BigInt(\??)([ \t]+@db\.UnsignedBigInt|[ \t]+@id)?/Decimal\1\2/g' "$output_file"
            sed -i -E 's/@db\.(UnsignedBigInt|UnsignedDecimal)//g' "$output_file"
        fi
    fi
}

# Process schema-rs.prisma
rs_generator_config="generator prisma {
  provider        = \"cargo prisma\"
  output          = \"../../../crates/prisma/src/lib.rs\"
  previewFeatures = [\"fullTextSearch\"]
}"
process_schema "prisma/schema.prisma" "prisma/schema-rs.prisma" "$rs_generator_config" false

# Process schema-postgres.prisma
postgres_generator_config="generator client {
  provider        = \"prisma-client-js\"
  previewFeatures = [\"fullTextSearch\"]
}"
process_schema "prisma/schema.prisma" "prisma/schema-postgres.prisma" "$postgres_generator_config" true
