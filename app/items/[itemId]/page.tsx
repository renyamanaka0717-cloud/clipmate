'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ChevronLeft, Paperclip, User, MapPin, Map, Pencil, Heart, ThumbsUp, Eye, Sparkles, ExternalLink } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import SourceBadge from '@/components/ui/SourceBadge';
import StatusBadge, { STATUS_LABEL } from '@/components/ui/StatusBadge';
import ListIcon from '@/components/lists/ListIcon';
import {
  getItem, getListById, deleteItem, updateItem,
  subscribeComments, addComment, deleteComment,
  subscribeReactions, toggleReaction,
} from '@/lib/firebase/firestore';
import { useAuthContext } from '@/lib/AuthContext';
import { useUser } from '@/hooks/useUsers';
import { Item, List, Comment, Reaction, ReactionType, ItemStatus } from '@/types';

const REACTION_TYPES: ReactionType[] = ['❤️', '👍', '👀', '行きたい', '気になる'];

type ReactionConfig = {
  Icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  label: string;
  activeClass: string;
};

const REACTION_CONFIG: Record<ReactionType, ReactionConfig> = {
  '❤️':    { Icon: Heart,     label: 'いいね',  activeClass: 'bg-red-100 border-red-300 text-red-600' },
  '👍':    { Icon: ThumbsUp,  label: 'Good',    activeClass: 'bg-blue-100 border-blue-300 text-blue-600' },
  '👀':    { Icon: Eye,       label: 'チェック', activeClass: 'bg-purple-100 border-purple-300 text-purple-600' },
  '行きたい': { Icon: MapPin,  label: '行きたい', activeClass: 'bg-green-100 border-green-300 text-green-600' },
  '気になる': { Icon: Sparkles, label: '気になる', activeClass: 'bg-amber-100 border-amber-300 text-amber-600' },
};

