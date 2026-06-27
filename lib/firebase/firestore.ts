import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  limit,
  setDoc,
} from 'firebase/firestore';
import { getFirebaseDb } from './config';
import {
  User,
  List,
  ListMember,
  Item,
  Comment,
  Reaction,
  Invitation,
  MemberRole,
  ReactionType,
} from '@/types';

function db() { return getFirebaseDb(); }

function toDate(v: unknown): Date {
  if (v instanceof Timestamp) return v.toDate();
  if (v instanceof Date) return v;
  return new Date();
}

// ---- Users ----

export async function createOrUpdateUser(user: Omit<User, 'createdAt'> & { createdAt?: Date }) {
  const ref = doc(db(), 'users', user.id);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL ?? null,
      createdAt: serverTimestamp(),
    });
  } else {
    await updateDoc(ref, {
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL ?? null,
    });
  }
}

export async function getUser(userId: string): Promise<User | null> {
  const snap = await getDoc(doc(db(), 'users', userId));
  if (!snap.exists()) return null;
  const d = snap.data();
  return { id: snap.id, ...d, createdAt: toDate(d.createdAt) } as User;
}

// ---- Lists ----

export async function createList(data: Omit<List, 'id' | 'createdAt' | 'updatedAt'>) {
  const ref = await addDoc(collection(db(), 'lists'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  await addDoc(collection(db(), 'listMembers'), {
    listId: ref.id,
    userId: data.ownerId,
    role: 'owner',
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateList(listId: string, data: Partial<List>) {
  await updateDoc(doc(db(), 'lists', listId), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteList(listId: string) {
  await deleteDoc(doc(db(), 'lists', listId));
}

export function subscribeLists(userId: string, callback: (lists: List[]) => void) {
  const q = query(collection(db(), 'listMembers'), where('userId', '==', userId));
  return onSnapshot(q, async (snap) => {
    const listIds = snap.docs.map((d) => d.data().listId as string);
    if (listIds.length === 0) { callback([]); return; }

    const chunks: string[][] = [];
    for (let i = 0; i < listIds.length; i += 10) chunks.push(listIds.slice(i, i + 10));

    const lists: List[] = [];
    for (const chunk of chunks) {
      const lq = query(collection(db(), 'lists'), where('__name__', 'in', chunk));
      const lsnap = await getDocs(lq);
      lsnap.docs.forEach((d) => {
        const data = d.data();
        lists.push({ id: d.id, ...data, createdAt: toDate(data.createdAt), updatedAt: toDate(data.updatedAt) } as List);
      });
    }
    lists.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    callback(lists);
  });
}

export function subscribeChildLists(parentId: string, callback: (lists: List[]) => void) {
  const q = query(collection(db(), 'lists'), where('parentId', '==', parentId));
  return onSnapshot(q, (snap) => {
    const lists = snap.docs.map((d) => {
      const data = d.data();
      return { id: d.id, ...data, createdAt: toDate(data.createdAt), updatedAt: toDate(data.updatedAt) } as List;
    });
    lists.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    callback(lists);
  });
}

export async function getListById(listId: string): Promise<List | null> {
  const snap = await getDoc(doc(db(), 'lists', listId));
  if (!snap.exists()) return null;
  const d = snap.data();
  return { id: snap.id, ...d, createdAt: toDate(d.createdAt), updatedAt: toDate(d.updatedAt) } as List;
}

// ---- List Members ----

export async function getListMembers(listId: string): Promise<ListMember[]> {
  const q = query(collection(db(), 'listMembers'), where('listId', '==', listId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return { id: d.id, ...data, createdAt: toDate(data.createdAt) } as ListMember;
  });
}

export async function updateMemberRole(memberId: string, role: MemberRole) {
  await updateDoc(doc(db(), 'listMembers', memberId), { role });
}

export async function removeMember(memberId: string) {
  await deleteDoc(doc(db(), 'listMembers', memberId));
}

export async function isListMember(listId: string, userId: string): Promise<ListMember | null> {
  const q = query(
    collection(db(), 'listMembers'),
    where('listId', '==', listId),
    where('userId', '==', userId)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data(), createdAt: toDate(d.data().createdAt) } as ListMember;
}

// ---- Items ----

export async function addItem(data: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) {
  // Firestore rejects undefined values — strip them before writing
  const clean = Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== undefined)
  );
  const ref = await addDoc(collection(db(), 'items'), {
    ...clean,
    tags: data.tags || [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateItem(itemId: string, data: Partial<Item>) {
  await updateDoc(doc(db(), 'items', itemId), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteItem(itemId: string) {
  await deleteDoc(doc(db(), 'items', itemId));
}

export async function getItem(itemId: string): Promise<Item | null> {
  const snap = await getDoc(doc(db(), 'items', itemId));
  if (!snap.exists()) return null;
  const d = snap.data();
  return { id: snap.id, ...d, createdAt: toDate(d.createdAt), updatedAt: toDate(d.updatedAt) } as Item;
}

export function subscribeItems(listId: string, callback: (items: Item[]) => void) {
  const q = query(
    collection(db(), 'items'),
    where('listId', '==', listId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => {
      const data = d.data();
      return { id: d.id, ...data, createdAt: toDate(data.createdAt), updatedAt: toDate(data.updatedAt) } as Item;
    }));
  });
}

export async function getRecentItems(userId: string, limitCount = 20): Promise<Item[]> {
  const memberQ = query(collection(db(), 'listMembers'), where('userId', '==', userId));
  const memberSnap = await getDocs(memberQ);
  const listIds = memberSnap.docs.map((d) => d.data().listId as string);
  if (listIds.length === 0) return [];

  const items: Item[] = [];
  const chunks: string[][] = [];
  for (let i = 0; i < listIds.length; i += 10) chunks.push(listIds.slice(i, i + 10));

  for (const chunk of chunks) {
    const q = query(
      collection(db(), 'items'),
      where('listId', 'in', chunk),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    snap.docs.forEach((d) => {
      const data = d.data();
      items.push({ id: d.id, ...data, createdAt: toDate(data.createdAt), updatedAt: toDate(data.updatedAt) } as Item);
    });
  }
  items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return items.slice(0, limitCount);
}

// ---- Comments ----

export async function addComment(data: Omit<Comment, 'id' | 'createdAt'>) {
  const ref = await addDoc(collection(db(), 'comments'), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function deleteComment(commentId: string) {
  await deleteDoc(doc(db(), 'comments', commentId));
}

export function subscribeComments(itemId: string, callback: (comments: Comment[]) => void) {
  const q = query(
    collection(db(), 'comments'),
    where('itemId', '==', itemId),
    orderBy('createdAt', 'asc')
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => {
      const data = d.data();
      return { id: d.id, ...data, createdAt: toDate(data.createdAt) } as Comment;
    }));
  });
}

// ---- Reactions ----

export async function toggleReaction(itemId: string, userId: string, type: ReactionType) {
  const q = query(
    collection(db(), 'reactions'),
    where('itemId', '==', itemId),
    where('userId', '==', userId),
    where('type', '==', type)
  );
  const snap = await getDocs(q);
  if (!snap.empty) {
    await deleteDoc(snap.docs[0].ref);
    return false;
  }
  await addDoc(collection(db(), 'reactions'), {
    itemId, userId, type, createdAt: serverTimestamp(),
  });
  return true;
}

export function subscribeReactions(itemId: string, callback: (reactions: Reaction[]) => void) {
  const q = query(collection(db(), 'reactions'), where('itemId', '==', itemId));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => {
      const data = d.data();
      return { id: d.id, ...data, createdAt: toDate(data.createdAt) } as Reaction;
    }));
  });
}

// ---- Invitations ----

export async function createInvitation(data: Omit<Invitation, 'id' | 'createdAt'>) {
  const ref = await addDoc(collection(db(), 'invitations'), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getInvitationByToken(token: string): Promise<Invitation | null> {
  const q = query(collection(db(), 'invitations'), where('token', '==', token));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  const data = d.data();
  return {
    id: d.id,
    ...data,
    expiresAt: toDate(data.expiresAt),
    createdAt: toDate(data.createdAt),
  } as Invitation;
}

export async function acceptInvitation(invitation: Invitation, userId: string) {
  const existing = await isListMember(invitation.listId, userId);
  if (existing) return;
  await addDoc(collection(db(), 'listMembers'), {
    listId: invitation.listId,
    userId,
    role: invitation.role,
    createdAt: serverTimestamp(),
  });
}
