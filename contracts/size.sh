#!/usr/bin/env bash
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


# Create a new file to hold all of the storage layouts
OUTPUT_FILE=.contracts-size

# Build the contracts and output the storage layouts
forge build --sizes > $OUTPUT_FILE

# Remove the first and last lines of the output
sed -i "" -e '2,$!d' -e '$d' $OUTPUT_FILE