export default function ItemDetailPage() {
  const { itemId } = useParams<{ itemId: string }>();
  const { user } = useAuthContext();
  const router = useRouter();
  const [item, setItem] = useState<Item | null>(null);
  const [list, setList] = useState<List | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [commentText, setCommentText] = useState('');
  const [editingStatus, setEditingStatus] = useState(false);
  const [imgError, setImgError] = useState(false);
  const addedByUser = useUser(item?.addedBy);

  useEffect(() => {
    getItem(itemId).then((i) => {
      setItem(i);
      if (i) getListById(i.listId).then(setList);
    });
    const unsubComments = subscribeComments(itemId, setComments);
    const unsubReactions = subscribeReactions(itemId, setReactions);
    return () => { unsubComments(); unsubReactions(); };
  }, [itemId]);

  async function handleAddComment() {
    if (!commentText.trim() || !user) return;
    await addComment({ itemId, userId: user.uid, body: commentText.trim() });
    setCommentText('');
  }

  async function handleReaction(type: ReactionType) {
    if (!user) return;
    await toggleReaction(itemId, user.uid, type);
  }

  async function handleStatusChange(status: ItemStatus) {
    if (!item) return;
    await updateItem(itemId, { status });
    setItem({ ...item, status });
    setEditingStatus(false);
  }

  async function handleDelete() {
    if (!confirm('この投稿を削除しますか？')) return;
    await deleteItem(itemId);
    router.back();
  }

  const reactionCounts = REACTION_TYPES.reduce((acc, type) => {
    acc[type] = reactions.filter((r) => r.type === type).length;
    return acc;
  }, {} as Record<ReactionType, number>);

  const myReactions = new Set(reactions.filter((r) => r.userId === user?.uid).map((r) => r.type));

  if (!item) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-pink-400 border-t-transparent rounded-full animate-spin" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      {/* Thumbnail */}
      <div className="relative">
        {item.thumbnailUrl && !imgError ? (
          <div className="relative w-full aspect-video bg-gray-100">
            <Image src={item.thumbnailUrl} alt={item.title} fill className="object-cover" onError={() => setImgError(true)} unoptimized />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent" />
          </div>
        ) : (
          <div className="w-full aspect-video bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
            <Paperclip size={48} className="text-pink-300 opacity-40" strokeWidth={1.5} />
          </div>
        )}
        <button
          onClick={() => router.back()}
          className="absolute top-12 left-4 w-9 h-9 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm text-gray-700 shadow"
        >
          <ChevronLeft size={20} strokeWidth={2} />
        </button>
      </div>

      <div className="px-4 pt-4 pb-8">
        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <SourceBadge type={item.sourceType} size="md" />
          {item.status && <StatusBadge status={item.status} />}
          {list && (
            <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
              <ListIcon name={list.emoji} size={11} className="text-gray-500" />
              {list.title}
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-lg font-bold text-gray-900 leading-snug mb-2">{item.title}</h1>

        {/* Meta */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
          <User size={12} strokeWidth={1.8} />
          <span>{addedByUser?.displayName || '...'}</span>
          <span>·</span>
          <span>{item.createdAt.toLocaleDateString('ja-JP')}</span>
        </div>

        {/* Description (auto-fetched) */}
        {item.description && (
          <div className="bg-gray-50 rounded-2xl p-3 mb-3">
            <p className="text-xs text-gray-400 font-medium mb-1">
              {item.siteName ? item.siteName : 'サイトの説明'}
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
          </div>
        )}

        {/* Memo (user notes) */}
        {item.memo && (
          <div className="bg-gray-50 rounded-2xl p-3 mb-4">
            <p className="text-xs text-gray-500 font-medium mb-1">メモ</p>
            <p className="text-sm text-gray-700">{item.memo}</p>
          </div>
        )}

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {item.tags.map((tag) => (
              <span key={tag.name} className="text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: tag.color + '20', color: tag.color }}>
                #{tag.name}
              </span>
            ))}
          </div>
        )}

        {/* Status */}
        <div className="mb-4">
          {editingStatus ? (
            <div className="flex flex-wrap gap-2">
              {(Object.entries(STATUS_LABEL) as [ItemStatus, string][]).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => handleStatusChange(key)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition ${
                    item.status === key ? 'bg-pink-500 text-white border-pink-500' : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
              <button onClick={() => setEditingStatus(false)} className="text-xs text-gray-400 px-3 py-1.5">キャンセル</button>
            </div>
          ) : (
            <button onClick={() => setEditingStatus(true)} className="inline-flex items-center gap-1.5 text-xs text-pink-500 font-medium border border-pink-200 px-3 py-1.5 rounded-full">
              <Pencil size={11} strokeWidth={2} />
              {item.status ? STATUS_LABEL[item.status] : 'ステータスを設定'}
            </button>
          )}
        </div>

        {/* Location */}
        {item.locationName && (
          <div className="bg-blue-50 rounded-2xl p-3 mb-4">
            <p className="flex items-center gap-1 text-xs text-blue-600 font-medium mb-1">
              <MapPin size={12} strokeWidth={2} />
              場所
            </p>
            <p className="text-sm font-medium text-gray-900">{item.locationName}</p>
            {item.locationArea && <p className="text-xs text-gray-500">{item.locationArea}</p>}
            {item.locationAddress && <p className="text-xs text-gray-500">{item.locationAddress}</p>}
            {item.locationMapUrl && (
              <a href={item.locationMapUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-2 text-xs text-blue-600 font-medium">
                <Map size={11} strokeWidth={2} />
                地図で見る
              </a>
            )}
          </div>
        )}

        {/* Reactions */}
        <div className="mb-5">
          <p className="text-xs font-medium text-gray-500 mb-2">リアクション</p>
          <div className="flex flex-wrap gap-2">
            {REACTION_TYPES.map((type) => {
              const { Icon, label, activeClass } = REACTION_CONFIG[type];
              const active = myReactions.has(type);
              return (
                <button
                  key={type}
                  onClick={() => handleReaction(type)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition ${
                    active ? activeClass : 'bg-white border-gray-200 text-gray-600'
                  }`}
                >
                  <Icon size={13} strokeWidth={active ? 2.2 : 1.8} />
                  <span>{label}</span>
                  {reactionCounts[type] > 0 && <span className="font-medium">{reactionCounts[type]}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Open URL */}
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 py-3 bg-gray-900 text-white rounded-2xl font-medium text-sm mb-4"
        >
          元のSNSで開く
          <ExternalLink size={14} strokeWidth={2} />
        </a>

        {/* Comments */}
        <div className="mb-4">
          <p className="text-sm font-bold text-gray-700 mb-3">コメント ({comments.length})</p>
          <div className="space-y-3 mb-3">
            {comments.map((c) => (
              <CommentItem key={c.id} comment={c} currentUserId={user?.uid} onDelete={() => deleteComment(c.id)} />
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleAddComment())}
              placeholder="コメントを追加..."
              className="flex-1 px-3 py-2 bg-gray-50 rounded-2xl border border-gray-200 text-sm outline-none focus:border-pink-300 transition"
            />
            <button
              onClick={handleAddComment}
              disabled={!commentText.trim()}
              className="px-4 py-2 bg-pink-500 text-white rounded-2xl text-sm font-medium disabled:opacity-40"
            >
              送信
            </button>
          </div>
        </div>

        {/* Delete */}
        {(item.addedBy === user?.uid) && (
          <button onClick={handleDelete} className="w-full py-2 text-red-400 text-sm">削除する</button>
        )}
      </div>
    </AppShell>
  );
}

function CommentItem({ comment, currentUserId, onDelete }: { comment: Comment; currentUserId?: string; onDelete: () => void }) {
  const u = useUser(comment.userId);
  return (
    <div className="flex gap-2">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0">
        {u?.displayName?.[0]?.toUpperCase() || '?'}
      </div>
      <div className="flex-1 bg-gray-50 rounded-2xl px-3 py-2">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-xs font-medium text-gray-700">{u?.displayName || '...'}</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-400">{comment.createdAt.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}</span>
            {currentUserId === comment.userId && (
              <button onClick={onDelete} className="text-[10px] text-red-400">削除</button>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-700">{comment.body}</p>
      </div>
    </div>
  );
}
