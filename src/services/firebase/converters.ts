import { Timestamp, type DocumentData } from 'firebase/firestore';
import { format, parseISO } from 'date-fns';

export const toIsoString = (value: unknown): string => {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (typeof value === 'string') return value;
  return new Date(0).toISOString();
};

export const toDateKey = (value: unknown): string => {
  if (value instanceof Timestamp) return format(value.toDate(), 'yyyy-MM-dd');
  if (typeof value === 'string') return value.slice(0, 10);
  return format(new Date(), 'yyyy-MM-dd');
};

export const dateKeyToTimestamp = (dateKey: string): Timestamp =>
  Timestamp.fromDate(parseISO(dateKey));

export const readString = (data: DocumentData, key: string, fallback = ''): string =>
  typeof data[key] === 'string' ? (data[key] as string) : fallback;

export const readNumber = (data: DocumentData, key: string): number | null =>
  typeof data[key] === 'number' && Number.isFinite(data[key]) ? (data[key] as number) : null;
