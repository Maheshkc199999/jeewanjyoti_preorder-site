import re

# Read the file
with open(r'c:\jeewanjyoti-care\src\pages\Dashboard.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix 1: Add z-50 to mobile dropdown
content = content.replace(
    'rounded-xl border shadow-lg animate-in slide-in-from-top duration-200 ${darkMode\r\n                      ? \'bg-gray-700 border-gray-600\'\r\n                      : \'bg-white border-gray-200\'\r\n                    }`}>',
    'rounded-xl border shadow-lg animate-in slide-in-from-top duration-200 z-50 ${darkMode\r\n                      ? \'bg-gray-700 border-gray-600\'\r\n                      : \'bg-white border-gray-200\'\r\n                    }`}>'
)

# Fix 2: Update MY DATA button with better event handling
old_my_data_button = '''                      <button
                        onClick={() => {
                          setSelectedUserId(null);
                          setShowUserDropdown(false);
                          setSelectionFeedback('Loading your data...');
                          setTimeout(() => setSelectionFeedback(null), 2000);
                          setTimeout(() => setIsMobileMenuOpen(false), 500);
                        }}
                        className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] touch-manipulation ${'''

new_my_data_button = '''                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('[MOBILE] MY DATA clicked');
                          setSelectedUserId(null);
                          setShowUserDropdown(false);
                          setSelectionFeedback('Loading your data...');
                          setTimeout(() => setSelectionFeedback(null), 2000);
                          setTimeout(() => setIsMobileMenuOpen(false), 500);
                        }}
                        className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all duration-200 transform active:scale-95 touch-manipulation ${'''

content = content.replace(old_my_data_button, new_my_data_button)

# Fix 3: Add pointer-events-none to MY DATA button children
content = content.replace(
    'className="w-8 h-8 rounded-full object-cover flex-shrink-0 ring-2 ring-gray-300"\r\n                          onError={(e) => {\r\n                            e.target.src = \'https://via.placeholder.com/32?text=\' + (backendUser?.first_name?.charAt(0) || \'U\');\r\n                          }}\r\n                        />\r\n                        <div className="flex-1 text-left">',
    'className="w-8 h-8 rounded-full object-cover flex-shrink-0 ring-2 ring-gray-300 pointer-events-none"\r\n                          onError={(e) => {\r\n                            e.target.src = \'https://via.placeholder.com/32?text=\' + (backendUser?.first_name?.charAt(0) || \'U\');\r\n                          }}\r\n                        />\r\n                        <div className="flex-1 text-left pointer-events-none">'
)

# Fix 4: Update mapped user buttons
old_mapped_button = '''                            <button
                              key={mapping.id}
                              onClick={() => {
                                console.log('Mobile user clicked:', mapping.mapped_user.id);
                                handleUserSelection(mapping.mapped_user.id);
                                // Delay menu closing to allow data to update
                                setTimeout(() => setIsMobileMenuOpen(false), 500);
                              }}
                              className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] touch-manipulation ${selectedUserId === mapping.mapped_user.id'''

new_mapped_button = '''                            <button
                              key={mapping.id}
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('[MOBILE] Mapped user clicked:', mapping.mapped_user.id, mapping.nickname || mapping.mapped_user.full_name);
                                handleUserSelection(mapping.mapped_user.id);
                                // Delay menu closing to allow data to update
                                setTimeout(() => setIsMobileMenuOpen(false), 500);
                              }}
                              className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all duration-200 transform active:scale-95 touch-manipulation ${selectedUserId === mapping.mapped_user.id'''

content = content.replace(old_mapped_button, new_mapped_button)

# Fix 5: Add pointer-events-none to mapped user button children  
content = content.replace(
    'className="w-8 h-8 rounded-full object-cover flex-shrink-0 ring-2 ring-gray-300"\r\n                                onError={(e) => {\r\n                                  e.target.src = \'https://via.placeholder.com/24?text=\' + mapping.mapped_user.full_name.charAt(0);\r\n                                }}\r\n                              />\r\n                              <div className="flex-1 text-left">',
    'className="w-8 h-8 rounded-full object-cover flex-shrink-0 ring-2 ring-gray-300 pointer-events-none"\r\n                                onError={(e) => {\r\n                                  e.target.src = \'https://via.placeholder.com/24?text=\' + mapping.mapped_user.full_name.charAt(0);\r\n                                }}\r\n                              />\r\n                              <div className="flex-1 text-left pointer-events-none">'
)

# Write back
with open(r'c:\jeewanjyoti-care\src\pages\Dashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Successfully updated mobile dropdown with:")
print("  - Added z-50 for proper layering")
print("  - Added type='button' to prevent form submission")
print("  - Added e.preventDefault() and e.stopPropagation()")
print("  - Added console logging for debugging")
print("  - Changed hover:scale to active:scale-95 for better mobile feedback")
print("  - Added pointer-events-none to child elements")
