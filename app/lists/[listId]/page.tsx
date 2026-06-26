'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import ItemCard from '@/components/items/ItemCard';
import AddItemModal from '@/components/items/AddItemModal';
import { getListById, subscribeItems, isListMember, deleteList } from '@/lib/firebase/firestore';
import { useAuthContext } from '@/lib/AuthContext';
import { List, Item } from '@/types';
import Link from 'next/link';

const COLOR_BG: Record<string, string> = {
  pink: 'from-pink-400 to-pink-300',
  purple: 'from-purple-400 to-purple-300',
  blue: 'from-blue-400 to-blue-300',
  green: 'from-green-400 to-green-300',
  yellow: 'from-yellow-400 to-yellow-300',
  orange: 'from-orange-400 to-orange-300',
  red: 'from-red-400 to-red-300',
  gray: 'from-gray-400 to-gray-300',
};

export default function ListDetailPage() {
  const { listId } = useParams<{ listId: string }>();
  const { user } = useAuthContext();
  const router = useRouter();
  const [list, setList] = useState<List | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const [role, setRole] = useState<string | null>(null);
  const [showAddItem, setShowAddItem] = useState(false);
  const [filterSource, setFilterSource] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    getListById(listId).then(setList);
    if (user) {
      isListMember(listId, user.uid).then((m) => setRole(m?.role || null));
    }
  }, [listId, user]);

  useEffect(() => {
    const unsub = subscribeItems(listId, (incoming) => {
      setItems((prev) => {
        const prevIds = new Set(prev.map((i) => i.id));
        const freshIds = new Set<string>();
        incoming.forEach((i) => { if (!prevIds.has(i.id)) freshIds.add(i.id); });
        if (freshIds.size > 0) {
          setNewIds(freshIds);
          setTimeout(() => setNewIds(new Set()), 3000);
        }
        return incoming;
      });
    });
    return unsub;
  }, [listId]);

  const canEdit = role === 'owner' || role === 'editor';
  const filtered = filterSource ? items.filter((i) => i.sourceType === filterSource) : items;
  const sources = [...new Set(items.map((i) => i.sourceType))];
  const gradient = list ? COLOR_BG[list.color] || 'from-pink-400 to-pink-300' : 'from-pink-400 to-pink-300';

  async function handleDelete() {
    if (!confirm('このリストを削除しますか？')) return;
    await deleteList(listId);
    router.replace('/home');
  }

  return (
    <AppShell>
      {/* Header */}
      <div className={`bg-gradient-to-r ${gradient} px-4 pt-12 pb-6`}>
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => router.back()} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/30 text-white">
            ‹
          </button>
          <div className="flex-1" />
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/30 text-white"
            >
              ⋯
            </button>
            {showMenu && (
              <div className="absolute right-0 top-10 bg-white rounded-2xl shadow-lg border border-gray-100 py-2 min-w-[140px] z-10">
                <Link href={`/lists/${listId}/members`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">メンバー管理</Link>
                <Link href={`/lists/${listId}/invite`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">招待リンク</Link>
                {role === 'owner' && (
                  <button onClick={handleDelete} className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50">削除</button>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-4xl">{list?.emoji || '📋'}</span>
          <div>
            <h1 className="text-xl font-bold text-white">{list?.title || ''}</h1>
            <p className="text-white/70 text-xs mt-0.5">{items.length}件の投稿</p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4">
        {/* Source filter */}
        {sources.length > 1 && (
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setFilterSource('')}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition ${
                !filterSource ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              すべて
            </button>
            {sources.map((s) => (
              <button
                key={s}
                onClick={() => setFilterSource(filterSource === s ? '' : s)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition capitalize ${
                  filterSource === s ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border border-gray-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Items */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="text-5xl mb-4">✨</span>
            <p className="text-gray-500 font-medium">まだ投稿がありません</p>
            <p className="text-gray-400 text-sm mt-1">右下のボタンから追加してみよう</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filtered.map((item) => (
              <ItemCard key={item.id} item={item} isNew={newIds.has(item.id)} />
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      {canEdit && (
        <button
          onClick={() => setShowAddItem(true)}
          className="fixed bottom-24 right-5 w-14 h-14 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full shadow-lg flex items-center justify-center text-white text-2xl z-30 active:scale-90 transition"
        >
          +
        </button>
      )}

      {showAddItem && list && (
        <AddItemModal
          lists={[list]}
          defaultListId={listId}
          onClose={() => setShowAddItem(false)}
        />
      )}

      {showMenu && (
        <div className="fixed inset-0 z-0" onClick={() => setShowMenu(false)} />
      )}
    </AppShell>
  );
}
