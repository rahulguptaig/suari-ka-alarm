import { Alarm } from '../store/useAppStore';
import { DAYS } from '../constants/theme';

export async function requestAlarmPermissions(): Promise<boolean> {
  return true;
}

export async function scheduleAlarm(alarm: Alarm): Promise<string[]> {
  return [];
}

export async function cancelAlarm(notificationIds?: string[]): Promise<void> {
  // No-op on web
}

export async function snoozeAlarm(alarm: Alarm, snoozeDuration: number = 5): Promise<string> {
  return '';
}

export async function setupAlarmActions(): Promise<void> {
  // No-op on web
}

export function getNextAlarmTime(alarm: Alarm): string {
  const [hours, minutes] = alarm.time.split(':').map(Number);
  const now = new Date();
  const alarmTime = new Date();
  alarmTime.setHours(hours, minutes, 0, 0);

  const hasRepeatDays = alarm.days.some(Boolean);

  if (!hasRepeatDays) {
    if (alarmTime <= now) {
      alarmTime.setDate(alarmTime.getDate() + 1);
    }
    const diffMs = alarmTime.getTime() - now.getTime();
    return formatTimeDiff(diffMs);
  }

  const currentDay = now.getDay();
  for (let offset = 0; offset < 7; offset++) {
    const checkDay = (currentDay + offset) % 7;
    if (alarm.days[checkDay]) {
      const checkTime = new Date();
      checkTime.setDate(now.getDate() + offset);
      checkTime.setHours(hours, minutes, 0, 0);

      if (checkTime > now) {
        const diffMs = checkTime.getTime() - now.getTime();
        return formatTimeDiff(diffMs);
      }
    }
  }

  return 'Tomorrow';
}

function formatTimeDiff(ms: number): string {
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `in ${minutes} mins`;
  if (minutes === 0) return `in ${hours} hrs`;
  return `in ${hours} hrs ${minutes} mins`;
}

export function getAlarmDaysText(days: boolean[]): string {
  const enabledDays = days
    .map((enabled, i) => (enabled ? DAYS[i] : null))
    .filter(Boolean);

  if (enabledDays.length === 0) return 'Once';
  if (enabledDays.length === 7) return 'Everyday';
  if (enabledDays.length === 5 && !days[0] && !days[6]) return 'Weekdays';
  if (enabledDays.length === 2 && days[0] && days[6]) return 'Weekends';
  return enabledDays.join(', ');
}

export function formatAlarmTime(time: string, use12Hour: boolean = true): { hour: string; minute: string; period: string } {
  const [hours, minutes] = time.split(':').map(Number);

  if (!use12Hour) {
    return {
      hour: String(hours).padStart(2, '0'),
      minute: String(minutes).padStart(2, '0'),
      period: '',
    };
  }

  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;

  return {
    hour: String(hour12).padStart(2, '0'),
    minute: String(minutes).padStart(2, '0'),
    period,
  };
}
