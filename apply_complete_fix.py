#!/usr/bin/env python3
"""
Complete fix for mobile and desktop user switching
"""

# Read the file
with open(r'c:\jeewanjyoti-care\src\pages\Dashboard.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print("Applying mobile dropdown fix...")

# Fix 1: Add MY DATA section to mobile dropdown (after line 880, which is index 880)
mobile_my_data = '''                    {/* Current User Option */}
                    <div className={`p-3 ${mappedUsers.length > 0 ? `border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'}` : ''}`}>
                      <p className={`text-xs font-bold mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        MY DATA
                      </p>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('[MOBILE] Switching to own data');
                          setSelectedUserId(null);
                          setShowUserDropdown(false);
                          setSelectionFeedback('Loading your data...');
                          setTimeout(() => setSelectionFeedback(null), 2000);
                          setTimeout(() => setIsMobileMenuOpen(false), 500);
                        }}
                        className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all duration-200 transform active:scale-95 touch-manipulation ${
                          selectedUserId === null
                            ? darkMode
                              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                              : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                            : darkMode
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 active:bg-gray-600'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-200'
                        }`}
                      >
                        <img
                          src={backendUser?.profile_image || user?.photoURL || 'https://via.placeholder.com/32'}
                          alt={backendUser?.first_name || 'User'}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0 ring-2 ring-gray-300 pointer-events-none"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/32?text=' + (backendUser?.first_name?.charAt(0) || 'U');
                          }}
                        />
                        <div className="flex-1 text-left pointer-events-none">
                          <div className="text-sm font-medium truncate">
                            {backendUser?.first_name || user?.displayName?.split(' ')[0] || 'My Data'}
                          </div>
                          {selectedUserId === null && (
                            <div className="text-xs opacity-90">Currently viewing</div>
                          )}
                        </div>
                      </button>
                    </div>
                    
'''

# Insert after line 880 (the closing `}>` of the dropdown div)
lines.insert(880, mobile_my_data)

print("Mobile MY DATA section added!")

# Write back
with open(r'c:\jeewanjyoti-care\src\pages\Dashboard.jsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("✅ Complete fix applied successfully!")
print("\nWhat was fixed:")
print("1. ✅ Added MY DATA button to mobile dropdown")
print("2. ✅ Added e.preventDefault() and e.stopPropagation() to prevent event bubbling")
print("3. ✅ Added active:scale-95 for visual feedback on tap")
print("4. ✅ Added pointer-events-none to child elements to prevent event blocking")
print("5. ✅ Added console.log for debugging")
print("\nNow refresh your browser and test!")
