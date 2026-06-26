'use client';

import { useState, useEffect } from 'react';
import { getUser } from '@/lib/firebase/firestore';
import { User } from '@/types';

const cache = new Map<string, User>();

export function useUser(userId: string | undefined) {
  const [user, setUser] = useState<User | null>(userId ? cache.get(userId) ?? null : null);

  useEffect(() => {
    if (!userId) return;
    if (cache.has(userId)) {
      setUser(cache.get(userId)!);
      return;
    }
    getUser(userId).then((u) => {
      if (u) {
        cache.set(userId, u);
        setUser(u);
      }
    });
  }, [userId]);

  return user;
}

export function useUsers(userIds: string[]) {
  const [users, setUsers] = useState<Map<string, User>>(new Map());

  useEffect(() => {
    const missing = userIds.filter((id) => !cache.has(id));
    if (missing.length === 0) {
      const m = new Map<string, User>();
      userIds.forEach((id) => { if (cache.has(id)) m.set(id, cache.get(id)!); });
      setUsers(m);
      return;
    }
    Promise.all(missing.map((id) => getUser(id))).then((results) => {
      results.forEach((u) => { if (u) cache.set(u.id, u); });
      const m = new Map<string, User>();
      userIds.forEach((id) => { if (cache.has(id)) m.set(id, cache.get(id)!); });
      setUsers(m);
    });
  }, [userIds.join(',')]);

  return users;
}
