'use client';

import { useState, useEffect } from 'react';
import { useAuthContext } from '@/lib/AuthContext';
import { addItem } from '@/lib/firebase/firestore';
import { fetchUrlMetadata, detectSourceType } from '@/lib/urlParser';
import { List, Tag, ItemStatus } from '@/types';
import { STATUS_LABEL } from '@/components/ui/StatusBadge';

const STATUS_OPTIONS = Object.entries(STATUS_LABEL) as [ItemStatus, string][];

const PRESET_COLORS = ['#ef4444','#f97316','#eab308','#22c55e','#3b82f6','#a855f7','#ec4899','#6b7280'];

interface Props {
  lists: List[];
  defaultListId?: string;
  onClose: () => void;
  onAdded?: () => void;
}

export default function AddItemModal({ lists, defaultListId, onClose, onAdded }: Props) {
  const { user } = useAuthContext();
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [memo, setMemo] = useState('');
  const [selectedListId, setSelectedListId] = useState(defaultListId || lists[0]?.id || '');
  const [status, setStatus] = useState<ItemStatus | ''>('');
  const [tags, setTags] = useState<Tag[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [tagColor, setTagColor] = useState('#ef4444');
  const [fetching, setFetching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [sourceType, setSourceType] = useState(detectSourceType(''));

  useEffect(() => {
    if (!url) return;
    setSourceType(detectSourceType(url));
    const timer = setTimeout(async () => {
      setFetching(true);
      const meta = await fetchUrlMetadata(url);
      if (meta.thumbnailUrl) setThumbnailUrl(meta.thumbnailUrl);
      setSourceType(meta.sourceType);
      setFetching(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [url]);

  function addTag() {
    const t = tagInput.trim();
    if (!t || tags.find((x) => x.name === t)) return;
    setTags([...tags, { name: t, color: tagColor }]);
    setTagInput('');
  }

  function removeTag(name: string) {
    setTags(tags.filter((t) => t.name !== name));
  }

  async function handleSave() {
    if (!url || !selectedListId || !user) return;
    setSaving(true);
    setError('');
    try {
      await addItem({
        listId: selectedListId,
        url,
        sourceType,
        title: title || url,
        thumbnailUrl: thumbnailUrl || undefined,
        memo: memo || undefined,
        tags,
        status: status || undefined,
        addedBy: user.uid,
      });
      onAdded?.();
      onClose();
    } catch (e: unknown) {
      console.error(e);
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg || 'エラーが発生しました。もう一度試してください。');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-t-3xl shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        <div className="px-5 pb-8 pt-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900">投稿を追加</h2>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500">
              ✕
            </button>
          </div>

          <div className="space-y-4">
            {/* URL */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">URL *</label>
              <div className="relative">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-3 bg-gray-50 rounded-2xl border border-gray-200 text-sm outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition pr-10"
                />
                {fetching && (
                  <div className="absolute right-3 top-3 w-5 h-5 border-2 border-pink-400 border-t-transparent rounded-full animate-spin" />
                )}
              </div>
              {sourceType && url && (
                <p className="text-[10px] text-gray-400 mt-1 px-1">🔍 {sourceType === 'other' ? 'その他' : sourceType} として保存されます</p>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">タイトル</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="自動取得または手入力"
                className="w-full px-4 py-3 bg-gray-50 rounded-2xl border border-gray-200 text-sm outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition"
              />
            </div>

            {/* List */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">保存先リスト *</label>
              <select
                value={selectedListId}
                onChange={(e) => setSelectedListId(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 rounded-2xl border border-gray-200 text-sm outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition"
              >
                {lists.map((l) => (
                  <option key={l.id} value={l.id}>{l.emoji} {l.title}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">ステータス</label>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setStatus(status === key ? '' : key)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition ${
                      status === key ? 'bg-pink-500 text-white border-pink-500' : 'bg-white text-gray-600 border-gray-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Memo */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">メモ</label>
              <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="メモを入力..."
                rows={2}
                className="w-full px-4 py-3 bg-gray-50 rounded-2xl border border-gray-200 text-sm outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition resize-none"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">タグ</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="タグを入力してEnter"
                  className="flex-1 px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-sm outline-none focus:border-pink-300 transition"
                />
                <div className="flex items-center gap-1">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setTagColor(c)}
                      className={`w-5 h-5 rounded-full transition ${tagColor === c ? 'ring-2 ring-offset-1 ring-gray-400 scale-110' : ''}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {tags.map((tag) => (
                    <span
                      key={tag.name}
                      className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1 cursor-pointer"
                      style={{ backgroundColor: tag.color + '20', color: tag.color }}
                      onClick={() => removeTag(tag.name)}
                    >
                      #{tag.name} ✕
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Save button */}
            {error && (
              <p className="text-xs text-red-500 bg-red-50 rounded-xl px-3 py-2">{error}</p>
            )}
            <button
              onClick={handleSave}
              disabled={!url || !selectedListId || saving}
              className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-2xl font-semibold text-sm shadow-sm disabled:opacity-40 transition active:scale-95 mt-2"
            >
              {saving ? '保存中...' : '保存する'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
