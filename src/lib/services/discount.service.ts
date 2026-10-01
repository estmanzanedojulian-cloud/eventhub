import { createClient } from '@/lib/supabase/client';

export interface DiscountCodeItem {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  max_uses: number;
  used_count: number;
  event_id?: string | null;
  event_title: string;
  is_active: boolean;
  expires_at: string;
  created_at?: string;
}

const DEFAULT_DISCOUNTS: DiscountCodeItem[] = [
  {
    id: 'd_1',
    code: 'EVENTHUB20',
    type: 'percentage',
    value: 20,
    max_uses: 500,
    used_count: 34,
    event_id: null,
    event_title: 'Todos los eventos',
    is_active: true,
    expires_at: '2026-12-31',
    created_at: '2026-01-01',
  },
  {
    id: 'd_2',
    code: 'AMIGOS5000',
    type: 'fixed',
    value: 5000,
    max_uses: 100,
    used_count: 89,
    event_id: 'e1000000-0000-0000-0000-000000000001',
    event_title: 'Neon Echoes: Sunset Festival 2026',
    is_active: true,
    expires_at: '2026-11-15',
    created_at: '2026-02-15',
  },
  {
    id: 'd_3',
    code: 'EARLYVIP30',
    type: 'percentage',
    value: 30,
    max_uses: 50,
    used_count: 50,
    event_id: 'e1000000-0000-0000-0000-000000000002',
    event_title: 'AI & Cloud Future Summit 2026',
    is_active: false,
    expires_at: '2026-08-30',
    created_at: '2026-03-01',
  },
];

const STORAGE_KEY = 'eventhub_discount_codes';

export function getDiscounts(): DiscountCodeItem[] {
  if (typeof window === 'undefined') return DEFAULT_DISCOUNTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DISCOUNTS));
      return DEFAULT_DISCOUNTS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_DISCOUNTS;
  }
}

export function saveDiscounts(items: DiscountCodeItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('eventhub_discounts_updated', { detail: items }));
  } catch (err) {
    console.error('Error saving discounts:', err);
  }
}

export async function createDiscount(input: {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  max_uses: number;
  event_id?: string | null;
  event_title: string;
  expires_at?: string;
}): Promise<DiscountCodeItem> {
  const current = getDiscounts();
  const upperCode = input.code.trim().toUpperCase();

  const newDiscount: DiscountCodeItem = {
    id: 'd_' + Math.random().toString(36).substring(2, 9),
    code: upperCode,
    type: input.type,
    value: Number(input.value),
    max_uses: Number(input.max_uses) || 100,
    used_count: 0,
    event_id: input.event_id || null,
    event_title: input.event_title || 'Todos los eventos',
    is_active: true,
    expires_at: input.expires_at || '2026-12-31',
    created_at: new Date().toISOString().slice(0, 10),
  };

  const updated = [newDiscount, ...current];
  saveDiscounts(updated);

  // Sync with Supabase if online
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await (supabase.from('discount_codes') as any).insert({
        organizer_id: user.id,
        event_id: input.event_id || null,
        code: upperCode,
        type: input.type,
        value: input.value,
        max_uses: input.max_uses,
        expires_at: input.expires_at ? new Date(input.expires_at).toISOString() : null,
        is_active: true,
      });
    }
  } catch (err) {
    console.debug('Supabase discount insert notice:', err);
  }

  return newDiscount;
}

export function toggleDiscountActive(id: string): DiscountCodeItem | null {
  const current = getDiscounts();
  let target: DiscountCodeItem | null = null;
  const updated = current.map((d) => {
    if (d.id === id) {
      target = { ...d, is_active: !d.is_active };
      return target;
    }
    return d;
  });

  saveDiscounts(updated);
  return target;
}

export function deleteDiscount(id: string) {
  const current = getDiscounts();
  const updated = current.filter((d) => d.id !== id);
  saveDiscounts(updated);
}

export function validateDiscountCode(
  rawCode: string,
  eventId: string,
  subtotal: number
): { valid: boolean; discountAmount: number; discount?: DiscountCodeItem; error?: string } {
  if (!rawCode || !rawCode.trim()) {
    return { valid: false, discountAmount: 0, error: 'Ingresá un código' };
  }

  const code = rawCode.trim().toUpperCase();
  const discounts = getDiscounts();
  const found = discounts.find((d) => d.code === code);

  if (!found) {
    return { valid: false, discountAmount: 0, error: 'Código de descuento inexistente' };
  }

  if (!found.is_active) {
    return { valid: false, discountAmount: 0, error: 'El cupón se encuentra inactivo' };
  }

  if (found.used_count >= found.max_uses) {
    return { valid: false, discountAmount: 0, error: 'El cupón alcanzó el límite máximo de usos' };
  }

  if (found.expires_at && new Date(found.expires_at) < new Date()) {
    return { valid: false, discountAmount: 0, error: 'El cupón ha vencido' };
  }

  if (found.event_id && found.event_id !== eventId) {
    return { valid: false, discountAmount: 0, error: 'Este cupón no es válido para este evento' };
  }

  let discountAmount = 0;
  if (found.type === 'percentage') {
    discountAmount = Math.round((subtotal * found.value) / 100);
  } else {
    discountAmount = Math.min(found.value, subtotal);
  }

  return {
    valid: true,
    discountAmount,
    discount: found,
  };
}

export function recordDiscountUsage(code: string) {
  const current = getDiscounts();
  const upper = code.trim().toUpperCase();
  const updated = current.map((d) => {
    if (d.code === upper) {
      return { ...d, used_count: d.used_count + 1 };
    }
    return d;
  });
  saveDiscounts(updated);
}
