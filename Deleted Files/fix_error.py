#!/usr/bin/env python3
# -*- coding: utf-8 -*-

with open('App.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Remove line 1371 (index 1370) that has the currentPage error
new_lines = []
for i, line in enumerate(lines):
    if 'currentPage' in line and i == 1370:
        continue  # Skip this line
    new_lines.append(line)

with open('App.tsx', 'w', encoding='utf-8', newline='') as f:
    f.writelines(new_lines)

print('✅ Fixed currentPage error by removing line 1371')
