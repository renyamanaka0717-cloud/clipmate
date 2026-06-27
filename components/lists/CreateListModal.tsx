'use client';

import { useState } from 'react';
import { Lock, Users, X } from 'lucide-react';
import { useAuthContext } from '@/lib/AuthContext';
import { createList } from '@/lib/firebase/firestore';
import ListIcon, { LIST_ICON_OPTIONS } from './ListIcon';

const COLOR_OPTIONS = [
  { key: 'pink',   class: 'bg-pink-200' },
  { key: 'purple', class: 'bg-purple-200' },
  { key: 'blue',   class: 'bg-blue-200' },
  { key: 'green',  class: 'bg-green-200' },
  { key: 'yellow', class: 'bg-yellow-200' },
  { key: 'orange', class: 'bg-orange-200' },
  { key: 'red',    class: 'bg-red-200' },
  { key: 'gray',   class: 'bg-gray-200' },
];

interface Props {
  onClose: () => void;
  onCreated?: (listId: string) => void;
  parentId?: string | null;
}

export default function CreateListModal({ onClose, onCreated, parentId }: Props) {
  const { user } = useAuthContext();
  const [title, setTitle] = useState('');
  const [iconName, setIconName] = useState('Heart');
  const [color, setColor] = useState('pink');
  const [visibility, setVisibility] = useState<'private' | 'shared'>('private');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleCreate() {
    if (!title.trim() || !user) return;
    setSaving(true);
    setError('');
    try {
      const id = await createList({
        title: title.trim(),
        emoji: iconName,
        color,
        ownerId: user.uid,
        visibility,
        parentId: parentId ?? null,
      });
      onCreated?.(id);
      onClose();
    } catch (e: unknown) {
      console.error(e);
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg || 'エラーが発生しました。もう一度試してください。');
    } finally {
      setSaving(false);
    }
  }

  const previewBg = COLOR_OPTIONS.find((c) => c.key === color)?.class || 'bg-pink-200';

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-t-3xl shadow-xl max-h-[85vh] overflow-y-auto">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>
        <div className="px-5 pb-8 pt-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900">リストを作成</h2>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500">
              <X size={16} strokeWidth={2} />
            </button>
          </div>

          {/* Preview */}
          <div className={`flex items-center gap-3 p-4 rounded-2xl mb-5 ${previewBg}`}>
            <ListIcon name={iconName} size={28} className="text-gray-700" />
            <span className="font-semibold text-gray-900">{title || 'リスト名'}</span>
          </div>

          <div className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">リスト名 *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例：行きたいカフェ"
                className="w-full px-4 py-3 bg-gray-50 rounded-2xl border border-gray-200 text-sm outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition"
              />
            </div>

            {/* Icon */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">アイコン</label>
              <div className="grid grid-cols-9 gap-1.5">
                {LIST_ICON_OPTIONS.map(({ name, Icon }) => (
                  <button
                    key={name}
                    onClick={() => setIconName(name)}
                    className={`w-9 h-9 flex items-center justify-center rounded-xl transition ${
                      iconName === name ? 'bg-pink-100 ring-2 ring-pink-400 text-pink-600' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={18} strokeWidth={1.8} />
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">カラー</label>
              <div className="flex gap-2 flex-wrap">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.key}
                    onClick={() => setColor(c.key)}
                    className={`w-8 h-8 rounded-full ${c.class} transition ${
                      color === c.key ? 'ring-2 ring-offset-1 ring-gray-500 scale-110' : ''
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Visibility */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">公開範囲</label>
              <div className="flex gap-2">
                {[
                  { key: 'private', label: '自分だけ', Icon: Lock },
                  { key: 'shared',  label: '共有',     Icon: Users },
                ].map(({ key, label, Icon }) => (
                  <button
                    key={key}
                    onClick={() => setVisibility(key as 'private' | 'shared')}
                    className={`flex-1 py-2 rounded-xl text-sm transition border flex items-center justify-center gap-1.5 ${
                      visibility === key ? 'bg-pink-50 border-pink-300 text-pink-700 font-medium' : 'bg-gray-50 border-gray-200 text-gray-600'
                    }`}
                  >
                    <Icon size={13} strokeWidth={2} />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-500 bg-red-50 rounded-xl px-3 py-2">{error}</p>
            )}
            <button
              onClick={handleCreate}
              disabled={!title.trim() || saving}
              className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-2xl font-semibold text-sm shadow-sm disabled:opacity-40 transition active:scale-95"
            >
              {saving ? '作成中...' : 'リストを作成'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
