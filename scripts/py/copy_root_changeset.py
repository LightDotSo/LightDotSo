import re
import os
import sys

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
        section = '\n## Major changes\n'
    elif version_bump == 'minor':
        section = '\n## Minor changes\n'
    elif version_bump == 'patch':
        section = '\n## Patch changes\n'
    else:
        print('Invalid version bump: {}'.format(version_bump))
        return
    update_changelog(target_file, section, description)

def update_changelog(changelog_file, section, description):
    with open(changelog_file, 'r') as f:
        lines = f.readlines()
    unreleased_index = next(i for i, line in enumerate(lines) if line.startswith("## [Unreleased]"))
    next_section_index = next((i for i, line in enumerate(lines[unreleased_index+1:], start=unreleased_index+1) if line.startswith("##")), len(lines))
    if section not in lines[unreleased_index:next_section_index]:
        lines.insert(next_section_index, '\n{}\n{}\n'.format(section, description))
    with open(changelog_file, 'w') as f:
        f.write(''.join(lines))

if __name__ == "__main__":
    for filename in sys.argv[1:]:
        process_file(filename)
