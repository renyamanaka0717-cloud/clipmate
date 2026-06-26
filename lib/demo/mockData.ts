import { List, Item, Comment, Reaction } from '@/types';

export const DEMO_USER = {
  uid: 'demo-user-1',
  displayName: 'デモユーザー',
  email: 'demo@clipmate.app',
  photoURL: null,
  emailVerified: true,
};

export const DEMO_LISTS: List[] = [
  { id: 'list-1', title: 'デート', emoji: '❤️', color: 'pink', ownerId: 'demo-user-1', visibility: 'shared', createdAt: new Date(), updatedAt: new Date() },
  { id: 'list-2', title: '食べたい', emoji: '🍜', color: 'orange', ownerId: 'demo-user-1', visibility: 'private', createdAt: new Date(), updatedAt: new Date() },
  { id: 'list-3', title: 'カフェ', emoji: '☕', color: 'yellow', ownerId: 'demo-user-1', visibility: 'private', createdAt: new Date(), updatedAt: new Date() },
  { id: 'list-4', title: '買いたい', emoji: '🛍', color: 'purple', ownerId: 'demo-user-1', visibility: 'private', createdAt: new Date(), updatedAt: new Date() },
  { id: 'list-5', title: '旅行', emoji: '✈️', color: 'blue', ownerId: 'demo-user-1', visibility: 'shared', createdAt: new Date(), updatedAt: new Date() },
  { id: 'list-6', title: 'アイデア', emoji: '💡', color: 'green', ownerId: 'demo-user-1', visibility: 'private', createdAt: new Date(), updatedAt: new Date() },
];

export const DEMO_ITEMS: Item[] = [
  {
    id: 'item-1', listId: 'list-1', url: 'https://www.instagram.com/p/example1/',
    sourceType: 'instagram', title: '🌸 目黒川沿いのおしゃれカフェ「SAKURA STAND」',
    thumbnailUrl: 'https://picsum.photos/seed/cafe1/400/300',
    memo: '桜の季節に絶対行きたい！予約必須らしい', tags: [{ name: 'カフェ', color: '#f97316' }, { name: '目黒', color: '#ec4899' }],
    status: 'want_to_go', addedBy: 'demo-user-1', createdAt: new Date(Date.now() - 3600000), updatedAt: new Date(),
  },
  {
    id: 'item-2', listId: 'list-2', url: 'https://www.tiktok.com/@example/video/123',
    sourceType: 'tiktok', title: '新大久保の本格韓国料理「オルンバン」がやばい件',
    thumbnailUrl: 'https://picsum.photos/seed/korean/400/300',
    memo: 'チーズタッカルビが絶品らしい 辛さ調節できる', tags: [{ name: '韓国料理', color: '#ef4444' }, { name: '新大久保', color: '#a855f7' }],
    status: 'want_to_eat', addedBy: 'demo-user-1', createdAt: new Date(Date.now() - 7200000), updatedAt: new Date(),
  },
  {
    id: 'item-3', listId: 'list-3', url: 'https://www.youtube.com/watch?v=example',
    sourceType: 'youtube', title: '【渋谷】隠れ家カフェ5選！インスタ映えスポットまとめ',
    thumbnailUrl: 'https://picsum.photos/seed/shibuya/400/300',
    memo: '3:24〜のお店気になる', tags: [{ name: '渋谷', color: '#3b82f6' }, { name: 'インスタ映え', color: '#ec4899' }],
    status: 'interested', addedBy: 'demo-user-2', createdAt: new Date(Date.now() - 86400000), updatedAt: new Date(),
  },
  {
    id: 'item-4', listId: 'list-1', url: 'https://www.pinterest.com/pin/example/',
    sourceType: 'pinterest', title: '夜景が綺麗なレストラン デートにおすすめ東京10選',
    thumbnailUrl: 'https://picsum.photos/seed/night/400/300',
    memo: '誕生日に行きたい！', tags: [{ name: '夜景', color: '#6366f1' }, { name: 'デート', color: '#ec4899' }],
    status: 'want_to_go', addedBy: 'demo-user-2', createdAt: new Date(Date.now() - 172800000), updatedAt: new Date(),
  },
  {
    id: 'item-5', listId: 'list-4', url: 'https://x.com/example/status/123',
    sourceType: 'x', title: 'これ欲しすぎる…！Anker新作ワイヤレスイヤホン',
    thumbnailUrl: 'https://picsum.photos/seed/earphones/400/300',
    memo: '次のセールで買う', tags: [{ name: 'ガジェット', color: '#64748b' }],
    status: 'want_to_buy', addedBy: 'demo-user-1', createdAt: new Date(Date.now() - 259200000), updatedAt: new Date(),
  },
  {
    id: 'item-6', listId: 'list-5', url: 'https://www.instagram.com/p/example2/',
    sourceType: 'instagram', title: '京都・嵐山 竹林の小径 朝イチが最高すぎた',
    thumbnailUrl: 'https://picsum.photos/seed/kyoto/400/300',
    memo: '朝8時前に行くと人が少ないらしい', tags: [{ name: '京都', color: '#22c55e' }, { name: '自然', color: '#16a34a' }],
    status: 'want_to_go', addedBy: 'demo-user-1', createdAt: new Date(Date.now() - 345600000), updatedAt: new Date(),
  },
];

export const DEMO_COMMENTS: Comment[] = [
  { id: 'c1', itemId: 'item-1', userId: 'demo-user-2', body: 'ここ行きたい！！🌸', createdAt: new Date(Date.now() - 1800000) },
  { id: 'c2', itemId: 'item-1', userId: 'demo-user-1', body: '土曜どう？予約してみる？', createdAt: new Date(Date.now() - 900000) },
];

export const DEMO_REACTIONS: Reaction[] = [
  { id: 'r1', itemId: 'item-1', userId: 'demo-user-2', type: '❤️', createdAt: new Date() },
  { id: 'r2', itemId: 'item-1', userId: 'demo-user-2', type: '行きたい', createdAt: new Date() },
  { id: 'r3', itemId: 'item-3', userId: 'demo-user-1', type: '👍', createdAt: new Date() },
];
