import re
import os
import sys

def update_changelog(changelog_file, new_section, new_description):
    with open(changelog_file, 'r') as f:
        lines = f.readlines()

    unreleased_index = next(i for i, line in enumerate(lines) if line.startswith("## [Unreleased]"))
    next_section_index = next((i for i, line in enumerate(lines[unreleased_index+1:], start=unreleased_index+1) if line.startswith("##")), len(lines))

    section_indices = [i + unreleased_index for i, line in enumerate(lines[unreleased_index:next_section_index]) if line.strip() == new_section]
    if section_indices:
        lines[section_indices[-1]] += new_description + '\n'
    else:
        lines.insert(next_section_index, f'\n{new_section}\n{new_description}\n')

    with open(changelog_file, 'w') as f:
        f.write(''.join(lines))


def process_file(input_file, target_file="CHANGELOG.md"):
    version_bump = ""
    with open(input_file, 'r') as f:
        content = f.read()
        match = re.search(r'major|minor|patch', content)
        if match:
            version_bump = match.group()
        description = content.split('\n', 4)[-1]
    section = None
    if version_bump == 'major':
        section = '## Major changes'
    elif version_bump == 'minor':
        section = '## Minor changes'
    elif version_bump == 'patch':
        section = '## Patch changes'
    else:
        print(f'Invalid version bump: {version_bump}')

    update_changelog(target_file, section, description)

if __name__ == "__main__":
    for filename in sys.argv[1:]:
        process_file(filename)
