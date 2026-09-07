#!/usr/bin/env python3
import os
import re
import shutil

# Root folder of your project
ROOT_DIR = "."

# Make a backup folder
BACKUP_DIR = os.path.join(ROOT_DIR, "_backup_links")
os.makedirs(BACKUP_DIR, exist_ok=True)

# Regex patterns
MARKDOWN_LINK_RE = re.compile(r'\[([^\]]+)\]\(/([^\)]+)\)')
PLAIN_LINK_RE = re.compile(r'\(/([^\)]+)\)')

def backup_file(file_path):
    """Copy original file to backup folder"""
    rel_path = os.path.relpath(file_path, ROOT_DIR)
    backup_path = os.path.join(BACKUP_DIR, rel_path)
    os.makedirs(os.path.dirname(backup_path), exist_ok=True)
    shutil.copy2(file_path, backup_path)

def process_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # Replace Markdown links
    content = MARKDOWN_LINK_RE.sub(r'[\1]({{ "/\2" | relative_url }})', content)

    # Replace plain links
    content = PLAIN_LINK_RE.sub(r'{{ "/\1" | relative_url }}', content)

    if content != original_content:
        backup_file(file_path)
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated: {file_path}")
    else:
        print(f"No changes: {file_path}")

def main():
    for dirpath, _, filenames in os.walk(ROOT_DIR):
        # Skip backup folder and _site
        if "_backup_links" in dirpath or "_site" in dirpath:
            continue
        for filename in filenames:
            if filename.endswith(".md"):
                process_file(os.path.join(dirpath, filename))

if __name__ == "__main__":
    main()
