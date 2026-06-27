import {
  Heart, UtensilsCrossed, Coffee, ShoppingBag, Plane, Baby,
  Lightbulb, BookOpen, Music, Film, Pizza, Home, Dumbbell,
  Palette, PawPrint, Flower2, Star, Flame,
  type LucideProps,
} from 'lucide-react';

type IconComponent = React.ComponentType<LucideProps>;

const ICON_MAP: Record<string, IconComponent> = {
  Heart, UtensilsCrossed, Coffee, ShoppingBag, Plane, Baby,
  Lightbulb, BookOpen, Music, Film, Pizza, Home, Dumbbell,
  Palette, PawPrint, Flower2, Star, Flame,
};

export const LIST_ICON_OPTIONS: { name: string; Icon: IconComponent }[] = [
  { name: 'Heart',           Icon: Heart },
  { name: 'UtensilsCrossed', Icon: UtensilsCrossed },
  { name: 'Coffee',          Icon: Coffee },
  { name: 'ShoppingBag',    Icon: ShoppingBag },
  { name: 'Plane',           Icon: Plane },
  { name: 'Baby',            Icon: Baby },
  { name: 'Lightbulb',      Icon: Lightbulb },
  { name: 'BookOpen',       Icon: BookOpen },
  { name: 'Music',           Icon: Music },
  { name: 'Film',            Icon: Film },
  { name: 'Pizza',           Icon: Pizza },
  { name: 'Home',            Icon: Home },
  { name: 'Dumbbell',        Icon: Dumbbell },
  { name: 'Palette',         Icon: Palette },
  { name: 'PawPrint',        Icon: PawPrint },
  { name: 'Flower2',         Icon: Flower2 },
  { name: 'Star',            Icon: Star },
  { name: 'Flame',           Icon: Flame },
];

interface Props extends Omit<LucideProps, 'name'> {
  name?: string | null;
}

export default function ListIcon({ name, size = 20, ...rest }: Props) {
  if (name && ICON_MAP[name]) {
    const Icon = ICON_MAP[name];
    return <Icon size={size} {...rest} />;
  }
  // backward compat: unknown name (old emoji string) — render as text
  if (name) {
    return <span style={{ fontSize: Number(size) * 0.9, lineHeight: 1 }}>{name}</span>;
  }
  const Icon = Heart;
  return <Icon size={size} {...rest} />;
}
