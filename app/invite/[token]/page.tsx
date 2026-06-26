'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getInvitationByToken, getListById, acceptInvitation } from '@/lib/firebase/firestore';
import { useAuthContext } from '@/lib/AuthContext';
import { Invitation, List } from '@/types';

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const { user, loading } = useAuthContext();
  const router = useRouter();
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [list, setList] = useState<List | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'expired' | 'joined' | 'error'>('loading');

  useEffect(() => {
    getInvitationByToken(token).then(async (inv) => {
      if (!inv) { setStatus('error'); return; }
      if (inv.expiresAt < new Date()) { setStatus('expired'); return; }
      setInvitation(inv);
      const l = await getListById(inv.listId);
      setList(l);
      setStatus('ready');
    });
  }, [token]);

  async function handleJoin() {
    if (!user || !invitation) return;
    try {
      await acceptInvitation(invitation, user.uid);
      setStatus('joined');
      setTimeout(() => router.push(`/lists/${invitation.listId}`), 1500);
    } catch {
      setStatus('error');
    }
  }

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-pink-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 flex flex-col items-center justify-center px-4">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">📎</div>
          <h1 className="text-2xl font-bold text-gray-900">ClipMateに招待されました</h1>
          {list && <p className="text-gray-500 mt-2">「{list.emoji} {list.title}」に参加する</p>}
        </div>
        <button
          onClick={() => router.push(`/login?redirect=/invite/${token}`)}
          className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-2xl font-semibold shadow-sm"
        >
          ログインして参加する
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 flex flex-col items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-sm p-8 w-full max-w-sm text-center">
        {status === 'expired' && (
          <>
            <div className="text-4xl mb-3">⏰</div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">招待リンクの期限切れ</h2>
            <p className="text-sm text-gray-500">このリンクはすでに有効期限が切れています。招待者に新しいリンクを作成してもらってください。</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="text-4xl mb-3">❌</div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">無効なリンク</h2>
            <p className="text-sm text-gray-500">このリンクは無効です。</p>
          </>
        )}
        {status === 'joined' && (
          <>
            <div className="text-4xl mb-3">✅</div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">参加しました！</h2>
            <p className="text-sm text-gray-500">リストに移動します...</p>
          </>
        )}
        {status === 'ready' && invitation && list && (
          <>
            <div className="text-5xl mb-3">{list.emoji}</div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">「{list.title}」に招待されています</h2>
            <p className="text-sm text-gray-500 mb-6">
              {invitation.role === 'editor' ? '✏️ 編集権限' : '👁 閲覧権限'}で参加できます
            </p>
            <button
              onClick={handleJoin}
              className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-2xl font-semibold"
            >
              参加する
            </button>
          </>
        )}
        <button onClick={() => router.push('/home')} className="mt-4 text-sm text-gray-400 underline">ホームへ戻る</button>
      </div>
    </div>
  );
}
