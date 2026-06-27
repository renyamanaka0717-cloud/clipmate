'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import ItemCard from '@/components/items/ItemCard';
import AddItemModal from '@/components/items/AddItemModal';
import CreateListModal from '@/components/lists/CreateListModal';
import { subscribeLists, getRecentItems } from '@/lib/firebase/firestore';
import { useAuthContext } from '@/lib/AuthContext';
import { List, Item } from '@/types';

function ChevronRight() {
  return (
    <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

export default function HomePage() {
  const { user } = useAuthContext();
  const router = useRouter();
  const [lists, setLists] = useState<List[]>([]);
  const [recentItems, setRecentItems] = useState<Item[]>([]);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showCreateList, setShowCreateList] = useState(false);
  const [newItemIds, setNewItemIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    return subscribeLists(user.uid, setLists);
  }, [user]);

  const loadRecent = useCallback(async () => {
    if (!user) return;
    setRecentItems(await getRecentItems(user.uid, 10));
  }, [user]);

  useEffect(() => { loadRecent(); }, [loadRecent]);

  const topLevelLists = lists.filter((l) => !l.parentId);
  const myLists = topLevelLists.filter((l) => l.ownerId === user?.uid);
  const sharedLists = topLevelLists.filter((l) => l.ownerId !== user?.uid);

  return (
    <AppShell>
      <div className="px-4 pt-12 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">📎 ClipMate</h1>
            <p className="text-xs text-gray-400 mt-0.5">お気に入りを、一緒に。</p>
          </div>
          <button
            onClick={() => router.push('/settings')}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.43.992a6.759 6.759 0 010 .255c-.008.378.137.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>

        {/* Search bar */}
        <button
          onClick={() => router.push('/search')}
          className="w-full flex items-center gap-3 px-4 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm mb-6 text-gray-400 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          「前に見たあの投稿...」を探す
        </button>

        {/* My Lists - Explorer style */}
        <section className="mb-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1 mb-2">マイリスト</p>
          <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
            {myLists.length === 0 && (
              <div className="px-4 py-5 text-center text-gray-400 text-sm">
                リストがまだありません
              </div>
            )}
            {myLists.map((list, i) => (
              <div key={list.id}>
                <button
                  onClick={() => router.push(`/lists/${list.id}`)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-gray-50 transition text-left"
                >
                  <span className="text-2xl w-9 text-center flex-shrink-0">{list.emoji}</span>
                  <span className="flex-1 font-medium text-gray-900 text-sm">{list.title}</span>
                  <ChevronRight />
                </button>
                {i < myLists.length - 1 && <div className="ml-16 h-px bg-gray-100" />}
              </div>
            ))}
            <div className={myLists.length > 0 ? 'border-t border-gray-100' : ''}>
              <button
                onClick={() => setShowCreateList(true)}
                className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-pink-50 transition text-left"
              >
                <span className="w-9 h-9 flex items-center justify-center rounded-full bg-pink-100 text-pink-500 text-lg flex-shrink-0">+</span>
                <span className="text-sm font-medium text-pink-500">新しいリストを作成</span>
              </button>
            </div>
          </div>
        </section>

        {/* Shared Lists */}
        {sharedLists.length > 0 && (
          <section className="mb-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1 mb-2">共有リスト</p>
            <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
              {sharedLists.map((list, i) => (
                <div key={list.id}>
                  <button
                    onClick={() => router.push(`/lists/${list.id}`)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-gray-50 transition text-left"
                  >
                    <span className="text-2xl w-9 text-center flex-shrink-0">{list.emoji}</span>
                    <span className="flex-1 font-medium text-gray-900 text-sm">{list.title}</span>
                    <ChevronRight />
                  </button>
                  {i < sharedLists.length - 1 && <div className="ml-16 h-px bg-gray-100" />}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recent Items */}
        {recentItems.length > 0 && (
          <section>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1 mb-2">最近追加した投稿</p>
            <div className="grid grid-cols-1 gap-3">
              {recentItems.map((item) => (
                <ItemCard key={item.id} item={item} isNew={newItemIds.has(item.id)} showList />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowAddItem(true)}
        className="fixed bottom-24 right-5 w-14 h-14 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full shadow-lg flex items-center justify-center text-white text-2xl z-30 active:scale-90 transition"
      >
        +
      </button>

      {showAddItem && (
        <AddItemModal
          lists={lists}
          onClose={() => setShowAddItem(false)}
          onAdded={loadRecent}
        />
      )}
      {showCreateList && (
        <CreateListModal onClose={() => setShowCreateList(false)} />
      )}
    </AppShell>
  );
}
