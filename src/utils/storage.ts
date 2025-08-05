import { GachaEvent, GachaRecord } from '../types';

// 抽卡事件相关存储
const EVENTS_KEY = 'gacha_events';

export const saveEvents = (events: GachaEvent[]): void => {
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
};

export const loadEvents = (): GachaEvent[] => {
  const data = localStorage.getItem(EVENTS_KEY);
  if (!data) return [];
  
  try {
    const events = JSON.parse(data);
    return events.map((event: any) => ({
      ...event,
      createdAt: new Date(event.createdAt),
      updatedAt: new Date(event.updatedAt),
    }));
  } catch (error) {
    console.error('Failed to load events:', error);
    return [];
  }
};

// 抽卡记录相关存储
const RECORDS_KEY = 'gacha_records';

export const saveRecords = (records: GachaRecord[]): void => {
  localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
};

export const loadRecords = (): GachaRecord[] => {
  const data = localStorage.getItem(RECORDS_KEY);
  if (!data) return [];
  
  try {
    const records = JSON.parse(data);
    return records.map((record: any) => ({
      ...record,
      timestamp: new Date(record.timestamp),
    }));
  } catch (error) {
    console.error('Failed to load records:', error);
    return [];
  }
}; 