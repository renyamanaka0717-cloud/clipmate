'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Pencil, Eye } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { createInvitation, getListById } from '@/lib/firebase/firestore';
import { useAuthContext } from '@/lib/AuthContext';
import { List, MemberRole } from '@/types';
import { nanoid } from 'nanoid';

export default function InvitePage() {
  const { listId } = useParams<{ listId: string }>();
  const { user } = useAuthContext();
  const router = useRouter();
  const [list, setList] = useState<List | null>(null);
  const [role, setRole] = useState<MemberRole>('editor');
  const [inviteUrl, setInviteUrl] = useState('');
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getListById(listId).then(setList);
  }, [listId]);

  async function createLink() {
    if (!user) return;
    setCreating(true);
    const token = nanoid(16);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await createInvitation({ listId, token, role, expiresAt, createdBy: user.uid });
    const url = `${window.location.origin}/invite/${token}`;
    setInviteUrl(url);
    setCreating(false);
  }

  async function copyLink() {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const ROLE_OPTIONS: { key: MemberRole; label: string; Icon: React.ComponentType<{ size?: number; strokeWidth?: number }> }[] = [
    { key: 'editor', label: '編集可', Icon: Pencil },
    { key: 'viewer', label: '閲覧のみ', Icon: Eye },
  ];

  return (
    <AppShell>
      <div className="px-4 pt-12">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500">
            <ChevronLeft size={18} strokeWidth={2} />
          </button>
          <h1 className="text-lg font-bold text-gray-900">招待リンク</h1>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-600 mb-4">
            「<strong>{list?.title}</strong>」への招待リンクを作成します。リンクを受け取った人はログイン後に参加できます。
          </p>

          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-600 mb-2">権限</label>
            <div className="flex gap-2">
              {ROLE_OPTIONS.map(({ key, label, Icon }) => (
                <button
                  key={key}
                  onClick={() => setRole(key)}
                  className={`flex-1 py-2 rounded-xl text-sm border transition flex items-center justify-center gap-1.5 ${
                    role === key ? 'bg-pink-50 border-pink-300 text-pink-700 font-medium' : 'bg-gray-50 border-gray-200 text-gray-600'
                  }`}
                >
                  <Icon size={13} strokeWidth={2} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {!inviteUrl ? (
            <button
              onClick={createLink}
              disabled={creating}
              className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-2xl font-medium text-sm disabled:opacity-50"
            >
              {creating ? '作成中...' : 'リンクを作成'}
            </button>
          ) : (
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-2xl p-3 break-all text-xs text-gray-600 border border-gray-200">
                {inviteUrl}
              </div>
              <button
                onClick={copyLink}
                className={`w-full py-3 rounded-2xl font-medium text-sm transition ${
                  copied ? 'bg-green-500 text-white' : 'bg-gray-900 text-white'
                }`}
              >
                {copied ? '✓ コピーしました！' : 'リンクをコピー'}
              </button>
              <p className="text-center text-xs text-gray-400">有効期限：7日間</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
