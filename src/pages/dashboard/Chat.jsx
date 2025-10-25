import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Bell, Send, Paperclip, Mic, Video, Phone, X, Smile, Image, 
  File, Download, Search, MoreHorizontal, Circle, ArrowLeft
} from 'lucide-react';

// Enhanced EmojiPicker component
const EmojiPicker = ({ onEmojiClick, theme, height, width, emojiAsFile, setEmojiAsFile, onClose }) => {
  const emojis = [
    '😀', '😂', '😍', '🤔', '👍', '❤️', '🎉', '🔥', '👋', '💯',
    '😊', '😢', '😡', '🤗', '👏', '🙌', '💪', '🎯', '⭐', '🌟',
    '💯', '🔥', '💖', '💝', '🎊', '🎈', '🎁', '🏆', '🥇', '✨'
  ];
  
  return (
    <div className={`p-3 rounded-lg shadow-lg border ${
      theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
    }`} style={{ width: width || 280, height: height || 200 }}>
      {/* Header with close button */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-600 dark:text-gray-400">Emoji Mode:</span>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <button
              onClick={() => setEmojiAsFile(false)}
              className={`px-2 py-1 text-xs rounded ${
                !emojiAsFile 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              Text
            </button>
            <button
              onClick={() => setEmojiAsFile(true)}
              className={`px-2 py-1 text-xs rounded ${
                emojiAsFile 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              File
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-500 dark:text-gray-400"
            title="Close emoji picker"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-5 gap-2">
        {emojis.map((emoji, index) => (
          <button
            key={index}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Emoji button clicked:', emoji);
              onEmojiClick({ emoji });
            }}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-xl transition-colors"
            type="button"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};

import { getAccessToken, getUserData } from '../../lib/tokenManager';

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
  // store "me" (own user id) returned by history API for reliable identification
  const myIdRef = useRef(null);
  const chatWsRef = useRef(null);
  const [chatWsConnected, setChatWsConnected] = useState(false);
  const [lastMessageTime, setLastMessageTime] = useState(0);
  const [processingMessage, setProcessingMessage] = useState(false);
  const [processedMessageIds, setProcessedMessageIds] = useState(new Set());

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
  const [isProcessingScreenshot, setIsProcessingScreenshot] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState('');
  const [modalImageName, setModalImageName] = useState('');
  const [isLoadingOlderMessages, setIsLoadingOlderMessages] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [emojiAsFile, setEmojiAsFile] = useState(false); // Toggle for emoji as file
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Do not use any dummy messages on chat change
  useEffect(() => {
    setMessages([]);
    setProcessedMessageIds(new Set());
  }, [selectedChat]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Facebook Messenger-style scroll behavior
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop } = container;
      
      // Load older messages when scrolled to top
      if (scrollTop < 100 && hasMoreMessages && !isLoadingOlderMessages) {
        loadOlderMessages();
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [hasMoreMessages, isLoadingOlderMessages]);

  // Load older messages function
  const loadOlderMessages = async () => {
    if (!selectedChat || isLoadingOlderMessages) return;
    
    setIsLoadingOlderMessages(true);
    try {
      const token = getAccessToken();
      const nextPage = currentPage + 1;
      const response = await fetch(`https://jeewanjyoti-backend.smart.org.np/api/history/${selectedChat}/?page=${nextPage}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const newMessages = data.chat || [];
        
        if (newMessages.length === 0) {
          setHasMoreMessages(false);
        } else {
          // Prepend older messages to the beginning
          const myUserId = Number(myIdRef.current || userDataRef.current?.id || 0);
          const nameForPartner = currentChat?.name || 'User';
          
          const mappedNewMessages = newMessages.map((m) => {
            const isSentByMe = Number(m.sender) === myUserId;
            return {
              id: m.id,
              sender: isSentByMe ? 'You' : nameForPartner,
              message: m.message || '',
              time: m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
              type: isSentByMe ? 'sent' : 'received',
              hasMedia: m.has_media,
              fileUrl: m.file_url,
              imageUrl: m.image_url,
              files: m.has_media ? [{
                name: (m.file_url || m.file) ? (m.file_url || m.file).split('/').pop() : ((m.image_url || m.image) ? (m.image_url || m.image).split('/').pop() : 'file'),
                type: (m.image_url || m.image) ? 'image' : ((m.file_url || m.file) ? getFileTypeFromUrl(m.file_url || m.file) : 'file'),
                url: m.file_url || m.image_url || m.file || m.image
              }] : undefined,
            };
          });
          
          setMessages(prev => [...mappedNewMessages, ...prev]);
          setCurrentPage(nextPage);
        }
      }
    } catch (error) {
      console.error('Failed to load older messages:', error);
    } finally {
      setIsLoadingOlderMessages(false);
    }
  };
  
  // Cleanup processed message IDs periodically to prevent memory leaks
  useEffect(() => {
    const cleanup = setInterval(() => {
      setProcessedMessageIds(new Set());
    }, 30000); // Clear every 30 seconds
    
    return () => clearInterval(cleanup);
  }, []);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showEmojiPicker && !event.target.closest('.emoji-picker-container')) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showEmojiPicker]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // File upload API function
  const uploadFile = async (file, receiverId, message = '') => {
    const token = getAccessToken();
    const formData = new FormData();
    formData.append('file', file);
    if (message.trim()) {
      formData.append('message', message.trim());
    }

    try {
      const response = await fetch(`https://jeewanjyoti-backend.smart.org.np/api/upload_file/${receiverId}/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`File upload failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('File upload successful:', result);
      return result;
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !selectedFile) return;
    const text = newMessage.trim();
    
    // If there's a file, upload it first
    if (selectedFile) {
      try {
        // Add optimistic message for file upload
        const optimisticId = `temp_file_${Date.now()}_${Math.random()}`;
        const fileType = getFileTypeFromUrl(selectedFile.name);
        const optimisticMessage = {
          id: optimisticId,
          sender: 'You',
          message: text || '',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'sent',
          isOptimistic: true,
          localTimestamp: Date.now(),
          hasMedia: true,
          files: [{
            name: selectedFile.name,
            type: fileType,
            url: URL.createObjectURL(selectedFile), // Create temporary URL for preview
            size: selectedFile.size
          }]
        };
        
        setMessages((prev) => [...prev, optimisticMessage]);
        
        // Upload file to API
        await uploadFile(selectedFile, selectedChat, text);
        
        // Clear form
        setNewMessage('');
        setSelectedFile(null);
        return;
      } catch (error) {
        console.error('File upload failed:', error);
        // Remove optimistic message on error
        setMessages((prev) => prev.filter(msg => msg.id !== optimisticId));
        alert('Failed to upload file. Please try again.');
        return;
      }
    }
    
    // Handle text-only messages (existing logic)
    const optimisticId = `temp_${Date.now()}_${Math.random()}`;
    const optimisticMessage = {
      id: optimisticId,
      sender: 'You',
      message: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'sent', // This ensures it appears on the right with blue color
      isOptimistic: true, // Flag to identify optimistic messages
      localTimestamp: Date.now(),
    };
    
    setMessages((prev) => [...prev, optimisticMessage]);
    
    // Send via WebSocket and include temp id so server can echo it back if supported
    try {
      if (chatWsRef.current && chatWsRef.current.readyState === WebSocket.OPEN) {
        const payload = {
          type: 'text_message',
          message: text,
          temp_id: optimisticId,
        };
        chatWsRef.current.send(JSON.stringify(payload));
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

  // Handle paste events for screenshots
  const handlePaste = async (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        e.preventDefault();
        
        const file = item.getAsFile();
        if (file) {
          console.log('Screenshot pasted:', file);
          setIsProcessingScreenshot(true);
          
          // Set the pasted image as selected file
          setSelectedFile(file);
          
          // Auto-send the screenshot (like WhatsApp behavior)
          setTimeout(async () => {
            try {
              await handleSendMessage();
            } finally {
              setIsProcessingScreenshot(false);
            }
          }, 100);
        }
        break;
      }
    }
  };

  const handleEmojiClick = (emojiData) => {
    console.log('Emoji clicked:', emojiData);
    
    if (emojiAsFile) {
      // Send emoji as file
      sendEmojiAsFile(emojiData.emoji);
    } else {
      // Send emoji as text (standard approach)
      setNewMessage(prev => prev + emojiData.emoji);
    }
    
    // Keep emoji picker open for multiple selections
    // setShowEmojiPicker(false); // Removed this line
  };

  // Alternative: Send emoji as file (if you prefer this approach)
  const sendEmojiAsFile = async (emoji) => {
    try {
      // Create a canvas with the emoji
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 64;
      canvas.height = 64;
      
      // Set font and draw emoji
      ctx.font = '48px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(emoji, 32, 32);
      
      // Convert to blob
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      const file = new File([blob], `emoji_${emoji}.png`, { type: 'image/png' });
      
      // Set as selected file and send
      setSelectedFile(file);
      setTimeout(() => handleSendMessage(), 100);
    } catch (error) {
      console.error('Failed to create emoji file:', error);
      // Fallback to text emoji
      setNewMessage(prev => prev + emoji);
    }
  };

  // Smooth download function
  const handleDownload = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback to opening in new tab
      window.open(url, '_blank');
    }
  };

  // Handle image click for modal
  const handleImageClick = (url, name) => {
    setModalImageUrl(url);
    setModalImageName(name);
    setShowImageModal(true);
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

  const getFileTypeFromUrl = (url) => {
    if (!url) return 'file';
    const extension = url.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) {
      return 'image';
    }
    return extension || 'file';
  };

  const renderFileIcon = (type) => {
    switch(type) {
      case 'pdf': return <File className="w-4 h-4 text-red-500" />;
      case 'doc': case 'docx': return <File className="w-4 h-4 text-blue-500" />;
      case 'xls': case 'xlsx': return <File className="w-4 h-4 text-green-500" />;
      case 'jpg': case 'jpeg': case 'png': case 'gif': case 'image': return <Image className="w-4 h-4 text-purple-500" />;
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
      const userData = getUserData();
      userDataRef.current = userData || {};
      console.log('Initialized user data:', userDataRef.current);
    } catch (error) {
      console.error('Error getting user data:', error);
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
        console.log('Full history API response:', data);
        
        // save "me" returned by API so websocket handling can identify our own messages
        myIdRef.current = Number(data.me || userDataRef.current?.id || 0);
        console.log('Saved my id from history API:', myIdRef.current);
        const myUserId = Number(data.me || userDataRef.current?.id);  // ← CHANGED: use data.me
        const nameForPartner = currentChat?.name || 'User';
        const arr = Array.isArray(data.chat) ? data.chat : [];  // ← CHANGED: use data.chat
        
        console.log('Chat messages from history:', arr);
  
        // Sort by timestamp ascending
        arr.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  
        const mapped = arr.map((m) => {
          const isSentByMe = Number(m.sender) === myUserId;
          
          // Debug logging for media messages
          if (m.has_media) {
            console.log('History message with media:', {
              id: m.id,
              has_media: m.has_media,
              file_url: m.file_url,
              image_url: m.image_url,
              message: m.message,
              full_message_object: m
            });
          }
          
          // Debug all message properties
          console.log('Processing history message:', {
            id: m.id,
            sender: m.sender,
            message: m.message,
            has_media: m.has_media,
            file_url: m.file_url,
            image_url: m.image_url,
            file: m.file,
            image: m.image,
            timestamp: m.timestamp,
            all_keys: Object.keys(m)
          });
          
          const mappedMessage = {
            id: m.id,
            sender: isSentByMe ? 'You' : nameForPartner,
            message: m.message || '',
            time: m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
            type: isSentByMe ? 'sent' : 'received',  // This determines alignment
            hasMedia: m.has_media,
            fileUrl: m.file_url,
            imageUrl: m.image_url,
            files: m.has_media ? [{
              name: (m.file_url || m.file) ? (m.file_url || m.file).split('/').pop() : ((m.image_url || m.image) ? (m.image_url || m.image).split('/').pop() : 'file'),
              type: (m.image_url || m.image) ? 'image' : ((m.file_url || m.file) ? getFileTypeFromUrl(m.file_url || m.file) : 'file'),
              url: m.file_url || m.image_url || m.file || m.image
            }] : undefined,
          };
          
          // Debug the final mapped message
          if (m.has_media) {
            console.log('Final mapped message with media:', mappedMessage);
          }
          
          return mappedMessage;
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
        }
        // REMOVED: Individual message handling to prevent duplicates
        // Messages are now only handled by the per-chat WebSocket connection
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
    
    // messages are cleared by the selectedChat effect above (do NOT clear here)
    
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
        console.log('Chat WS received:', data.type || 'message');
        console.log('Full WebSocket data:', data);
        
        // Determine current user id using saved "me" from history API if available,
        // fallback to token-stored userDataRef
        const currentUserId = Number(myIdRef.current || userDataRef.current?.id || 0);

        // Extract message data
        let messageData = null;
        if (data.type === 'message' && data.data) {
          messageData = data.data;
        } else if (data.message || data.sender_id) {
          messageData = data;
        }
        
        if (!messageData) return;
        
        const senderId = Number(messageData.sender_id || messageData.sender);
        const text = messageData.message || '';
        const timestamp = messageData.timestamp || messageData.time || new Date().toISOString();
        const messageId = messageData.id || `msg_${Date.now()}`;
        const hasMedia = messageData.has_media || false;
        const fileUrl = messageData.file_url || null;
        const imageUrl = messageData.image_url || null;
        
        console.log('Message data details:', {
          hasMedia,
          fileUrl,
          imageUrl,
          messageData
        });
        
        // Check if this is our own message (optimistic update replacement)
        const isSentByMe = senderId === currentUserId;
        
        setMessages((prev) => {
          // Check if message already exists to prevent duplicates
          const exists = prev.some(m => m.id === messageId);
          if (exists) {
            console.log('Message already exists, skipping:', messageId);
            return prev;
          }
          
          // If this is our own message, replace the optimistic version
          if (isSentByMe) {
            // Find and replace optimistic message - look for recent optimistic messages
            const optimisticIndex = prev.findIndex(msg => 
              msg.isOptimistic && (
                (hasMedia && msg.hasMedia) || // Both have media
                (!hasMedia && !msg.hasMedia && msg.message === text) // Both are text messages
              )
            );
            
            if (optimisticIndex !== -1) {
              console.log('Replacing optimistic message with real message');
              const newMessages = [...prev];
              newMessages[optimisticIndex] = {
                id: messageId,
                sender: 'You',
                message: text,
                time: new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                type: 'sent',
                hasMedia,
                fileUrl,
                imageUrl,
                files: hasMedia ? [{
                  name: fileUrl ? fileUrl.split('/').pop() : (imageUrl ? imageUrl.split('/').pop() : 'file'),
                  type: imageUrl ? 'image' : (fileUrl ? getFileTypeFromUrl(fileUrl) : 'file'),
                  url: fileUrl || imageUrl
                }] : undefined,
              };
              return newMessages;
            }
          }
          
          // For received messages or sent messages without optimistic version
          const newMessage = {
            id: messageId,
            sender: isSentByMe ? 'You' : (currentChat?.name || 'User'),
            message: text,
            time: new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: isSentByMe ? 'sent' : 'received',
            hasMedia,
            fileUrl,
            imageUrl,
            files: hasMedia ? [{
              name: fileUrl ? fileUrl.split('/').pop() : (imageUrl ? imageUrl.split('/').pop() : 'file'),
              type: imageUrl ? 'image' : (fileUrl ? getFileTypeFromUrl(fileUrl) : 'file'),
              url: fileUrl || imageUrl
            }] : undefined,
          };
          
          console.log('Adding new message:', isSentByMe ? 'sent' : 'received', hasMedia ? 'with file' : '');
          return [...prev, newMessage];
        });
        
      } catch (e) {
        console.error('Chat WS message parse error', e);
      }
    };

    return () => {
      if (chatWsRef.current) {
        chatWsRef.current.close();
        chatWsRef.current = null;
      }
      // do not clear messages here; selectedChat effect handles that
      setChatWsConnected(false);
    };
  }, [selectedChat, currentChat]);

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
      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-95" onClick={() => setShowImageModal(false)}>
          <div className="relative w-[95%] h-[95%] flex items-center justify-center">
            <img 
              src={modalImageUrl}
              alt={modalImageName}
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 bg-black bg-opacity-60 text-white p-3 rounded-full hover:bg-opacity-80 transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-60 text-white p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm truncate">{modalImageName}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(modalImageUrl, modalImageName);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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

              {/* Fallback empty state for mobile chat list */}
              {filteredChats.length === 0 && (
                <div className="p-4 text-center text-gray-500">
                  No conversations found.
                </div>
              )}
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
            <div ref={messagesContainerRef} className="pt-20 pb-24 px-4 space-y-3 overflow-y-auto flex-1">
              {/* Loading indicator for older messages */}
              {isLoadingOlderMessages && (
                <div className="flex justify-center py-4">
                  <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                </div>
              )}
              {messages.map((message) => (
                <div key={message.id} className={`flex ${getMessageAlignment(message.type)}`}>
                  <div className={`max-w-[80%] md:max-w-[65%] ${message.files && message.files.length > 0 ? 'p-0' : 'px-4 py-2'} rounded-2xl ${
                    getMessageBubbleStyle(message.type, darkMode)
                  }`}>
                    {/* Media files display */}
                    {message.files && message.files.length > 0 && (
                      <div className="space-y-1">
                        {message.files.map((file, index) => (
                          <div key={index}>
                            {file.type === 'image' ? (
                              <div className="relative group">
                                <img 
                                  src={file.url ? `https://jeewanjyoti-backend.smart.org.np${file.url}` : '#'}
                                  alt={file.name}
                                  className="w-full max-w-sm rounded-2xl cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() => handleImageClick(`https://jeewanjyoti-backend.smart.org.np${file.url}`, file.name)}
                                  onLoad={() => console.log('Image loaded successfully:', file.url)}
                                  onError={(e) => {
                                    console.error('Image load error for URL:', `https://jeewanjyoti-backend.smart.org.np${file.url}`);
                                    console.error('Error details:', e);
                                    // Show fallback instead of hiding
                                    e.target.style.display = 'none';
                                    const fallback = document.createElement('div');
                                    fallback.className = 'w-full max-w-sm rounded-2xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center p-8 text-gray-500';
                                    fallback.innerHTML = `
                                      <div class="text-center">
                                        <div class="text-4xl mb-2">📷</div>
                                        <div class="text-sm">Image not loading</div>
                                        <div class="text-xs mt-1">${file.name}</div>
                                      </div>
                                    `;
                                    e.target.parentNode.appendChild(fallback);
                                  }}
                                />
                                {/* Timestamp overlay in corner */}
                                <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded-lg text-xs">
                                  {message.time}
                                </div>
                                {/* Download button overlay */}
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDownload(`https://jeewanjyoti-backend.smart.org.np${file.url}`, file.name);
                                    }}
                                    className="bg-black bg-opacity-60 text-white p-2 rounded-full hover:bg-opacity-80 transition-colors"
                                    title="Download image"
                                  >
                                    <Download className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className={`p-3 ${message.type === 'sent' ? 'bg-blue-500/20' : 'bg-green-500/20'} rounded-2xl`}>
                                <div className="flex items-center gap-3">
                                  {renderFileIcon(file.type)}
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium truncate">{file.name}</div>
                                    {file.size && <div className="text-xs opacity-70">{file.size}</div>}
                                  </div>
                                  <a 
                                    href={file.url ? `https://jeewanjyoti-backend.smart.org.np${file.url}` : '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                  >
                                    <Download className="w-4 h-4" />
                                  </a>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Text message */}
                    {message.message && (
                      <div className={`px-4 py-2 ${message.files && message.files.length > 0 ? 'pt-2' : ''}`}>
                        <p className="text-sm leading-relaxed break-words">{message.message}</p>
                      </div>
                    )}
                    
                    {/* Message time - only show for non-image messages */}
                    {!(message.files && message.files.some(file => file.type === 'image')) && (
                      <div className={`text-[10px] px-4 pb-2 ${getMessageTimeStyle(message.type)}`}>{message.time}</div>
                    )}
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
                {/* Screenshot processing indicator */}
                {isProcessingScreenshot && (
                  <div className={`mb-2 p-2 rounded-lg ${darkMode ? 'bg-blue-900/50' : 'bg-blue-50'} flex items-center gap-2`}>
                    <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    <span className="text-sm text-blue-600 dark:text-blue-400">Processing screenshot...</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <button
                      onClick={() => {
                        console.log('Emoji picker button clicked, current state:', showEmojiPicker);
                        setShowEmojiPicker(!showEmojiPicker);
                      }}
                      className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                    >
                      <Smile className="w-5 h-5 text-gray-500" />
                    </button>
                    
                    {showEmojiPicker && (
                      <div className="absolute bottom-full left-0 mb-2 z-20 emoji-picker-container">
                        <EmojiPicker
                          onEmojiClick={handleEmojiClick}
                          theme={darkMode ? 'dark' : 'light'}
                          width={280}
                          height={350}
                          emojiAsFile={emojiAsFile}
                          setEmojiAsFile={setEmojiAsFile}
                          onClose={() => setShowEmojiPicker(false)}
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
                    onPaste={handlePaste}
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
              <div ref={messagesContainerRef} className="flex-1 p-4 space-y-3 overflow-y-auto min-h-0 pb-4">
                {/* Loading indicator for older messages */}
                {isLoadingOlderMessages && (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  </div>
                )}
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${getMessageAlignment(message.type)}`}>
                    <div className={`max-w-md lg:max-w-2xl ${message.files && message.files.length > 0 ? 'p-0' : 'px-4 py-2'} rounded-2xl ${
                      getMessageBubbleStyle(message.type, darkMode)
                    }`}>
                      {/* Media files display */}
                      {message.files && message.files.length > 0 && (
                        <div className="space-y-1">
                          {message.files.map((file, index) => (
                            <div key={index}>
                              {file.type === 'image' ? (
                                <div className="relative group">
                                  <img 
                                    src={file.url ? `https://jeewanjyoti-backend.smart.org.np${file.url}` : '#'}
                                    alt={file.name}
                                    className="w-full max-w-md rounded-2xl cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() => handleImageClick(`https://jeewanjyoti-backend.smart.org.np${file.url}`, file.name)}
                                    onLoad={() => console.log('Image loaded successfully:', file.url)}
                                    onError={(e) => {
                                      console.error('Image load error for URL:', `https://jeewanjyoti-backend.smart.org.np${file.url}`);
                                      console.error('Error details:', e);
                                      // Show fallback instead of hiding
                                      e.target.style.display = 'none';
                                      const fallback = document.createElement('div');
                                      fallback.className = 'w-full max-w-md rounded-2xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center p-8 text-gray-500';
                                      fallback.innerHTML = `
                                        <div class="text-center">
                                          <div class="text-4xl mb-2">📷</div>
                                          <div class="text-sm">Image not loading</div>
                                          <div class="text-xs mt-1">${file.name}</div>
                                        </div>
                                      `;
                                      e.target.parentNode.appendChild(fallback);
                                    }}
                                  />
                                  {/* Timestamp overlay in corner */}
                                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded-lg text-xs">
                                    {message.time}
                                  </div>
                                  {/* Download button overlay */}
                                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDownload(`https://jeewanjyoti-backend.smart.org.np${file.url}`, file.name);
                                      }}
                                      className="bg-black bg-opacity-60 text-white p-2 rounded-full hover:bg-opacity-80 transition-colors"
                                      title="Download image"
                                    >
                                      <Download className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className={`p-3 ${message.type === 'sent' ? 'bg-blue-500/20' : 'bg-green-500/20'} rounded-2xl`}>
                                  <div className="flex items-center gap-3">
                                    {renderFileIcon(file.type)}
                                    <div className="flex-1 min-w-0">
                                      <div className="text-sm font-medium truncate">{file.name}</div>
                                      {file.size && <div className="text-xs opacity-70">{file.size}</div>}
                                    </div>
                                    <a 
                                      href={file.url ? `https://jeewanjyoti-backend.smart.org.np${file.url}` : '#'}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                    >
                                      <Download className="w-4 h-4" />
                                    </a>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Text message */}
                      {message.message && (
                        <div className={`px-4 py-2 ${message.files && message.files.length > 0 ? 'pt-2' : ''}`}>
                          <p className="text-sm leading-relaxed break-words">{message.message}</p>
                        </div>
                      )}
                      
                      {/* Message time - only show for non-image messages */}
                      {!(message.files && message.files.some(file => file.type === 'image')) && (
                        <div className={`text-[10px] px-4 pb-2 ${getMessageTimeStyle(message.type)}`}>{message.time}</div>
                      )}
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
                {/* Screenshot processing indicator */}
                {isProcessingScreenshot && (
                  <div className={`mb-2 p-2 rounded-lg ${darkMode ? 'bg-blue-900/50' : 'bg-blue-50'} flex items-center gap-2`}>
                    <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    <span className="text-sm text-blue-600 dark:text-blue-400">Processing screenshot...</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <button
                      onClick={() => {
                        console.log('Desktop emoji picker button clicked, current state:', showEmojiPicker);
                        setShowEmojiPicker(!showEmojiPicker);
                      }}
                      className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} transition-colors`}
                    >
                      <Smile className="w-5 h-5 text-gray-500" />
                    </button>
                    
                    {showEmojiPicker && (
                      <div className="absolute bottom-full left-0 mb-2 z-10 emoji-picker-container">
                        <EmojiPicker 
                          onEmojiClick={handleEmojiClick}
                          theme={darkMode ? 'dark' : 'light'}
                          height={350}
                          width={300}
                          emojiAsFile={emojiAsFile}
                          setEmojiAsFile={setEmojiAsFile}
                          onClose={() => setShowEmojiPicker(false)}
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
                    onPaste={handlePaste}
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