import React, { useState, useRef, useEffect, useMemo } from 'react';
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

import { getAccessToken } from '../../lib/tokenManager';

const ChatTab = ({ darkMode = false, onChatRoomStateChange }) => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showChatRoom, setShowChatRoom] = useState(false);
  
  // Conversations from backend
  const [conversations, setConversations] = useState([]);
  const [wsError, setWsError] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef(null);
  const userDataRef = useRef(null);
  const chatWsRef = useRef(null);
  const [chatWsConnected, setChatWsConnected] = useState(false);

  // Derived chat users list for UI from conversations
  const chatUsers = useMemo(() => {
    return (conversations || []).map((c) => {
      const user = c.user || {};
      const name = [user.first_name, user.last_name].filter(Boolean).join(' ').trim() || `User ${user.id}`;
      const initials = `${(user.first_name || '').charAt(0)}${(user.last_name || '').charAt(0)}`.toUpperCase() || 'U';
      const lastMsg = c.last_message?.message || '';
      const time = c.last_message_time ? new Date(c.last_message_time).toLocaleString() : '';
      return {
        id: String(user.id),
        name,
        role: user.username || '',
        avatar: initials,
        photoUrl: user.profile_image || null,
        lastMessage: lastMsg,
        time,
        unread: c.unread_count || 0,
        online: user.status === 'online',
        messages: [],
      };
    });
  }, [conversations]);

  const currentChat = chatUsers.find(chat => chat.id === selectedChat);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [callStatus, setCallStatus] = useState(null);
  const [callType, setCallType] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Do not use any dummy messages on chat change
  useEffect(() => {
    setMessages([]);
  }, [selectedChat]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() && !selectedFile) return;
    const text = newMessage.trim();
    
    // Send via WebSocket without adding optimistic message
    // The message will be added when WebSocket confirms it
    try {
      if (chatWsRef.current && chatWsRef.current.readyState === WebSocket.OPEN) {
        chatWsRef.current.send(JSON.stringify({ type: 'text_message', message: text }));
      }
    } catch (e) {
      console.error('Failed to send WS message', e);
    }
    setNewMessage('');
    setSelectedFile(null);
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
    (chat.role || '').toLowerCase().includes(searchQuery.toLowerCase())
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

  // Notify parent component when chat room state changes
  useEffect(() => {
    if (onChatRoomStateChange) {
      onChatRoomStateChange(showChatRoom);
    }
  }, [showChatRoom, onChatRoomStateChange]);

  // Initialize userData
  useEffect(() => {
    try {
      userDataRef.current = JSON.parse(localStorage.getItem('user_data') || '{}');
    } catch {
      userDataRef.current = {};
    }
  }, []);

  // Fetch conversation history via HTTP - FIXED MESSAGE ALIGNMENT
  const fetchHistory = async (userId) => {
    if (!userId) return;
    setLoadingMessages(true);
    try {
      const token = getAccessToken();
      const response = await fetch(`https://jeewanjyoti-backend.smart.org.np/api/history/${userId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      if (!response.ok) {
        throw new Error(`Failed to load messages: ${response.status}`);
      }
      const data = await response.json();
      const myUserId = Number(data.me || userDataRef.current?.id);  // ← CHANGED: use data.me
      const nameForPartner = currentChat?.name || 'User';
      const arr = Array.isArray(data.chat) ? data.chat : [];  // ← CHANGED: use data.chat
  
      // Sort by timestamp ascending
      arr.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  
      const mapped = arr.map((m) => {
        const isSentByMe = Number(m.sender) === myUserId;
        return {
          id: m.id,
          sender: isSentByMe ? 'You' : nameForPartner,
          message: m.message || '',
          time: m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
          type: isSentByMe ? 'sent' : 'received',  // This determines alignment
          files: m.has_media ? (m.file || m.image ? [{ name: m.file || 'image', type: (m.image ? 'image' : 'file') }] : []) : undefined,
        };
      });
      setMessages(mapped);
    } catch (e) {
      console.error('History fetch failed', e);
    } finally {
      setLoadingMessages(false);
    }
  };

  // WebSocket: connect and listen - FIXED MESSAGE ALIGNMENT
  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;
    const wsUrl = `wss://jeewanjyoti-backend.smart.org.np/ws/conversations/?token=${token}`;
    let socket;
    try {
      socket = new WebSocket(wsUrl);
    } catch (e) {
      setWsError('Failed to initialize WebSocket');
      return;
    }

    socket.onopen = () => {
      setWsConnected(true);
      setWsError(null);
      wsRef.current = socket;
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data?.type === 'conversation_list' && Array.isArray(data.conversations)) {
          setConversations(data.conversations);
          // Set a default selection if none
          if (!selectedChat && data.conversations.length > 0) {
            const firstId = String(data.conversations[0]?.user?.id);
            if (firstId) setSelectedChat(firstId);
          }
        } else if ((data?.type === 'conversation_messages' || data?.type === 'message_list') && Array.isArray(data.messages)) {
          // Map messages for current selected chat
          const currentUserId = userDataRef.current?.id;
          const mapped = data.messages.map((m) => ({
            id: m.id,
            sender: m.sender_id === currentUserId ? 'You' : (m.sender_name || 'User'),
            message: m.message || '',
            time: m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
            type: m.sender_id === currentUserId ? 'sent' : 'received', // This determines alignment
            files: m.has_media ? m.files || [] : undefined,
          }));
          setMessages(mapped);
        } else if (data?.type === 'new_message' && data.message) {
          // Append live new message if it belongs to the current chat
          const currentUserId = userDataRef.current?.id;
          const fromUserId = String(data.message.sender_id === currentUserId ? data.message.receiver_id : data.message.sender_id);
          if (fromUserId === selectedChat) {
            const newMsg = {
              id: data.message.id,
              sender: data.message.sender_id === currentUserId ? 'You' : (data.message.sender_name || 'User'),
              message: data.message.message || '',
              time: data.message.timestamp ? new Date(data.message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
              type: data.message.sender_id === currentUserId ? 'sent' : 'received', // This determines alignment
              files: data.message.has_media ? data.message.files || [] : undefined,
            };
            setMessages((prev) => [...prev, newMsg]);
          }
        }
      } catch (err) {
        console.error('WS message parse error:', err);
      }
    };

    socket.onerror = () => {
      setWsConnected(false);
      setWsError('WebSocket connection error');
    };

    socket.onclose = () => {
      setWsConnected(false);
    };

    return () => {
      try { socket && socket.close(); } catch {}
      wsRef.current = null;
    };
  }, []);

  // Open per-chat WebSocket for sending/receiving live messages - FIXED MESSAGE ALIGNMENT
  // Open per-chat WebSocket for sending/receiving live messages - FIXED MESSAGE ALIGNMENT
  useEffect(() => {
    const token = getAccessToken();
    if (!selectedChat || !token) {
      if (chatWsRef.current) {
        try { chatWsRef.current.close(); } catch {}
      }
      setChatWsConnected(false);
      return;
    }
    
    // Close existing connection
    if (chatWsRef.current) {
      try { chatWsRef.current.close(); } catch {}
    }
    
    // Clear messages when switching chats
    setMessages([]);
    
    const url = `wss://jeewanjyoti-backend.smart.org.np/ws/chat/${selectedChat}/?token=${token}`;
    let sock;
    try {
      sock = new WebSocket(url);
    } catch (e) {
      console.error('Chat WS init failed', e);
      setChatWsConnected(false);
      return;
    }
    chatWsRef.current = sock;
    
    sock.onopen = () => {
      console.log('Chat WebSocket connected for user:', selectedChat);
      setChatWsConnected(true);
      // Fetch history after WebSocket connects
      fetchHistory(selectedChat);
    };
    
    sock.onclose = () => {
      console.log('Chat WebSocket disconnected');
      setChatWsConnected(false);
    };
    
    sock.onerror = (err) => {
      console.error('Chat WebSocket error:', err);
      setChatWsConnected(false);
    };
    
    sock.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Chat WS received:', data);
        
        const currentUserId = Number(userDataRef.current?.id);
        
        // Handle the message structure from your backend
        let messageData = null;
        
        if (data.type === 'message' && data.data) {
          // Format: {"type": "message", "data": {...}}
          messageData = data.data;
        } else if (data.message || data.sender_id) {
          // Direct message format
          messageData = data;
        }
        
        if (!messageData) return;
        
        const senderId = Number(messageData.sender_id || messageData.sender);
        const text = messageData.message || '';
        const ts = messageData.timestamp || messageData.time || new Date().toISOString();
        const messageId = messageData.id || Date.now();
        
        // Check if message already exists to prevent duplicates
        setMessages((prev) => {
          const exists = prev.some(m => m.id === messageId);
          if (exists) return prev;
          
          const mapped = {
            id: messageId,
            sender: senderId === currentUserId ? 'You' : (currentChat?.name || 'User'),
            message: text,
            time: new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: senderId === currentUserId ? 'sent' : 'received',
          };
          
          return [...prev, mapped];
        });
      } catch (e) {
        console.error('Chat WS message parse error', e);
      }
    };
    return () => {
      try { sock && sock.close(); } catch {}
    };
  }, [selectedChat, currentChat]);

 // Request messages for selected chat via WebSocket (fallback) and HTTP (primary)
 useEffect(() => {
  if (!selectedChat) return;
  
  // HTTP fetch is now called from the WebSocket onopen handler
  // to ensure connection is established first
  
  // Optionally ask WS too if connected
  if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
    try {
      const uid = Number(selectedChat);
      wsRef.current.send(JSON.stringify({ type: 'get_conversation_messages', user_id: uid }));
      wsRef.current.send(JSON.stringify({ type: 'get_messages', user_id: uid }));
    } catch (e) {
      console.error('Failed to request messages via WS:', e);
    }
  }
}, [selectedChat]);

  // Message alignment function - FIXED: Sent messages on right (blue), received on left (green)
  // Message alignment: sent = RIGHT, received = LEFT
