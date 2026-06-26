'use client';

import { useState } from 'react';
import { useAuthContext } from '@/lib/AuthContext';
import { createList } from '@/lib/firebase/firestore';

const EMOJI_OPTIONS = ['❤️','🍜','☕','🛍','✈️','👶','💡','📚','🎵','🎬','🍕','🏠','💪','🎨','🐶','🌸','⭐','🔥'];
const COLOR_OPTIONS = [
  { key: 'pink', label: 'ピンク', class: 'bg-pink-200' },
  { key: 'purple', label: 'パープル', class: 'bg-purple-200' },
  { key: 'blue', label: 'ブルー', class: 'bg-blue-200' },
  { key: 'green', label: 'グリーン', class: 'bg-green-200' },
  { key: 'yellow', label: 'イエロー', class: 'bg-yellow-200' },
  { key: 'orange', label: 'オレンジ', class: 'bg-orange-200' },
  { key: 'red', label: 'レッド', class: 'bg-red-200' },
  { key: 'gray', label: 'グレー', class: 'bg-gray-200' },
];

interface Props {
  onClose: () => void;
  onCreated?: (listId: string) => void;
}

export default function CreateListModal({ onClose, onCreated }: Props) {
  const { user } = useAuthContext();
  const [title, setTitle] = useState('');
  const [emoji, setEmoji] = useState('❤️');
  const [color, setColor] = useState('pink');
  const [visibility, setVisibility] = useState<'private' | 'shared'>('private');
  const [saving, setSaving] = useState(false);

  async function handleCreate() {
    if (!title.trim() || !user) return;
    setSaving(true);
    try {
      const id = await createList({
        title: title.trim(),
        emoji,
        color,
        ownerId: user.uid,
        visibility,
      });
      onCreated?.(id);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-t-3xl shadow-xl max-h-[85vh] overflow-y-auto">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>
        <div className="px-5 pb-8 pt-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900">リストを作成</h2>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500">✕</button>
          </div>

          {/* Preview */}
          <div className={`flex items-center gap-3 p-4 rounded-2xl mb-5 ${COLOR_OPTIONS.find(c => c.key === color)?.class || 'bg-pink-200'}`}>
            <span className="text-3xl">{emoji}</span>
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

            {/* Emoji */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">絵文字</label>
              <div className="grid grid-cols-9 gap-1.5">
                {EMOJI_OPTIONS.map((e) => (
                  <button
                    key={e}
                    onClick={() => setEmoji(e)}
                    className={`text-xl w-9 h-9 flex items-center justify-center rounded-xl transition ${
                      emoji === e ? 'bg-pink-100 ring-2 ring-pink-400' : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    {e}
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
                  { key: 'private', label: '🔒 自分だけ' },
                  { key: 'shared', label: '👥 共有' },
                ].map((v) => (
                  <button
                    key={v.key}
                    onClick={() => setVisibility(v.key as 'private' | 'shared')}
                    className={`flex-1 py-2 rounded-xl text-sm transition border ${
                      visibility === v.key ? 'bg-pink-50 border-pink-300 text-pink-700 font-medium' : 'bg-gray-50 border-gray-200 text-gray-600'
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

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
