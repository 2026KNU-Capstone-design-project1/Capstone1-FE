import { useMemo, useState } from 'react';
import AppIcon from './components/AppIcon';
import { workerMock } from './data/workerMock';

export default function WorkerNotificationsPage() {
  const [notifications, setNotifications] = useState(workerMock.notifications);
  const unreadCount = useMemo(() => notifications.filter(item => item.unread).length, [notifications]);

  function markRead(id) {
    setNotifications(items => items.map(item => item.id === id ? { ...item, unread: false } : item));
  }

  return (
    <section aria-labelledby="worker-notifications-title">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[13px] font-medium text-[#7b868e]">읽지 않은 알림 {unreadCount}개</p>
          <h1 id="worker-notifications-title" className="mt-1 text-[28px] font-black tracking-[-1.2px]">알림</h1>
        </div>
        <button className="pb-1 text-[13px] font-bold text-app-accent disabled:opacity-40" type="button" disabled={!unreadCount} onClick={() => setNotifications(items => items.map(item => ({ ...item, unread: false })))}>모두 읽음</button>
      </div>

      <div className="mt-6 overflow-hidden rounded-[24px] bg-white">
        {notifications.map(notification => (
          <button key={notification.id} className={`flex w-full gap-3 border-b border-[#edf0f2] p-5 text-left last:border-0 ${notification.unread ? 'bg-[#fffaf6]' : ''}`} type="button" onClick={() => markRead(notification.id)}>
            <span className={`relative grid h-11 w-11 shrink-0 place-items-center rounded-full ${notification.unread ? 'bg-[#fff0e5] text-app-accent' : 'bg-[#f0f3f5] text-[#7c878f]'}`}>
              <AppIcon name="bell" className="h-5 w-5" />
              {notification.unread && <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-app-accent" />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-extrabold leading-5">{notification.title}</span>
              <span className="mt-1 block text-[13px] text-[#6c7881]">{notification.body}</span>
              <span className="mt-2 block text-[11px] text-[#99a2a8]">{notification.time}</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
