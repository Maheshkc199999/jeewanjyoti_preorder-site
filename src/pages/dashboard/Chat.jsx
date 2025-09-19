import React, { useState, useRef, useEffect } from 'react';
import { 
  Bell, Send, Paperclip, Mic, Video, Phone, X, Smile, Image, 
  File, Download, Search, MoreHorizontal, Circle, ArrowLeft
} from 'lucide-react';

// Mock EmojiPicker component since it's not available
const EmojiPicker = ({ onEmojiClick, theme, height, width }) => {
  const emojis = ['😀', '😂', '😍', '🤔', '👍', '❤️', '🎉', '🔥', '👋', '💯'];
  
  return (
    <div className={`p-3 rounded-lg shadow-lg border ${
      theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
    }`} style={{ width: width || 280, height: height || 200 }}>
      <div className="grid grid-cols-5 gap-2">
        {emojis.map((emoji, index) => (
          <button
            key={index}
            onClick={() => onEmojiClick({ emoji })}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-xl"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};

const ChatTab = ({ darkMode = false }) => {
  const [selectedChat, setSelectedChat] = useState('dr-smith');
  const [searchQuery, setSearchQuery] = useState('');
  const [showChatRoom, setShowChatRoom] = useState(false);
  
  const [chatUsers] = useState([
    {
      id: 'dr-smith',
      name: 'Dr. Sarah Smith',
      role: 'Cardiologist',
      avatar: 'SS',
      lastMessage: 'Your latest test results look great!',
      time: '2:30 PM',
      unread: 3,
      online: true,
      messages: [
        { 
          id: 1, 
          sender: 'Dr. Smith', 
          message: 'Your latest test results look great! Keep up the good work with your exercise routine.', 
          time: '2:30 PM', 
          type: 'received',
          avatar: 'SS'
        },
        { 
          id: 2, 
          sender: 'You', 
          message: 'Thank you! Should I continue with the same medication dosage?', 
          time: '2:45 PM', 
          type: 'sent'
        },
        { 
          id: 3, 
          sender: 'Dr. Smith', 
          message: 'Yes, continue with the current dosage. Let\'s schedule a follow-up in 2 weeks.', 
          time: '3:00 PM', 
          type: 'received',
          avatar: 'SS'
        },
        {
          id: 4,
          sender: 'Dr. Smith',
          message: 'Here are the documents I mentioned during our last visit.',
          time: '3:15 PM',
          type: 'received',
          avatar: 'SS',
          files: [
            { name: 'Test_Results.pdf', size: '2.4 MB', type: 'pdf' },
            { name: 'Exercise_Plan.pdf', size: '1.8 MB', type: 'pdf' }
          ]
        }
      ]
    },
    {
      id: 'dr-johnson',
      name: 'Dr. Michael Johnson',
      role: 'General Physician',
      avatar: 'MJ',
      lastMessage: 'How are you feeling today?',
      time: '1:15 PM',
      unread: 1,
      online: true,
      messages: [
        { 
          id: 1, 
          sender: 'Dr. Johnson', 
          message: 'How are you feeling today? Any symptoms to report?', 
          time: '1:15 PM', 
          type: 'received',
          avatar: 'MJ'
        },
        { 
          id: 2, 
          sender: 'You', 
          message: 'I\'m feeling much better, thank you!', 
          time: '1:20 PM', 
          type: 'sent'
        }
      ]
    },
    {
      id: 'dr-wilson',
      name: 'Dr. Emily Wilson',
      role: 'Dermatologist',
      avatar: 'EW',
      lastMessage: 'Your skin condition is improving well.',
      time: '11:30 AM',
      unread: 0,
      online: false,
      messages: [
        { 
          id: 1, 
          sender: 'Dr. Wilson', 
          message: 'Your skin condition is improving well. Continue with the prescribed cream.', 
          time: '11:30 AM', 
          type: 'received',
          avatar: 'EW'
        }
      ]
    },
    {
      id: 'nurse-patel',
      name: 'Nurse Priya Patel',
      role: 'Nurse',
      avatar: 'PP',
      lastMessage: 'Your appointment is confirmed for tomorrow.',
      time: '10:45 AM',
      unread: 0,
      online: true,
      messages: [
        { 
          id: 1, 
          sender: 'Nurse Patel', 
          message: 'Your appointment is confirmed for tomorrow at 2 PM.', 
          time: '10:45 AM', 
          type: 'received',
          avatar: 'PP'
        }
      ]
    }
  ]);

  const currentChat = chatUsers.find(chat => chat.id === selectedChat);
  const [messages, setMessages] = useState(currentChat?.messages || []);
  
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [callStatus, setCallStatus] = useState(null);
  const [callType, setCallType] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Update messages when chat changes
  useEffect(() => {
    const chat = chatUsers.find(chat => chat.id === selectedChat);
    setMessages(chat?.messages || []);
  }, [selectedChat, chatUsers]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = () => {
    if (newMessage.trim() || selectedFile) {
      const message = {
        id: messages.length + 1,
        sender: 'You',
        message: newMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'sent'
      };

      if (selectedFile) {
        message.files = [{
          name: selectedFile.name,
          size: `${(selectedFile.size / 1024 / 1024).toFixed(1)} MB`,
          type: selectedFile.type.split('/')[1] || 'file'
        }];
      }

      setMessages([...messages, message]);
      setNewMessage('');
      setSelectedFile(null);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEmojiClick = (emojiData) => {
    setNewMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setTimeout(() => document.querySelector('input[type="text"]')?.focus(), 100);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
  };

  const startCall = (type) => {
    setCallType(type);
    setCallStatus('calling');
    
    setTimeout(() => {
      setCallStatus('in-progress');
    }, 5000);
  };

  const endCall = () => {
    setCallStatus(null);
    setCallType(null);
  };

  const renderFileIcon = (type) => {
    switch(type) {
      case 'pdf': return <File className="w-4 h-4 text-red-500" />;
      case 'doc': case 'docx': return <File className="w-4 h-4 text-blue-500" />;
      case 'xls': case 'xlsx': return <File className="w-4 h-4 text-green-500" />;
      case 'jpg': case 'jpeg': case 'png': case 'gif': return <Image className="w-4 h-4 text-purple-500" />;
      default: return <File className="w-4 h-4 text-gray-500" />;
    }
  };

  const filteredChats = chatUsers.filter(chat => 
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle profile click for mobile
  const handleProfileClick = (chatId) => {
    setSelectedChat(chatId);
    setShowChatRoom(true);
  };

  // Handle back button for mobile
  const handleBackToList = () => {
    setShowChatRoom(false);
  };

  return (
    <div className="h-full flex overflow-hidden">
      {/* Mobile Layout */}
      <div className="md:hidden w-full h-full">
        {!showChatRoom ? (
          // Mobile: Profiles List View
          <div className={`w-full h-full flex flex-col ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            {/* Header */}
            <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-3`}>Messages</h2>
              
              {/* Search */}
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'border-gray-200'
                  }`}
                />
              </div>
            </div>

            {/* Mobile Chat List */}
            <div className="flex-1 overflow-y-auto">
              {filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => handleProfileClick(chat.id)}
                  className={`p-4 border-b cursor-pointer transition-colors ${
                    selectedChat === chat.id
                      ? darkMode 
                        ? 'bg-gray-700 border-gray-600' 
                        : 'bg-blue-50 border-blue-200'
                      : darkMode 
                        ? 'hover:bg-gray-700 border-gray-700' 
                        : 'hover:bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${
                        chat.id === 'dr-smith' ? 'bg-gradient-to-r from-blue-500 to-purple-500' :
                        chat.id === 'dr-johnson' ? 'bg-gradient-to-r from-green-500 to-teal-500' :
                        chat.id === 'dr-wilson' ? 'bg-gradient-to-r from-pink-500 to-rose-500' :
                        'bg-gradient-to-r from-orange-500 to-yellow-500'
                      }`}>
                        {chat.avatar}
                      </div>
                      {chat.online && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className={`font-semibold truncate ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                          {chat.name}
                        </h3>
                        <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {chat.time}
                        </span>
                      </div>
                      <p className={`text-sm truncate ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {chat.lastMessage}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          {chat.role}
                        </span>
                        {chat.unread > 0 && (
                          <div className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {chat.unread}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Mobile: Chat Room View
          <div className={`w-full h-full flex flex-col ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            {/* Mobile Chat Header with Back Button */}
            <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center gap-3`}>
              <button
                onClick={handleBackToList}
                className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
              >
                <ArrowLeft className="w-5 h-5 text-gray-500" />
              </button>
              <div className="flex items-center gap-3 flex-1">
                <div className="relative">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                    currentChat?.id === 'dr-smith' ? 'bg-gradient-to-r from-blue-500 to-purple-500' :
                    currentChat?.id === 'dr-johnson' ? 'bg-gradient-to-r from-green-500 to-teal-500' :
                    currentChat?.id === 'dr-wilson' ? 'bg-gradient-to-r from-pink-500 to-rose-500' :
                    'bg-gradient-to-r from-orange-500 to-yellow-500'
                  }`}>
                    {currentChat?.avatar}
                  </div>
                  {currentChat?.online && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-semibold truncate ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {currentChat?.name}
                  </h3>
                  <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {currentChat?.online ? 'Online' : 'Offline'} • {currentChat?.role}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => startCall('audio')}
                  className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} transition-colors`}
                  title="Audio Call"
                >
                  <Phone className="w-4 h-4 text-blue-500" />
                </button>
                <button 
                  onClick={() => startCall('video')}
                  className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} transition-colors`}
                  title="Video Call"
                >
                  <Video className="w-4 h-4 text-blue-500" />
                </button>
              </div>
            </div>

            {/* Mobile Messages */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.type === 'sent' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs px-4 py-2 rounded-2xl ${
                    message.type === 'sent' 
                      ? 'bg-blue-500 text-white' 
                      : darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {message.type === 'received' && (
                      <div className="text-xs font-semibold mb-1">{message.sender}</div>
                    )}
                    <p className="text-sm">{message.message}</p>
                    
                    {message.files && message.files.length > 0 && (
                      <div className={`mt-2 space-y-2 ${message.type === 'sent' ? 'bg-blue-400' : darkMode ? 'bg-gray-600' : 'bg-gray-200'} p-2 rounded-lg`}>
                        {message.files.map((file, index) => (
                          <div key={index} className="flex items-center gap-2 text-xs">
                            {renderFileIcon(file.type)}
                            <div className="flex-1 min-w-0">
                              <div className="truncate">{file.name}</div>
                              <div className="text-gray-500">{file.size}</div>
                            </div>
                            <button className="text-blue-500 hover:text-blue-600">
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className={`text-xs mt-1 ${message.type === 'sent' ? 'text-blue-100' : darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {message.time}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Mobile Message Input */}
            <div className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                >
                  <Smile className="w-5 h-5 text-gray-500" />
                </button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'border-gray-200'
                    }`}
                  />
                  {showEmojiPicker && (
                    <div className="absolute bottom-full left-0 mb-2 z-10">
                      <EmojiPicker
                        onEmojiClick={(emoji) => {
                          setNewMessage(prev => prev + emoji.emoji);
                          setShowEmojiPicker(false);
                        }}
                        theme={darkMode ? 'dark' : 'light'}
                        width={280}
                        height={350}
                      />
                    </div>
                  )}
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className={`p-2 rounded-lg transition-colors ${
                    newMessage.trim()
                      ? 'bg-blue-500 hover:bg-blue-600 text-white'
                      : darkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Desktop: Original Layout */}
      <div className="hidden md:flex w-full h-full">
        {/* Call Interface Overlay */}
        {callStatus && (
          <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-800'} bg-opacity-95 text-white p-6`}>
            <div className="flex flex-col items-center justify-center flex-1 w-full max-w-4xl">
              <div className="w-full h-64 md:h-96 bg-gray-700 rounded-lg mb-6 flex items-center justify-center relative overflow-hidden">
                {callStatus === 'calling' ? (
                  <div className="text-center">
                    <div className="text-2xl font-semibold mb-2">Calling {currentChat?.name}...</div>
                    <div className="text-lg text-gray-300">Please wait for the doctor to answer</div>
                    <div className="mt-8 animate-pulse">
                      <div className="w-24 h-24 mx-auto rounded-full bg-gray-600 flex items-center justify-center">
                        {callType === 'video' ? (
                          <Video className="w-12 h-12" />
                        ) : (
                          <Phone className="w-12 h-12" />
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-full h-full bg-gray-900"></div>
                    <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 rounded-lg p-2">
                      <div className="text-sm">{currentChat?.name}</div>
                    </div>
                  </>
                )}
              </div>
              
              {callType === 'video' && callStatus === 'in-progress' && (
                <div className="w-32 h-24 bg-gray-900 rounded-lg absolute bottom-24 right-6 border-2 border-white">
                  <div className="w-full h-full bg-gray-800"></div>
                </div>
              )}
              
              <div className="flex gap-6 mt-8">
                <button 
                  onClick={endCall}
                  className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center hover:bg-red-700 transition-colors"
                >
                  <Phone className="w-8 h-8 transform rotate-135" />
                </button>
                
                {callType === 'audio' && callStatus === 'in-progress' && (
                  <button className="w-16 h-16 rounded-full bg-gray-600 flex items-center justify-center hover:bg-gray-700 transition-colors">
                    <Mic className="w-8 h-8" />
                  </button>
                )}
              </div>
              
              <div className="mt-8 text-center">
                <div className="text-xl font-semibold">
                  {callStatus === 'calling' ? 'Calling...' : '00:05:23'}
                </div>
                <div className="text-gray-400 mt-2">
                  {callType === 'audio' ? 'Audio Call' : 'Video Call'} with {currentChat?.name}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chat Users List */}
        <div className={`w-80 border-r ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} flex flex-col h-full`}>
          {/* Header */}
          <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-3`}>Messages</h2>
            
            {/* Search */}
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'border-gray-200'
                }`}
              />
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => setSelectedChat(chat.id)}
                className={`p-4 border-b cursor-pointer transition-colors ${
                  selectedChat === chat.id
                    ? darkMode 
                      ? 'bg-gray-700 border-gray-600' 
                      : 'bg-blue-50 border-blue-200'
                    : darkMode 
                      ? 'border-gray-700 hover:bg-gray-700' 
                      : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      chat.id === 'dr-smith' ? 'bg-gradient-to-r from-blue-500 to-purple-500' :
                      chat.id === 'dr-johnson' ? 'bg-gradient-to-r from-green-500 to-teal-500' :
                      chat.id === 'dr-wilson' ? 'bg-gradient-to-r from-pink-500 to-rose-500' :
                      'bg-gradient-to-r from-orange-500 to-yellow-500'
                    }`}>
                      {chat.avatar}
                    </div>
                    {chat.online && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-gray-800'} truncate`}>
                        {chat.name}
                      </h3>
                      <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {chat.time}
                      </span>
                    </div>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} truncate`}>
                      {chat.role}
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} truncate mt-1`}>
                      {chat.lastMessage}
                    </p>
                  </div>
                  
                  {chat.unread > 0 && (
                    <div className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {chat.unread}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {currentChat ? (
            <>
              {/* Chat Header */}
              <div className={`p-4 border-b ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} flex-shrink-0`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      currentChat.id === 'dr-smith' ? 'bg-gradient-to-r from-blue-500 to-purple-500' :
                      currentChat.id === 'dr-johnson' ? 'bg-gradient-to-r from-green-500 to-teal-500' :
                      currentChat.id === 'dr-wilson' ? 'bg-gradient-to-r from-pink-500 to-rose-500' :
                      'bg-gradient-to-r from-orange-500 to-yellow-500'
                    }`}>
                      {currentChat.avatar}
                    </div>
                    <div>
                      <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        {currentChat.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${currentChat.online ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {currentChat.online ? 'Online' : 'Offline'} • {currentChat.role}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => startCall('audio')}
                      className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} transition-colors`}
                      title="Audio Call"
                    >
                      <Phone className="w-5 h-5 text-blue-500" />
                    </button>
                    <button 
                      onClick={() => startCall('video')}
                      className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} transition-colors`}
                      title="Video Call"
                    >
                      <Video className="w-5 h-5 text-blue-500" />
                    </button>
                    <button className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} transition-colors`}>
                      <MoreHorizontal className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 space-y-4 overflow-y-auto min-h-0 pb-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.type === 'sent' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                      message.type === 'sent' 
                        ? 'bg-blue-500 text-white' 
                        : darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {message.type === 'received' && (
                        <div className="text-xs font-semibold mb-1">{message.sender}</div>
                      )}
                      <p className="text-sm">{message.message}</p>
                      
                      {message.files && message.files.length > 0 && (
                        <div className={`mt-2 space-y-2 ${message.type === 'sent' ? 'bg-blue-400' : darkMode ? 'bg-gray-600' : 'bg-gray-200'} p-2 rounded-lg`}>
                          {message.files.map((file, index) => (
                            <div key={index} className="flex items-center gap-2 text-xs">
                              {renderFileIcon(file.type)}
                              <div className="flex-1 min-w-0">
                                <div className="truncate">{file.name}</div>
                                <div className="text-gray-500">{file.size}</div>
                              </div>
                              <button className={`p-1 rounded ${darkMode ? 'hover:bg-gray-500' : 'hover:bg-gray-300'}`}>
                                <Download className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <p className={`text-xs mt-1 text-right ${
                        message.type === 'sent' ? 'text-blue-100' : darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {message.time}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Selected file preview */}
              {selectedFile && (
                <div className={`mx-4 mb-2 p-2 rounded-lg flex items-center justify-between flex-shrink-0 ${
                  darkMode ? 'bg-gray-700' : 'bg-blue-50'
                }`}>
                  <div className="flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-gray-500" />
                    <span className="text-sm truncate max-w-xs">{selectedFile.name}</span>
                    <span className="text-xs text-gray-500">
                      ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <button 
                    onClick={removeSelectedFile}
                    className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Message Input */}
              <div className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex-shrink-0`}>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <button
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} transition-colors`}
                    >
                      <Smile className="w-5 h-5 text-gray-500" />
                    </button>
                    
                    {showEmojiPicker && (
                      <div className="absolute bottom-full left-0 mb-2 z-10">
                        <EmojiPicker 
                          onEmojiClick={handleEmojiClick}
                          theme={darkMode ? 'dark' : 'light'}
                          height={350}
                          width={300}
                        />
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} transition-colors`}
                  >
                    <Paperclip className="w-5 h-5 text-gray-500" />
                  </button>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className={`flex-1 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'border-gray-200'
                    }`}
                    onKeyPress={handleKeyPress}
                  />
                  
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() && !selectedFile}
                    className={`p-2 rounded-xl transition-colors ${
                      (!newMessage.trim() && !selectedFile) 
                        ? 'bg-gray-300 text-gray-500 dark:bg-gray-600' 
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center min-h-0">
              <div className="text-center">
                <div className={`text-6xl mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`}>💬</div>
                <h3 className={`text-xl font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Select a conversation to start chatting
                </h3>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatTab;