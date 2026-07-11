import { Storage } from '@apps-in-toss/web-framework';
import type { SavedRecord } from '@shared/types';

const PREFIX = 'uml_app_v1';

async function sdkGet(key: string): Promise<string | null> {
  try {
    return await Storage.getItem(key);
  } catch {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }
}

async function sdkSet(key: string, value: string): Promise<void> {
  try {
    await Storage.setItem(key, value);
  } catch {
    window.localStorage.setItem(key, value);
  }
}

async function sdkRemove(key: string): Promise<void> {
  try {
    await Storage.removeItem(key);
  } catch {
    window.localStorage.removeItem(key);
  }
}

function recordsKey(userId: string): string {
  return `${PREFIX}:${userId}:records`;
}

export async function loadRecords(userId: string): Promise<SavedRecord[]> {
  const raw = await sdkGet(recordsKey(userId));
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item && typeof item.id === 'string' && typeof item.title === 'string').slice(0, 50);
  } catch {
    return [];
  }
}

export async function saveRecords(userId: string, records: SavedRecord[]): Promise<void> {
  await sdkSet(recordsKey(userId), JSON.stringify(records.slice(0, 50)));
}

export async function addRecord(userId: string, record: SavedRecord): Promise<SavedRecord[]> {
  const existing = await loadRecords(userId);
  const next = [record, ...existing.filter((item) => item.id !== record.id)].slice(0, 50);
  await saveRecords(userId, next);
  return next;
}

export async function deleteRecord(userId: string, id: string): Promise<SavedRecord[]> {
  const existing = await loadRecords(userId);
  const next = existing.filter((item) => item.id !== id);
  await saveRecords(userId, next);
  return next;
}

export async function clearRecords(userId: string): Promise<void> {
  await sdkRemove(recordsKey(userId));
}
