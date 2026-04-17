'use client';

import Button from '@/components/ui/Button';

type NotificationItem = {
  id: number;
  title: string;
  body?: string | null;
  readAt?: string | null;
  createdAt: string;
};

type Props = {
  notifications: NotificationItem[];
  unreadCount: number;
  markAsRead: (id: number) => Promise<void> | void;
  markAllRead: () => Promise<void> | void;
  formatWhen: (iso: string) => string;
};

export default function NotificationsPanel({
  notifications,
  unreadCount,
  markAsRead,
  markAllRead,
  formatWhen,
}: Props) {
  return (
    <div className='flex min-h-0 flex-col gap-3'>
      <div className='flex items-center justify-between gap-2'>
        <p className='text-xs text-muted-foreground'>
          {unreadCount > 0 ? `${unreadCount} unread` : 'You are all caught up'}
        </p>
        {unreadCount > 0 ? (
          <Button
            type='button'
            variant='ghost'
            className='h-auto! px-2! py-1! text-xs! text-primary!'
            onClick={() => void markAllRead()}
          >
            Mark all read
          </Button>
        ) : null}
      </div>
      <div className='max-h-[calc(100vh-8rem)] space-y-2 overflow-y-auto pr-1'>
        {notifications.length === 0 ? (
          <p className='text-sm text-muted-foreground'>No notifications</p>
        ) : (
          notifications.map((n) => (
            <button
              key={n.id}
              type='button'
              onClick={() => {
                if (!n.readAt) void markAsRead(n.id);
              }}
              className={`w-full rounded-lg border border-border p-3 text-left text-sm transition-colors hover:bg-muted/50 ${
                n.readAt ? 'opacity-80' : 'border-primary/25 bg-primary/5'
              }`}
            >
              <div className='font-medium text-card-foreground'>{n.title}</div>
              {n.body ? <p className='mt-1 text-xs text-muted-foreground'>{n.body}</p> : null}
              <p className='mt-2 text-[10px] text-muted-foreground'>{formatWhen(n.createdAt)}</p>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
