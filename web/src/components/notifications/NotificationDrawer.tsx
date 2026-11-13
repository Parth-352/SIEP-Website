"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, Task, ResearchMaterial } from '@/lib/types';
import {
  DeckNotification,
  generateDeckNotifications,
  markNotificationAsRead,
  requestBrowserNotificationPermission,
  isNativeNotificationEnabled,
  setNativeNotificationEnabled,
  sendNativeNotification,
} from '@/lib/notifications';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  tasks?: Task[];
  materials?: ResearchMaterial[];
}

export default function NotificationDrawer({
  isOpen,
  onClose,
  user,
  tasks = [],
  materials = [],
}: NotificationDrawerProps) {
  const [activeTab, setActiveTab] = useState<'my_deck' | 'all'>('my_deck');
  const [notifications, setNotifications] = useState<DeckNotification[]>([]);
  const [nativePermission, setNativePermission] = useState<NotificationPermission>('default');
  const [nativeEnabled, setNativeEnabled] = useState<boolean>(false);

  // Sync native notification status
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNativePermission(Notification.permission);
      setNativeEnabled(isNativeNotificationEnabled() && Notification.permission === 'granted');
    }
  }, [isOpen]);

  // Generate notifications
  useEffect(() => {
    const list = generateDeckNotifications(user, tasks, materials);
    setNotifications(list);

    // If native notifications are enabled and there are urgent reminders, notify user
    if (nativeEnabled && list.length > 0) {
      const urgentUnread = list.find((n) => n.priority === 'urgent' && !n.read);
      if (urgentUnread) {
        sendNativeNotification(urgentUnread.title, {
          body: urgentUnread.message,
          tag: urgentUnread.id,
          url: urgentUnread.targetUrl,
        });
      }
    }
  }, [user, tasks, materials, nativeEnabled]);

  const handleToggleNative = async () => {
    if (nativePermission !== 'granted') {
      const result = await requestBrowserNotificationPermission();
      setNativePermission(result);
      if (result === 'granted') {
        setNativeEnabled(true);
        sendNativeNotification('SIEP Riders Bay Alerts Enabled', {
          body: "You will now receive personal task deadlines, review requests, and squad alerts directly on your device.",
          url: '/dashboard',
        });
      }
    } else {
      const next = !nativeEnabled;
      setNativeEnabled(next);
      setNativeNotificationEnabled(next);
    }
  };

  const handleMarkAsRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    markNotificationAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllRead = () => {
    notifications.forEach((n) => markNotificationAsRead(n.id));
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const filteredNotifications = useMemo(() => {
    if (activeTab === 'my_deck') {
      return notifications.filter((n) => n.isPersonalDeck);
    }
    return notifications;
  }, [notifications, activeTab]);

  const unreadCount = filteredNotifications.filter((n) => !n.read).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex justify-end animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-jet-black/60 backdrop-blur-xs transition-opacity cursor-pointer"
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 border-l border-slate-200/80 animate-in slide-in-from-right duration-300 font-sans">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Personal Deck Alerts</h3>
              <p className="text-[11px] text-slate-500">
                {user?.displayName ? `Personalized for ${user.displayName}` : 'Team notifications & deck alerts'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close drawer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Native Browser Notifications Card */}
        <div className="p-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white border-b border-slate-700 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-amber-400">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-xs font-bold">Native Device Alerts (PWA)</span>
            </div>

            <button
              type="button"
              onClick={handleToggleNative}
              className={`text-[11px] font-bold px-3 py-1 rounded-full transition-all cursor-pointer ${
                nativeEnabled
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {nativeEnabled ? 'Enabled' : 'Enable Alerts'}
            </button>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Receive native OS alerts on this device when tasks in your deck are approaching deadlines or deliverables require squad sign-off.
          </p>
        </div>

        {/* Tabs & Mark All Read */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('my_deck')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'my_deck'
                  ? 'bg-orange-50 text-orange-600 border border-orange-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>My Deck</span>
              {unreadCount > 0 && activeTab === 'my_deck' && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-orange-500 text-white text-[10px]">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>All Alerts</span>
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              Mark all read
            </button>
          )}
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y-0">
          {filteredNotifications.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-xs font-bold text-slate-700">All caught up!</p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                No active task deadlines, review requests, or squad notices pending for your deck right now.
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif) => {
              const priorityClass =
                notif.priority === 'urgent'
                  ? 'border-rose-200 bg-rose-50/50'
                  : notif.priority === 'high'
                  ? 'border-amber-200 bg-amber-50/40'
                  : 'border-slate-200/90 bg-white';

              const icon =
                notif.type === 'reminder' ? (
                  <svg className="w-4 h-4 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : notif.type === 'review_needed' ? (
                  <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                );

              return (
                <div
                  key={notif.id}
                  onClick={() => {
                    markNotificationAsRead(notif.id);
                    window.location.href = notif.targetUrl;
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative group shadow-2xs hover:shadow-xs ${priorityClass} ${
                    notif.read ? 'opacity-70' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                      {icon}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          {notif.teamName && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-200/70 text-slate-700 uppercase tracking-wider">
                              {notif.teamName}
                            </span>
                          )}
                          {!notif.read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                          )}
                        </div>

                        <span className="text-[10px] text-slate-400">
                          {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {notif.title}
                      </h4>
                      <p className="text-[11px] text-slate-600 leading-snug">
                        {notif.message}
                      </p>

                      <div className="pt-1.5 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-orange-600 group-hover:underline inline-flex items-center gap-0.5">
                          <span>Open details</span>
                          <span>&rarr;</span>
                        </span>

                        {!notif.read && (
                          <button
                            type="button"
                            onClick={(e) => handleMarkAsRead(notif.id, e)}
                            className="text-[10px] text-slate-400 hover:text-slate-700 cursor-pointer"
                          >
                            Mark read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
