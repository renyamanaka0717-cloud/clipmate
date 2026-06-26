'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import { getListById, getListMembers, updateMemberRole, removeMember, isListMember } from '@/lib/firebase/firestore';
import { useAuthContext } from '@/lib/AuthContext';
import { List, ListMember, MemberRole } from '@/types';
import { useUsers } from '@/hooks/useUsers';

const ROLE_LABELS: Record<MemberRole, string> = {
  owner: '👑 オーナー',
  editor: '✏️ 編集',
  viewer: '👁 閲覧のみ',
};

export default function MembersPage() {
  const { listId } = useParams<{ listId: string }>();
  const { user } = useAuthContext();
  const router = useRouter();
  const [list, setList] = useState<List | null>(null);
  const [members, setMembers] = useState<ListMember[]>([]);
  const [myRole, setMyRole] = useState<string | null>(null);
  const users = useUsers(members.map((m) => m.userId));

  useEffect(() => {
    getListById(listId).then(setList);
    getListMembers(listId).then(setMembers);
    if (user) {
      isListMember(listId, user.uid).then((m) => setMyRole(m?.role || null));
    }
  }, [listId, user]);

  async function handleRoleChange(member: ListMember, role: MemberRole) {
    await updateMemberRole(member.id, role);
    setMembers((prev) => prev.map((m) => m.id === member.id ? { ...m, role } : m));
  }

  async function handleRemove(member: ListMember) {
    if (!confirm('このメンバーをリストから削除しますか？')) return;
    await removeMember(member.id);
    setMembers((prev) => prev.filter((m) => m.id !== member.id));
  }

  return (
    <AppShell>
      <div className="px-4 pt-12">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100">‹</button>
          <h1 className="text-lg font-bold text-gray-900">メンバー管理</h1>
        </div>

        <div className="space-y-3">
          {members.map((member) => {
            const u = users.get(member.userId);
            const isMe = member.userId === user?.uid;
            return (
              <div key={member.id} className="bg-white rounded-2xl p-4 flex items-center gap-3 border border-gray-100">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center font-bold text-gray-600">
                  {u?.displayName?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm">{u?.displayName || '...'} {isMe && <span className="text-xs text-gray-400">(自分)</span>}</p>
                  <p className="text-xs text-gray-400">{u?.email}</p>
                </div>
                {myRole === 'owner' && !isMe ? (
                  <div className="flex items-center gap-2">
                    <select
                      value={member.role}
                      onChange={(e) => handleRoleChange(member, e.target.value as MemberRole)}
                      className="text-xs border border-gray-200 rounded-xl px-2 py-1 bg-white"
                    >
                      {(['editor', 'viewer'] as MemberRole[]).map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                    <button onClick={() => handleRemove(member)} className="text-red-400 text-sm">✕</button>
                  </div>
                ) : (
                  <span className="text-xs text-gray-500">{ROLE_LABELS[member.role]}</span>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4">
          <button
            onClick={() => router.push(`/lists/${listId}/invite`)}
            className="w-full py-3 border-2 border-dashed border-pink-300 rounded-2xl text-pink-500 text-sm font-medium"
          >
            + 招待リンクを作成
          </button>
        </div>
      </div>
    </AppShell>
  );
}
