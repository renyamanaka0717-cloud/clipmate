'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Search as SearchIcon } from 'lucide-react';
import {
  SiInstagram, SiTiktok, SiThreads, SiYoutube, SiPinterest, SiX,
} from 'react-icons/si';
import { Link2 } from 'lucide-react';
import { useAuthContext } from '@/lib/AuthContext';
import { addItem } from '@/lib/firebase/firestore';
import { fetchUrlMetadata, detectSourceType, UrlMetadata } from '@/lib/urlParser';
import { List, Tag, ItemStatus, SourceType } from '@/types';
import { STATUS_LABEL } from '@/components/ui/StatusBadge';

const STATUS_OPTIONS = Object.entries(STATUS_LABEL) as [ItemStatus, string][];
const PRESET_COLORS = ['#ef4444','#f97316','#eab308','#22c55e','#3b82f6','#a855f7','#ec4899','#6b7280'];

type SnsConfig = { Icon: React.ComponentType<{ size?: number; color?: string }>; color: string };
const SNS: Record<SourceType, SnsConfig> = {
  instagram: { Icon: SiInstagram, color: '#C13584' },
  tiktok:    { Icon: SiTiktok,    color: '#010101' },
  threads:   { Icon: SiThreads,   color: '#101010' },
  youtube:   { Icon: SiYoutube,   color: '#FF0000' },
  pinterest: { Icon: SiPinterest, color: '#E60023' },
  x:         { Icon: SiX,         color: '#101010' },
  other:     { Icon: Link2,        color: '#9CA3AF' },
};

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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewMeta, setPreviewMeta] = useState<UrlMetadata | null>(null);
  const [previewImgError, setPreviewImgError] = useState(false);
  const [manualImageUrl, setManualImageUrl] = useState('');
  const [manualImgError, setManualImgError] = useState(false);

  useEffect(() => {
    if (!url) {
      setPreviewLoading(false);
      setPreviewMeta(null);
      return;
    }

    setPreviewLoading(true);
    setPreviewImgError(false);

    const timer = setTimeout(async () => {
      const meta = await fetchUrlMetadata(url);
      setPreviewMeta(meta);
      setPreviewLoading(false);
    }, 700);

    return () => clearTimeout(timer);
  }, [url]);

  function addTag() {
    const t = tagInput.trim();
    if (!t || tags.find((x) => x.name === t)) return;
    setTags([...tags, { name: t, color: tagColor }]);
    setTagInput('');
  }

  async function handleSave() {
    if (!url || !selectedListId || !user) return;
    setSaving(true);
    setError('');
    try {
      await addItem({
        listId: selectedListId,
        url,
        sourceType: previewMeta?.sourceType ?? detectSourceType(url),
        title: title || url,
        description: previewMeta?.description || undefined,
        thumbnailUrl: previewImgError ? (manualImageUrl || undefined) : (previewMeta?.thumbnailUrl || manualImageUrl || undefined),
        siteName: previewMeta?.siteName || undefined,
        resolvedUrl: previewMeta?.resolvedUrl || undefined,
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

  const sourceType = previewMeta?.sourceType ?? detectSourceType(url);
  const { Icon: SnsIcon, color: snsColor } = SNS[sourceType] ?? SNS.other;
  const hasPreviewContent = previewMeta && (previewMeta.title || previewMeta.description || previewMeta.thumbnailUrl || previewMeta.siteName);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-t-3xl shadow-xl max-h-[92vh] overflow-y-auto">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        <div className="px-5 pb-8 pt-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900">投稿を追加</h2>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500">
              <X size={16} strokeWidth={2} />
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
                {previewLoading && (
                  <div className="absolute right-3 top-3.5 w-4 h-4 border-2 border-pink-400 border-t-transparent rounded-full animate-spin" />
                )}
              </div>
              {url && !previewLoading && previewMeta && (
                <p className="flex items-center gap-1 text-[10px] text-gray-400 mt-1 px-1">
                  <SearchIcon size={9} strokeWidth={2} />
                  {previewMeta.sourceType === 'other' ? 'その他' : previewMeta.sourceType} として保存されます
                </p>
              )}
            </div>

            {/* URL Preview Card */}
            {url && (previewLoading || hasPreviewContent) && (
              <div className="rounded-2xl border border-gray-100 overflow-hidden bg-gray-50">
                {previewLoading ? (
                  <div className="flex gap-3 p-3">
                    <div className="w-[72px] h-[72px] bg-gray-200 rounded-xl animate-pulse flex-shrink-0" />
                    <div className="flex-1 py-1 space-y-2">
                      <div className="h-2 bg-gray-200 rounded-full animate-pulse w-1/3" />
                      <div className="h-3 bg-gray-200 rounded-full animate-pulse w-5/6" />
                      <div className="h-2.5 bg-gray-200 rounded-full animate-pulse w-full" />
                      <div className="h-2.5 bg-gray-200 rounded-full animate-pulse w-3/4" />
                    </div>
                  </div>
                ) : previewMeta && (
                  <div className="flex gap-3 p-3">
                    {/* Thumbnail */}
                    <div className="relative w-[72px] h-[72px] flex-shrink-0 rounded-xl overflow-hidden bg-gray-200">
                      {previewMeta.thumbnailUrl && !previewImgError ? (
                        <Image
                          src={previewMeta.thumbnailUrl}
                          alt=""
                          fill
                          className="object-cover"
                          onError={() => setPreviewImgError(true)}
                          unoptimized
                        />
                      ) : (
                        <div
                          className="absolute inset-0 flex items-center justify-center"
                          style={{ backgroundColor: snsColor + '18' }}
                        >
                          <SnsIcon size={28} color={snsColor} />
                        </div>
                      )}
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0 py-0.5">
                      {previewMeta.siteName && (
                        <p className="text-[10px] text-gray-400 mb-0.5 truncate">{previewMeta.siteName}</p>
                      )}
                      <p className="text-xs font-semibold text-gray-900 line-clamp-2 leading-snug">
                        {previewMeta.title || url}
                      </p>
                      {previewMeta.description && (
                        <p className="text-[10px] text-gray-500 line-clamp-2 mt-0.5 leading-relaxed">
                          {previewMeta.description}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Manual image URL — shown when OGP has no thumbnail or thumbnail failed to load */}
            {url && !previewLoading && previewMeta && (!previewMeta.thumbnailUrl || previewImgError) && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">画像URL（任意）</label>
                <input
                  type="url"
                  value={manualImageUrl}
                  onChange={(e) => { setManualImageUrl(e.target.value); setManualImgError(false); }}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-3 bg-gray-50 rounded-2xl border border-gray-200 text-sm outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition"
                />
                {manualImageUrl && !manualImgError && (
                  <div className="relative mt-2 w-full h-32 rounded-xl overflow-hidden bg-gray-100">
                    <Image
                      src={manualImageUrl}
                      alt="preview"
                      fill
                      className="object-cover"
                      onError={() => setManualImgError(true)}
                      unoptimized
                    />
                  </div>
                )}
                {manualImageUrl && manualImgError && (
                  <p className="text-[11px] text-red-400 mt-1 px-1">画像を読み込めませんでした</p>
                )}
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">タイトル</label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                }}
                placeholder="タイトルを入力（空欄でURLを保存）"
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
                  <option key={l.id} value={l.id}>{l.title}</option>
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
                placeholder="自分だけのメモを追加..."
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
                      onClick={() => setTags(tags.filter((t) => t.name !== tag.name))}
                    >
                      #{tag.name} <X size={9} strokeWidth={2.5} />
                    </span>
                  ))}
                </div>
              )}
            </div>

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
