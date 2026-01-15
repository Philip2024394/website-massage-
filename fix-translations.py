#!/usr/bin/env python3
import re

files_to_fix = [
    'C:\\Users\\Victus\\Downloads\\website-massage-\\App.tsx',
    'C:\\Users\\Victus\\Downloads\\website-massage-\\pages\\HomePage.tsx'
]

fixes = [
    # Fix 1: App.tsx import
    (r'from "./utils/translations"', 'from "./lib/useTranslations"'),
    # Fix 2: HomePage t?.home?.therapistsTitle
    (r'\{t\?\.home\?\.therapistsTitle \|\|', '{translationsObject?.home?.therapistsTitle ||'),
    # Fix 3: HomePage t?.home?.therapistsSubtitleAll
    (r't\?\.home\?\.therapistsSubtitleAll \|\|', 'translationsObject?.home?.therapistsSubtitleAll ||'),
    # Fix 4: HomePage t?.home?.therapistsSubtitleCity
    (r't\?\.home\?\.therapistsSubtitleCity\?\.replace', 'translationsObject?.home?.therapistsSubtitleCity?.replace'),
    # Fix 5: HomePage t?.home?.browseRegionNote
    (r'\{t\?\.home\?\.browseRegionNote \|\|', '{translationsObject?.home?.browseRegionNote ||'),
    # Fix 6: HomePage t?.home?.facial
    (r'\{t\?\.home\?\.facial \|\|', '{translationsObject?.home?.facial ||'),
    # Fix 7: HomePage t?.home?.massagePlacesTitle
    (r'\{t\?\.home\?\.massagePlacesTitle \|\|', '{translationsObject?.home?.massagePlacesTitle ||'),
    # Fix 8: HomePage massagePlacesSubtitle
    (r't\?\.home\?\.massagePlacesSubtitle\?', 'translationsObject?.home?.massagePlacesSubtitle?'),
]

for file_path in files_to_fix:
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        for pattern, replacement in fixes:
            content = re.sub(pattern, replacement, content)
        
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f'✅ Fixed: {file_path}')
        else:
            print(f'⏭️  No changes needed: {file_path}')
    except Exception as e:
        print(f'❌ Error fixing {file_path}: {e}')

print('\n🎉 Done!')
