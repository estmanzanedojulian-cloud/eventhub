import { createClient } from '@/lib/supabase/client';

export function getLocalFavorites(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('eventhub_favorite_ids');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalFavorites(ids: string[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('eventhub_favorite_ids', JSON.stringify(ids));
  } catch {}
}

export async function toggleFavorite(eventId: string): Promise<boolean> {
  const current = getLocalFavorites();
  const exists = current.includes(eventId);
  let updated: string[];

  if (exists) {
    updated = current.filter((id) => id !== eventId);
  } else {
    updated = [...current, eventId];
  }

  saveLocalFavorites(updated);

  // Sync with Supabase if logged in
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      if (exists) {
        await supabase.from('favorites').delete().eq('user_id', user.id).eq('event_id', eventId);
      } else {
        await supabase.from('favorites').insert({ user_id: user.id, event_id: eventId });
      }
    }
  } catch {}

  return !exists;
}

export function isEventFavorite(eventId: string): boolean {
  return getLocalFavorites().includes(eventId);
}
