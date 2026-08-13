import { useEffect, useRef, useState } from 'react';
import { API_BASE_URL } from '../lib/api';
import { getAccessToken, isTokenExpired, refreshAccessToken } from '../lib/tokenManager';

const RECONNECT_DELAY_MS = 3000;

// Connects to the presence/status WebSocket for the lifetime of the calling
// component. Mount this once at the top of the authenticated app (e.g. right
// after login) so presence tracking starts immediately, instead of only when
// the user happens to open the chat tab.
export default function useStatusSocket(userIdToTrack = null) {
  const statusWsRef = useRef(null);
  const [statusWsConnected, setStatusWsConnected] = useState(false);
  const [userStatuses, setUserStatuses] = useState({}); // keyed by user_id

  // Open a single persistent connection for the lifetime of the calling
  // component, instead of tearing it down and reconnecting every time the
  // tracked user changes (which was racy and could drop the subscribe
  // message, leaving the status stuck on "Checking...").
  useEffect(() => {
    let cancelled = false;
    let reconnectTimer = null;
    let statusSocket = null;

    const connect = async () => {
      if (cancelled) return;

      let token = getAccessToken();
      if (!token) {
        console.log('No token available for status WebSocket');
        return;
      }

      // The server rejects the WS handshake outright for an expired token
      // (no retry, no error detail) — refresh first so a stale token doesn't
      // permanently strand the status at "Checking...".
      if (isTokenExpired(token)) {
        const refreshed = await refreshAccessToken();
        if (cancelled) return;
        if (!refreshed) {
          console.warn('Could not refresh token for status WebSocket');
          return;
        }
        token = getAccessToken();
      }

      const wsProtocol = API_BASE_URL.startsWith('https') ? 'wss' : 'ws';
      const baseUrl = API_BASE_URL.replace(/^https?:\/\//, '');
      const statusWsUrl = `${wsProtocol}://${baseUrl}/ws/status/?token=${token}`;

      try {
        statusSocket = new WebSocket(statusWsUrl);
      } catch (e) {
        console.error('Failed to initialize status WebSocket:', e);
        return;
      }

      statusWsRef.current = statusSocket;

      statusSocket.onopen = () => {
        console.log('✅ Status WebSocket connected successfully');
        setStatusWsConnected(true);
      };

      statusSocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data?.type === 'user_status') {
            const { user_id, status, last_seen } = data;
            console.log(`📊 User ${user_id} status: ${status}`);
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
        statusWsRef.current = null;

        // Retry so a dropped/rejected connection doesn't leave presence
        // stuck forever — the token-expiry check above handles the most
        // common rejection cause on the next attempt.
        if (!cancelled) {
          reconnectTimer = setTimeout(connect, RECONNECT_DELAY_MS);
        }
      };
    };

    connect();

    return () => {
      cancelled = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (statusSocket) {
        statusSocket.onclose = null;
        try { statusSocket.close(); } catch {}
      }
      statusWsRef.current = null;
    };
  }, []);

  // (Re)subscribe to the tracked mapped user's id whenever it changes, or
  // once the connection above (re)opens — covers switching users and
  // reconnects after a dropped connection.
  useEffect(() => {
    if (!userIdToTrack || !statusWsConnected) return;

    const socket = statusWsRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return;

    socket.send(JSON.stringify({
      type: 'subscribe',
      user_id: userIdToTrack
    }));
    console.log(`📡 Subscribed to user ${userIdToTrack} status updates`);
  }, [userIdToTrack, statusWsConnected]);

  return { userStatuses, statusWsConnected };
}
