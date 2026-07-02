'use client';

import { useRouter } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import { useAuthContext } from '@/lib/AuthContext';
import { useTheme } from '@/lib/ThemeContext';
import { THEMES, ThemeName } from '@/lib/theme';
import { ChevronLeft, Bell, Moon, Share2 } from 'lucide-react';

export default function SettingsPage() {
  const { user, logout } = useAuthContext();
  const { themeName, setTheme } = useTheme();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.replace('/login');
  }

  return (
    <AppShell>
      <div className="px-4 pt-12 pb-4">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500"><ChevronLeft size={18} strokeWidth={2} /></button>
          <h1 className="text-lg font-bold text-gray-900">設定</h1>
        </div>

        {/* Profile */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm mb-4">
          <p className="text-xs font-medium text-gray-400 mb-3 uppercase tracking-wide">アカウント</p>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-300 to-purple-300 flex items-center justify-center text-lg font-bold text-white">
              {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{user?.displayName}</p>
              <p className="text-xs text-gray-400">{user?.email}</p>
            </div>
          </div>
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
              <span className="text-sm text-gray-700">プラン</span>
              <span className="text-sm text-gray-400">無料</span>
            </div>
          </div>
        </div>

        {/* Theme Color */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm mb-4">
          <p className="text-xs font-medium text-gray-400 mb-4 uppercase tracking-wide">テーマカラー</p>
          <div className="flex gap-4 flex-wrap">
            {THEMES.map((t) => {
              const active = themeName === t.name;
              return (
                <button
                  key={t.name}
                  onClick={() => setTheme(t.name as ThemeName)}
                  className="flex flex-col items-center gap-1.5"
                >
                  <div
                    className="w-11 h-11 rounded-full transition-transform"
                    style={{
                      backgroundColor: t.primary,
                      outline: active ? `3px solid ${t.primary}` : '3px solid transparent',
                      outlineOffset: '2px',
                      transform: active ? 'scale(1.1)' : 'scale(1)',
                    }}
                  />
                  <span
                    className="text-[10px] font-medium"
                    style={{ color: active ? t.primary : '#9ca3af' }}
                  >
                    {t.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Coming soon */}
        <div className="bg-gray-50 rounded-3xl p-5 border border-dashed border-gray-200 mb-4">
          <p className="text-xs font-medium text-gray-400 mb-2">近日公開予定</p>
          <ul className="space-y-2">
            {[
              { Icon: Bell,   label: 'プッシュ通知' },
              { Icon: Moon,   label: 'ダークモード' },
              { Icon: Share2, label: 'PWA対応' },
            ].map(({ Icon, label }) => (
              <li key={label} className="flex items-center gap-2 text-sm text-gray-400">
                <Icon size={14} strokeWidth={1.8} />
                {label}
              </li>
            ))}
          </ul>
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
