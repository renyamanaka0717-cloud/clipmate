'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { DEMO_USER, DEMO_LISTS, DEMO_ITEMS, DEMO_COMMENTS, DEMO_REACTIONS } from './mockData';
import { List, Item, Comment, Reaction, ReactionType, Tag, ItemStatus } from '@/types';

interface DemoContextValue {
  isDemo: boolean;
  user: typeof DEMO_USER;
  lists: List[];
  items: Item[];
  comments: Comment[];
  reactions: Reaction[];
  addList: (data: Omit<List, 'id' | 'createdAt' | 'updatedAt'>) => string;
  addItem: (data: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) => string;
  addComment: (itemId: string, body: string) => void;
  toggleReaction: (itemId: string, type: ReactionType) => void;
  deleteItem: (itemId: string) => void;
  updateItemStatus: (itemId: string, status: ItemStatus) => void;
}

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [lists, setLists] = useState<List[]>(DEMO_LISTS);
  const [items, setItems] = useState<Item[]>(DEMO_ITEMS);
  const [comments, setComments] = useState<Comment[]>(DEMO_COMMENTS);
  const [reactions, setReactions] = useState<Reaction[]>(DEMO_REACTIONS);

  function addList(data: Omit<List, 'id' | 'createdAt' | 'updatedAt'>) {
    const id = 'list-' + Date.now();
    setLists(prev => [{ ...data, id, createdAt: new Date(), updatedAt: new Date() }, ...prev]);
    return id;
  }

  function addItem(data: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) {
    const id = 'item-' + Date.now();
    setItems(prev => [{ ...data, id, createdAt: new Date(), updatedAt: new Date() }, ...prev]);
    return id;
  }

  function addComment(itemId: string, body: string) {
    setComments(prev => [...prev, {
      id: 'c-' + Date.now(), itemId, userId: DEMO_USER.uid, body, createdAt: new Date(),
    }]);
  }

  function toggleReaction(itemId: string, type: ReactionType) {
    setReactions(prev => {
      const existing = prev.find(r => r.itemId === itemId && r.userId === DEMO_USER.uid && r.type === type);
      if (existing) return prev.filter(r => r.id !== existing.id);
      return [...prev, { id: 'r-' + Date.now(), itemId, userId: DEMO_USER.uid, type, createdAt: new Date() }];
    });
  }

  function deleteItem(itemId: string) {
    setItems(prev => prev.filter(i => i.id !== itemId));
  }

  function updateItemStatus(itemId: string, status: ItemStatus) {
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, status } : i));
  }

  return (
    <DemoContext.Provider value={{
      isDemo: true, user: DEMO_USER, lists, items, comments, reactions,
      addList, addItem, addComment, toggleReaction, deleteItem, updateItemStatus,
    }}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemoContext() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error('useDemoContext must be used within DemoProvider');
  return ctx;
}
