#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import re

with open('App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the problematic debug line
content = re.sub(r"\s*console\.log\('🔥 Current page:', currentPage\);", "", content)

with open('App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('✅ Fixed: Removed currentPage debug line')
