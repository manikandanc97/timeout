'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { io, type Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import api from '@/services/api';
import { getAccessToken, setAccessToken } from '@/lib/token';
import { getSocketBaseUrl } from '@/lib/socketBaseUrl';
import { useAuth } from '@/context/AuthContext';
import { refreshDashboardForNotification } from '@/lib/notificationDataRefresh';
import type { AppNotification } from '@/types/notification';

type NotificationContextValue = {
  notifications: AppNotification[];
  unreadCount: number;
  refresh: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllRead: () => Promise<void>;
  isConnected: boolean;
};

const NotificationContext = createContext<NotificationContextValue | null>(
  null,
);

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return ctx;
}

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const { user } = useAuth();
  const userRoleRef = useRef<string | undefined>(undefined);
  userRoleRef.current =
    typeof user?.role === 'string' ? user.role : undefined;

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  /** Prevents duplicate toasts for the same DB row (e.g. reconnect edge cases). */
  const toastedSocketIds = useRef(new Set<number>());
  /** Known notification ids (from API + socket) to avoid double-counting unread. */
  const seenIdsRef = useRef(new Set<number>());

  const refresh = useCallback(async () => {
    try {
      const res = await api.get<{
        items: AppNotification[];
        unreadCount: number;
      }>('/notifications');
      setNotifications(res.data.items);
      setUnreadCount(res.data.unreadCount);
      seenIdsRef.current = new Set(res.data.items.map((i) => i.id));
    } catch {
      setNotifications([]);
      setUnreadCount(0);
      seenIdsRef.current = new Set();
    }
  }, []);

  useEffect(() => {
    if (!user?.id) return undefined;

    let cancelled = false;

    const ensureToken = async (): Promise<string | null> => {
      let token = getAccessToken();
      if (token) return token;
      try {
        const r = await api.post<{ accessToken?: string }>('/auth/refresh');
        const next = r.data?.accessToken;
        if (typeof next === 'string') {
          setAccessToken(next);
          return next;
        }
      } catch {
        /* session invalid */
      }
      return null;
    };

    const setup = async () => {
      try {
        await refresh();
      } catch {
        /* list can stay empty until socket + retry */
      }
      if (cancelled) return;

      const token = await ensureToken();
      if (cancelled || !token) return;

      const socket = io(getSocketBaseUrl(), {
        path: '/socket.io',
        auth: { token },
        withCredentials: true,
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1500,
      });

      if (cancelled) {
        socket.disconnect();
        return;
      }

      socketRef.current = socket;

      socket.on('connect', () => setIsConnected(true));
      socket.on('disconnect', () => setIsConnected(false));
      socket.on('connect_error', (err: Error) => {
        console.warn('[socket]', err?.message ?? err);
      });

      socket.on('notification:new', (n: AppNotification) => {
        if (seenIdsRef.current.has(n.id)) return;
        seenIdsRef.current.add(n.id);

        setNotifications((prev) => [n, ...prev].slice(0, 80));
        if (!n.readAt) {
          setUnreadCount((c) => c + 1);
        }
        if (!toastedSocketIds.current.has(n.id)) {
          toastedSocketIds.current.add(n.id);
          const message =
            n.body && n.body.trim().length > 0
              ? `${n.title}: ${n.body}`
              : n.title;
          toast.success(message, { duration: 6500 });
        }

        refreshDashboardForNotification(n, userRoleRef.current);
      });
    };

    void setup();

    return () => {
      cancelled = true;
      socketRef.current?.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [user?.id, refresh]);

  const markAsRead = useCallback(async (id: number) => {
    try {
      const res = await api.patch<{
        notification: AppNotification;
        unreadCount: number;
      }>(`/notifications/${id}/read`, {});
      const updated = res.data.notification;
      setNotifications((prev) =>
        prev.map((x) => (x.id === updated.id ? updated : x)),
      );
      setUnreadCount(res.data.unreadCount);
      seenIdsRef.current.add(updated.id);
    } catch {
      await refresh();
    }
  }, [refresh]);

  const markAllRead = useCallback(async () => {
    try {
      await api.post<{ unreadCount: number }>('/notifications/read-all');
    } catch {
      /* table missing or server error */
    }
    await refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      refresh,
      markAsRead,
      markAllRead,
      isConnected,
    }),
    [notifications, unreadCount, refresh, markAsRead, markAllRead, isConnected],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
