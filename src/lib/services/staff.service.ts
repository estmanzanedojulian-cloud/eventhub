import { createClient } from '@/lib/supabase/client';

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: 'scanner' | 'lead';
  event_id: string;
  event_title: string;
  assigned_at: string;
  status: 'active' | 'suspended';
}

const DEFAULT_STAFF: StaffMember[] = [
  {
    id: 'stf_1',
    name: 'Carlos Mendoza',
    email: 'carlos.m@seguridad.com',
    role: 'scanner',
    event_id: 'e1000000-0000-0000-0000-000000000001',
    event_title: 'Neon Echoes: Sunset Festival 2026',
    assigned_at: '2026-09-20',
    status: 'active',
  },
  {
    id: 'stf_2',
    name: 'Valeria Gómez',
    email: 'valeria.g@seguridad.com',
    role: 'lead',
    event_id: 'e1000000-0000-0000-0000-000000000001',
    event_title: 'Neon Echoes: Sunset Festival 2026',
    assigned_at: '2026-09-21',
    status: 'active',
  },
  {
    id: 'stf_3',
    name: 'Esteban Paz',
    email: 'esteban.p@control.com',
    role: 'scanner',
    event_id: 'e1000000-0000-0000-0000-000000000002',
    event_title: 'AI & Cloud Future Summit 2026',
    assigned_at: '2026-09-25',
    status: 'active',
  },
];

const STORAGE_KEY = 'eventhub_access_staff';

export function getStaffMembers(): StaffMember[] {
  if (typeof window === 'undefined') return DEFAULT_STAFF;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_STAFF));
      return DEFAULT_STAFF;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_STAFF;
  }
}

export function saveStaffMembers(items: StaffMember[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('eventhub_staff_updated', { detail: items }));
  } catch (err) {
    console.error('Error saving staff:', err);
  }
}

export async function addStaffMember(input: {
  name: string;
  email: string;
  role: 'scanner' | 'lead';
  event_id: string;
  event_title: string;
}): Promise<StaffMember> {
  const current = getStaffMembers();

  const newStaff: StaffMember = {
    id: 'stf_' + Math.random().toString(36).substring(2, 9),
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    role: input.role,
    event_id: input.event_id,
    event_title: input.event_title,
    assigned_at: new Date().toISOString().slice(0, 10),
    status: 'active',
  };

  const updated = [newStaff, ...current];
  saveStaffMembers(updated);

  // Sync with Supabase if online
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await (supabase.from('event_staff') as any).insert({
        event_id: input.event_id,
        user_id: user.id,
        role: input.role,
      });
    }
  } catch (err) {
    console.debug('Supabase event_staff insert notice:', err);
  }

  return newStaff;
}

export function removeStaffMember(id: string) {
  const current = getStaffMembers();
  const updated = current.filter((s) => s.id !== id);
  saveStaffMembers(updated);
}

export function toggleStaffStatus(id: string): StaffMember | null {
  const current = getStaffMembers();
  let target: StaffMember | null = null;
  const updated = current.map((s) => {
    if (s.id === id) {
      target = { ...s, status: s.status === 'active' ? 'suspended' : 'active' };
      return target;
    }
    return s;
  });

  saveStaffMembers(updated);
  return target;
}
