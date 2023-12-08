#!/bin/bash

target_file="CHANGELOG.md"

for input_file in "$@"
do
    echo "Processing file: ${input_file}"

    # Check for the version bump (major, minor, patch)
    version_bump=$(grep -E -o -m 1 'major|minor|patch' "${input_file}")

    echo "Version bump: ${version_bump}"

    # Extract the description of the change
    description=$(sed '1,4d' "${input_file}")

    echo "Description: ${description}"

    # Use printf to properly format newline characters in the description
    description=$(printf '%s' "$description")

    # Define the section based on version bump.
    case $version_bump in
      major)
        section="## Major changes"
        grep -q "${section}" ${target_file}  || echo -e "\n${section}\n" >> ${target_file}
        ;;
      minor)
        section="## Minor changes"
        grep -q "${section}" ${target_file}  || echo -e "\n${section}\n" >> ${target_file}
        ;;
      patch)
        section="## Patch changes"
        grep -q "${section}" ${target_file}  || echo -e "\n${section}\n" >> ${target_file}
        ;;
      *)
        echo "Invalid version bump: ${version_bump}"
        exit 1
    esac

    # Append the description under the correct section
    echo -e "/${section}/a\n Sorry for the previous incomplete response. Please find the completed version below:"

    echo -e "/${section}/a\n${description}\n.\nw\nq" | ed -s "${target_file}"
done
