export function formatCurrency(amount: number, currency: string = 'ARS'): string {
  if (amount === 0) return 'Gratis';

  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}