const getMessageAlignment = (messageType) => {
  return messageType === 'sent' ? 'justify-end' : 'justify-start';
};

// Message bubble styling: sent = BLUE (right), received = GREEN (left)
const getMessageBubbleStyle = (messageType, darkMode) => {
  if (messageType === 'sent') {
    return 'bg-blue-600 text-white rounded-br-sm';
  } else {
    return 'bg-green-600 text-white rounded-bl-sm';
  }
};

// Message time styling
const getMessageTimeStyle = (messageType) => {
  if (messageType === 'sent') {
    return 'text-blue-100 text-right';
  } else {
    return 'text-green-100';
  }
};

  return (
    <div className="h-full flex overflow-hidden">
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

      {/* Mobile Layout */}
      <div className="md:hidden w-full h-full">
        {!showChatRoom ? (
          // Mobile: Profiles List View
          <div className={`w-full h-full flex flex-col ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            {/* Header */}
            <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex-shrink-0`}>
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
                    {chat.photoUrl ? (
                      <img src={chat.photoUrl} alt={chat.name} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold bg-gradient-to-r from-blue-500 to-purple-500">
                        {chat.avatar}
                      </div>
                    )}
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
                    <p className={`text-sm truncate ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{chat.lastMessage}</p>
                      <div className="flex items-center justify-between mt-1">
                      <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{chat.role}</span>
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
          <div className={`w-full h-full flex flex-col ${darkMode ? 'bg-gray-800' : 'bg-white'} relative`}>
            {/* Mobile Chat Header - Fixed at top */}
            <div className={`fixed top-0 left-0 right-0 z-10 p-4 border-b ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} flex items-center gap-3`}>
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

            {/* Messages Container - Scrollable middle section */}
            <div className="pt-20 pb-24 px-4 space-y-3 overflow-y-auto flex-1">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${getMessageAlignment(message.type)}`}>
                  <div className={`max-w-[80%] md:max-w-[65%] px-4 py-2 rounded-2xl ${
                    getMessageBubbleStyle(message.type, darkMode)
                  }`}>
                    <p className="text-sm leading-relaxed break-words">{message.message}</p>
                    {message.files && message.files.length > 0 && (
                      <div className={`mt-2 space-y-2 ${message.type === 'sent' ? 'bg-blue-500/40' : 'bg-green-500/40'} p-2 rounded-lg`}>
                        {message.files.map((file, index) => (
                          <div key={index} className="flex items-center gap-2 text-xs">
                            {renderFileIcon(file.type)}
                            <div className="flex-1 min-w-0">
                              <div className="truncate">{file.name}</div>
                              {file.size && <div className="opacity-80">{file.size}</div>}
                            </div>
                            <button className="opacity-80 hover:opacity-100">
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className={`text-[10px] mt-1 ${getMessageTimeStyle(message.type)}`}>{message.time}</div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Mobile Message Input - Fixed at bottom */}
            <div className={`fixed bottom-0 left-0 right-0 z-10 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              {/* Selected file preview */}
              {selectedFile && (
                <div className={`mx-4 mb-2 p-2 rounded-lg flex items-center justify-between ${
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

              <div className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <button
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                    >
                      <Smile className="w-5 h-5 text-gray-500" />
                    </button>
                    
                    {showEmojiPicker && (
                      <div className="absolute bottom-full left-0 mb-2 z-20">
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
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
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
                    placeholder="Type a message..."
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
            </div>
          </div>
        )}
      </div>

      {/* Desktop: Original Layout */}
      <div className="hidden md:flex w-full h-full">
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
                    {chat.photoUrl ? (
                      <img src={chat.photoUrl} alt={chat.name} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm bg-gradient-to-r from-blue-500 to-purple-500">
                        {chat.avatar}
                      </div>
                    )}
                    {chat.online && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-gray-800'} truncate`}>
                        {chat.name}
                      </h3>
                      <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{chat.time}</span>
                    </div>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} truncate`}>{chat.role}</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} truncate mt-1`}>{chat.lastMessage}</p>
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
              <div className="flex-1 p-4 space-y-3 overflow-y-auto min-h-0 pb-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${getMessageAlignment(message.type)}`}>
                    <div className={`max-w-md lg:max-w-2xl px-4 py-2 rounded-2xl ${
                      getMessageBubbleStyle(message.type, darkMode)
                    }`}>
                      <p className="text-sm leading-relaxed break-words">{message.message}</p>
                      {message.files && message.files.length > 0 && (
                        <div className={`mt-2 space-y-2 ${message.type === 'sent' ? 'bg-blue-500/40' : 'bg-green-500/40'} p-2 rounded-lg`}>
                          {message.files.map((file, index) => (
                            <div key={index} className="flex items-center gap-2 text-xs">
                              {renderFileIcon(file.type)}
                              <div className="flex-1 min-w-0">
                                <div className="truncate">{file.name}</div>
                                {file.size && <div className="opacity-80">{file.size}</div>}
                              </div>
                              <button className={`p-1 rounded ${darkMode ? 'hover:bg-gray-500' : 'hover:bg-gray-300'}`}>
                                <Download className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <p className={`text-[10px] mt-1 ${getMessageTimeStyle(message.type)}`}>{message.time}</p>
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