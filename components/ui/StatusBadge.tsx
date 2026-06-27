import { ItemStatus } from '@/types';

const STATUS_LABEL: Record<ItemStatus, string> = {
  interested: '気になる',
  want_to_go: '行きたい',
  want_to_eat: '食べたい',
  want_to_buy: '買いたい',
  want_to_see: '見たい',
  done: '済み',
  pending: '保留',
};

const STATUS_CLASS: Record<ItemStatus, string> = {
  interested: 'bg-yellow-100 text-yellow-700',
  want_to_go: 'bg-blue-100 text-blue-700',
  want_to_eat: 'bg-orange-100 text-orange-700',
  want_to_buy: 'bg-green-100 text-green-700',
  want_to_see: 'bg-purple-100 text-purple-700',
  done: 'bg-gray-100 text-gray-500',
  pending: 'bg-gray-100 text-gray-400',
};

export default function StatusBadge({ status }: { status: ItemStatus }) {
  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_CLASS[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}

export { STATUS_LABEL };
