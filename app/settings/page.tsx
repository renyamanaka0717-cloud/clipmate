'use client';

import { useRouter } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import { useAuthContext } from '@/lib/AuthContext';

export default function SettingsPage() {
  const { user, logout } = useAuthContext();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.replace('/login');
  }

  async function requestNotificationPermission() {
    if (!('Notification' in window)) {
      alert('このブラウザは通知をサポートしていません');
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      alert('通知が有効になりました！');
    } else {
      alert('通知が拒否されました。ブラウザの設定から許可してください。');
    }
  }

  return (
    <AppShell>
      <div className="px-4 pt-12 pb-4">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100">‹</button>
          <h1 className="text-lg font-bold text-gray-900">設定</h1>
        </div>

        {/* Profile Section */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm mb-4">
          <p className="text-xs font-medium text-gray-400 mb-3 uppercase tracking-wide">アカウント</p>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-300 to-purple-300 flex items-center justify-center text-lg font-bold text-white">
              {user?.displayName?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{user?.displayName}</p>
              <p className="text-xs text-gray-400">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm mb-4">
          <p className="text-xs font-medium text-gray-400 mb-3 uppercase tracking-wide">通知</p>
          <button
            onClick={requestNotificationPermission}
            className="w-full flex items-center justify-between py-2"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">🔔</span>
              <span className="text-sm font-medium text-gray-900">プッシュ通知を許可</span>
            </div>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>

        {/* App Info */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm mb-4">
          <p className="text-xs font-medium text-gray-400 mb-3 uppercase tracking-wide">アプリについて</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-gray-700">バージョン</span>
              <span className="text-sm text-gray-400">1.0.0</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-gray-700">ClipMate</span>
              <span className="text-sm text-gray-400">お気に入りを、一緒に。</span>
            </div>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full py-3 bg-red-50 text-red-500 rounded-2xl font-medium text-sm border border-red-100 active:scale-95 transition"
        >
          ログアウト
        </button>
      </div>
    </AppShell>
  );
}
