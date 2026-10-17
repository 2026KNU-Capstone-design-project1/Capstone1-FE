const DATE_TIME_PATTERN = /^(\d{4})[-.](\d{2})[-.](\d{2})[T\s](\d{2}):(\d{2})(?::(\d{2}))?(?:[.,T](\d{1,9}))?(?:Z|[+-]\d{2}:?\d{2})?$/;

function getDateTimeParts(value) {
  if (typeof value !== 'string') return null;
  return value.trim().match(DATE_TIME_PATTERN);
}

export function formatDateTime(value) {
  const parts = getDateTimeParts(value);
  if (parts) {
    const [, year, month, day, hour, minute, second = '00'] = parts;
    return `${year}.${month}.${day} ${hour}:${minute}:${second}`;
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const pad = number => String(number).padStart(2, '0');
    return `${value.getFullYear()}.${pad(value.getMonth() + 1)}.${pad(value.getDate())} ${pad(value.getHours())}:${pad(value.getMinutes())}:${pad(value.getSeconds())}`;
  }

  return value ? String(value) : '-';
}

export function toTimestamp(value) {
  const parts = getDateTimeParts(value);
  if (parts) {
    const [, year, month, day, hour, minute, second = '00', fraction = '0'] = parts;
    const milliseconds = Number(fraction.slice(0, 3).padEnd(3, '0'));
    return Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second), milliseconds);
  }

  if (value instanceof Date) return value.getTime();

  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}
