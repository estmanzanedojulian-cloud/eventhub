export const QR_PREFIX = 'EVENTHUB:TICKET:';

export function generateQRPayload(qrToken: string): string {
  return `${QR_PREFIX}${qrToken.trim()}`;
}

export function parseQRPayload(rawPayload: string): string | null {
  if (!rawPayload) return null;
  const trimmed = rawPayload.trim();
  if (trimmed.startsWith(QR_PREFIX)) {
    return trimmed.substring(QR_PREFIX.length).trim();
  }
  // Fallback: If it's a raw UUID/token, accept it
  if (trimmed.length >= 10) {
    return trimmed;
  }
  return null;
}
