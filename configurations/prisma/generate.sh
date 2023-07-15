#!/bin/bash

# Copying prisma/schema.prisma to prisma/schema-rs.prisma
cp -f prisma/schema.prisma prisma/schema-rs.prisma

# Removing the first 9 lines from prisma/schema-rs.prisma
tail -n +5 prisma/schema-rs.prisma > prisma/schema-rs-updated.prisma && mv prisma/schema-rs-updated.prisma prisma/schema-rs.prisma

# Adding generator configuration to the top of prisma/schema-rs.prisma
echo -e "generator prisma {\n\tprovider      = \"cargo prisma\"\n\toutput        = \"../../crates/prisma/src/lib.rs\"\n}\n$(cat prisma/schema-rs.prisma)" > prisma/schema-rs.prisma
