import sys

# Read the file
with open(r'c:\jeewanjyoti-care\src\pages\Dashboard.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find line 880 (after the opening div of the dropdown)
# We need to insert the MY DATA section before line 881

my_data_section = '''                    {/* Current User Option */}
                    <div className={`p-3 ${mappedUsers.length > 0 ? `border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'}` : ''}`}>
                      <p className={`text-xs font-bold mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        MY DATA
                      </p>
                      <button
                        onClick={() => {
                          setSelectedUserId(null);
                          setShowUserDropdown(false);
                          setSelectionFeedback('Loading your data...');
                          setTimeout(() => setSelectionFeedback(null), 2000);
                          setTimeout(() => setIsMobileMenuOpen(false), 500);
                        }}
                        className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] touch-manipulation ${
                          selectedUserId === null
                            ? darkMode
                              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                              : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                            : darkMode
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <img
                          src={backendUser?.profile_image || user?.photoURL || 'https://via.placeholder.com/32'}
                          alt={backendUser?.first_name || 'User'}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0 ring-2 ring-gray-300"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/32?text=' + (backendUser?.first_name?.charAt(0) || 'U');
                          }}
                        />
                        <div className="flex-1 text-left">
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

# Insert after line 880 (index 880, which is line 881 in 1-indexed)
lines.insert(880, my_data_section)

# Write back
with open(r'c:\jeewanjyoti-care\src\pages\Dashboard.jsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("Successfully added MY DATA section to mobile dropdown!")
