import { useEffect, useRef, useState } from 'react';
import { API_BASE_URL } from '../lib/api';
import { getAccessToken } from '../lib/tokenManager';

// Connects to the presence/status WebSocket for the lifetime of the calling
// component. Mount this once at the top of the authenticated app (e.g. right
// after login) so presence tracking starts immediately, instead of only when
// the user happens to open the chat tab.
export default function useStatusSocket() {
  const statusWsRef = useRef(null);
  const [statusWsConnected, setStatusWsConnected] = useState(false);
  const [userStatuses, setUserStatuses] = useState({}); // keyed by user_id

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      console.log('No token available for status WebSocket');
      return;
    }

    const wsProtocol = API_BASE_URL.startsWith('https') ? 'wss' : 'ws';
    const baseUrl = API_BASE_URL.replace(/^https?:\/\//, '');
    const statusWsUrl = `${wsProtocol}://${baseUrl}/ws/status/?token=${token}`;

    let statusSocket;
    try {
      statusSocket = new WebSocket(statusWsUrl);
    } catch (e) {
      console.error('Failed to initialize status WebSocket:', e);
      return;
    }

    statusSocket.onopen = () => {
      console.log('✅ Status WebSocket connected successfully');
      setStatusWsConnected(true);
      statusWsRef.current = statusSocket;
    };

    statusSocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data?.type === 'user_status') {
          const { user_id, status, last_seen } = data;
          setUserStatuses(prev => ({
            ...prev,
            [user_id]: { status, last_seen, timestamp: Date.now() }
          }));
        }
      } catch (err) {
        console.error('❌ Status WS message parse error:', err);
      }
    };

    statusSocket.onerror = (error) => {
      console.error('❌ Status WebSocket error:', error);
      setStatusWsConnected(false);
    };

    statusSocket.onclose = (event) => {
      console.log('🔌 Status WebSocket disconnected:', event.code, event.reason);
      setStatusWsConnected(false);
    };

    return () => {
      try { statusSocket && statusSocket.close(); } catch {}
      statusWsRef.current = null;
    };
  }, []);

  return { userStatuses, statusWsConnected };
}
