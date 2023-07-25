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


# Read the value of DATABASE_URL from .env
DATABASE_URL=$(grep -i "DATABASE_URL" .env | cut -d '=' -f2-)

if [ -z "$DATABASE_URL" ]; then
  echo "DATABASE_URL is not defined in .env"
  exit 1
fi

# Set DIRECT_DATABASE_URL in .env
echo "DIRECT_DATABASE_URL=$DATABASE_URL" >> .env

echo "DIRECT_DATABASE_URL has been set in .env"
