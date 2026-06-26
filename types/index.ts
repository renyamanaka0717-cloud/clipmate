export type SourceType =
  | 'instagram'
  | 'tiktok'
  | 'threads'
  | 'youtube'
  | 'pinterest'
  | 'x'
  | 'other';

export type ListVisibility = 'private' | 'shared';

export type MemberRole = 'owner' | 'editor' | 'viewer';

export type ItemStatus =
  | 'want_to_go'
  | 'want_to_eat'
  | 'want_to_buy'
  | 'want_to_see'
  | 'interested'
  | 'done'
  | 'pending';

export type ReactionType = '❤️' | '👍' | '👀' | '行きたい' | '気になる';

export interface User {
  id: string;
  displayName: string;
  email: string;
  photoURL?: string;
  createdAt: Date;
}

export interface List {
  id: string;
  title: string;
  emoji: string;
  color: string;
  ownerId: string;
  visibility: ListVisibility;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListMember {
  id: string;
  listId: string;
  userId: string;
  role: MemberRole;
  createdAt: Date;
  user?: User;
}

export interface Tag {
  name: string;
  color: string;
}

export interface Item {
  id: string;
  listId: string;
  url: string;
  sourceType: SourceType;
  title: string;
  thumbnailUrl?: string;
  memo?: string;
  tags: Tag[];
  status?: ItemStatus;
  addedBy: string;
  locationName?: string;
  locationArea?: string;
  locationAddress?: string;
  locationMapUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  itemId: string;
  userId: string;
  body: string;
  createdAt: Date;
  user?: User;
}

export interface Reaction {
  id: string;
  itemId: string;
  userId: string;
  type: ReactionType;
  createdAt: Date;
}

export interface FcmToken {
  id: string;
  userId: string;
  token: string;
  platform: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invitation {
  id: string;
  listId: string;
  token: string;
  role: MemberRole;
  expiresAt: Date;
  createdBy: string;
  createdAt: Date;
}
