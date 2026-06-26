'use client';

import { useState, useEffect, useCallback } from 'react';
import AppShell from '@/components/layout/AppShell';
import ItemCard from '@/components/items/ItemCard';
import { useAuthContext } from '@/lib/AuthContext';
import { subscribeLists, getRecentItems } from '@/lib/firebase/firestore';
import { List, Item, SourceType } from '@/types';

const SOURCE_FILTERS: { key: SourceType | ''; label: string }[] = [
  { key: '', label: 'すべて' },
  { key: 'instagram', label: '📸 Instagram' },
  { key: 'tiktok', label: '🎵 TikTok' },
  { key: 'youtube', label: '▶️ YouTube' },
  { key: 'threads', label: '🧵 Threads' },
  { key: 'pinterest', label: '📌 Pinterest' },
  { key: 'x', label: '✖️ X' },
  { key: 'other', label: '🔗 その他' },
];

export default function SearchPage() {
  const { user } = useAuthContext();
  const [query, setQuery] = useState('');
  const [source, setSource] = useState<SourceType | ''>('');
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [lists, setLists] = useState<List[]>([]);
  const [results, setResults] = useState<Item[]>([]);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeLists(user.uid, setLists);
    return unsub;
  }, [user]);

  useEffect(() => {
    if (!user) return;
    getRecentItems(user.uid, 200).then(setAllItems);
  }, [user]);

  const search = useCallback(() => {
    let filtered = allItems;
    if (source) filtered = filtered.filter((i) => i.sourceType === source);
    if (query.trim()) {
      const q = query.toLowerCase();
      filtered = filtered.filter((i) =>
        i.title?.toLowerCase().includes(q) ||
        i.memo?.toLowerCase().includes(q) ||
        i.url?.toLowerCase().includes(q) ||
        i.tags?.some((t) => t.name.toLowerCase().includes(q)) ||
        lists.find((l) => l.id === i.listId)?.title?.toLowerCase().includes(q)
      );
    }
    setResults(filtered);
  }, [query, source, allItems, lists]);

  useEffect(() => { search(); }, [search]);

  const listMap = new Map(lists.map((l) => [l.id, l]));

  return (
    <AppShell>
      <div className="px-4 pt-12 pb-4">
        <h1 className="text-xl font-bold text-gray-900 mb-4">検索</h1>

        {/* Search input */}
        <div className="relative mb-4">
          <svg className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="タイトル・メモ・タグ・リスト名で検索"
            className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl border border-gray-200 shadow-sm text-sm outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition"
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-4 top-3.5 text-gray-400">✕</button>
          )}
        </div>

        {/* Source filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
          {SOURCE_FILTERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSource(key)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition border ${
                source === key ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Results */}
        <p className="text-xs text-gray-400 mb-3">
          {results.length}件{query || source ? 'が見つかりました' : 'の投稿'}
        </p>

        {results.length === 0 && (query || source) ? (
          <div className="flex flex-col items-center py-20 text-center">
            <span className="text-4xl mb-3">🔍</span>
            <p className="text-gray-500 font-medium">見つかりませんでした</p>
            <p className="text-gray-400 text-sm mt-1">別のキーワードで試してみよう</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {results.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                showList
                listTitle={listMap.get(item.listId)?.title}
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
