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


filename="src/v1.d.ts"
temp_filename="src/temp.d.ts"

while IFS= read -r line
do
    # If line starts with 'type'
    if [[ $line == type* ]]
    then
        # Prepend 'export' to the line and echo it
        echo "export $line"
    else
        # Print the line as is
        echo "$line"
    fi
done < "$filename" > "$temp_filename"

# Move the temp file back to original
mv "$temp_filename" "$filename"
