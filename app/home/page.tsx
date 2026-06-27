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
import { ChevronRight, Settings, Search as SearchIcon, Paperclip } from 'lucide-react';
import ListIcon from '@/components/lists/ListIcon';

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
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Paperclip size={22} className="text-pink-500" strokeWidth={2.2} />
              ClipMate
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">お気に入りを、一緒に。</p>
          </div>
          <button
            onClick={() => router.push('/settings')}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-500"
          >
            <Settings size={18} strokeWidth={1.6} />
          </button>
        </div>

        {/* Search bar */}
        <button
          onClick={() => router.push('/search')}
          className="w-full flex items-center gap-3 px-4 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm mb-6 text-gray-400 text-sm"
        >
          <SearchIcon size={16} strokeWidth={2} />
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
                  <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 flex-shrink-0">
                    <ListIcon name={list.emoji} size={18} className="text-gray-600" />
                  </div>
                  <span className="flex-1 font-medium text-gray-900 text-sm">{list.title}</span>
                  <ChevronRight size={16} className="text-gray-300 flex-shrink-0" strokeWidth={2.5} />
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
                    <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 flex-shrink-0">
                      <ListIcon name={list.emoji} size={18} className="text-gray-600" />
                    </div>
                    <span className="flex-1 font-medium text-gray-900 text-sm">{list.title}</span>
                    <ChevronRight size={16} className="text-gray-300 flex-shrink-0" strokeWidth={2.5} />
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
