import re

# Read the file
with open(r'c:\jeewanjyoti-care\src\pages\Dashboard.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find and replace the desktop CURRENT USER section with a clickable MY DATA button
old_desktop = r'''                    <div className=\{`p-3 border-b \$\{
                      darkMode \? 'border-gray-700' : 'border-gray-200'
                      \}`\}>
                      <p className=\{`text-xs font-medium \$\{darkMode \? 'text-gray-400' : 'text-gray-500'\}`\}>
                        CURRENT USER
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium">
                          \{backendUser\?\.first_name \|\| user\?\.displayName\?\.split\(' '\)\[0\] \|\| user\?\.email\?\.split\('@'\)\[0\] \|\| 'User'\}
                        </span>
                      </div>
                    </div>'''

new_desktop = '''                    <div className={`p-3 border-b ${
                      darkMode ? 'border-gray-700' : 'border-gray-200'
                      }`}>
                      <p className={`text-xs font-medium mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        MY DATA
                      </p>
                      <button
                        onClick={() => {
                          setSelectedUserId(null);
                          setShowUserDropdown(false);
                          setSelectionFeedback('Loading your data...');
                          setTimeout(() => setSelectionFeedback(null), 2000);
                        }}
                        className={`w-full flex items-center gap-2 p-2 rounded transition-colors ${
                          selectedUserId === null
                            ? darkMode
                              ? 'bg-gray-700 text-blue-400'
                              : 'bg-blue-50 text-blue-600'
                            : darkMode
                              ? 'hover:bg-gray-700 text-gray-300'
                              : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <User className="w-4 h-4" />
                        <div className="flex-1 text-left">
                          <div className="text-xs font-medium">
                            {backendUser?.first_name || user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'My Data'}
                          </div>
                          {selectedUserId === null && (
                            <div className="text-xs opacity-75">Currently viewing</div>
                          )}
                        </div>
                      </button>
                    </div>'''

content = re.sub(old_desktop, new_desktop, content, flags=re.DOTALL)

# Write back
with open(r'c:\jeewanjyoti-care\src\pages\Dashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Desktop dropdown fixed!")
