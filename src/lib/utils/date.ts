export function formatEventDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatEventShortDate(dateString: string): { day: string; month: string; year: string } {
  try {
    const date = new Date(dateString);
    const day = new Intl.DateTimeFormat('es-AR', { day: 'numeric' }).format(date);
    const month = new Intl.DateTimeFormat('es-AR', { month: 'short' }).format(date).toUpperCase().replace('.', '');
    const year = new Intl.DateTimeFormat('es-AR', { year: 'numeric' }).format(date);
    return { day, month, year };
  } catch {
    return { day: '01', month: 'ENE', year: '2026' };
  }
}

export function formatEventTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date) + ' hs';
  } catch {
    return '21:00 hs';
  }
}

export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Finalizado';
    if (diffDays === 0) return '¡Hoy!';
    if (diffDays === 1) return '¡Mañana!';
    return `En ${diffDays} días`;
  } catch {
    return '';
  }
}
