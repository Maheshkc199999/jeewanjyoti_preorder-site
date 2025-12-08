#!/usr/bin/env python3
"""
Fix the mapped users buttons in mobile dropdown
"""
import re

# Read the file
with open(r'c:\jeewanjyoti-care\src\pages\Dashboard.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find and replace the mapped users button onClick handler
old_onclick = r"onClick=\(\) => \{\s+console\.log\('Mobile user clicked:', mapping\.mapped_user\.id\);\s+handleUserSelection\(mapping\.mapped_user\.id\);\s+// Delay menu closing to allow data to update\s+setTimeout\(\(\) => setIsMobileMenuOpen\(false\), 500\);\s+\}\}"

new_onclick = '''onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('[MOBILE] Mapped user clicked:', mapping.mapped_user.id, mapping.nickname);
                                console.log('[MOBILE] Current selectedUserId:', selectedUserId);
                                handleUserSelection(mapping.mapped_user.id);
                                // Delay menu closing to allow data to update
                                setTimeout(() => setIsMobileMenuOpen(false), 500);
                              }}'''

content = re.sub(old_onclick, new_onclick, content, flags=re.DOTALL)

# Also add pointer-events-none to img and div inside the button
content = re.sub(
    r'(className="w-8 h-8 rounded-full object-cover flex-shrink-0 ring-2 ring-gray-300")',
    r'\1 style={{pointerEvents: "none"}}',
    content
)

# Write back
with open(r'c:\jeewanjyoti-care\src\pages\Dashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Mapped users buttons fixed!")
print("Added:")
print("- e.preventDefault() and e.stopPropagation()")
print("- Better console logging")
print("- pointer-events-none to prevent child element clicks")
