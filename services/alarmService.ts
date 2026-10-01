import * as Device from 'expo-device';
import { Platform } from 'react-native';
import notifee, { 
  AndroidImportance, 
  AndroidCategory, 
  TriggerType, 
  RepeatFrequency, 
  TimestampTrigger,
  AndroidNotificationVisibility
} from '@notifee/react-native';
import { Alarm } from '../store/useAppStore';
import { DAYS } from '../constants/theme';

// ==================== PERMISSIONS ====================

export async function requestAlarmPermissions(): Promise<boolean> {
  if (!Device.isDevice) {
    console.log('Not a physical device - notifications may not work in simulator');
    return true;
  }

  const settings = await notifee.requestPermission();
  let finalStatus = settings.authorizationStatus >= 1;

  if (Platform.OS === 'android') {
    await notifee.createChannel({
      id: 'alarms',
      name: 'Alarms',
      importance: AndroidImportance.HIGH,
      vibration: true,
      vibrationPattern: [0, 500, 200, 500],
      lightColor: '#7C5CFC',
      sound: 'default',
      bypassDnd: true,
      visibility: AndroidNotificationVisibility.PUBLIC,
    });
  }

  return finalStatus;
}

// ==================== SCHEDULE ALARM ====================

export async function scheduleAlarm(alarm: Alarm): Promise<string[]> {
  const notificationIds: string[] = [];
  if (!alarm.isEnabled) return notificationIds;

  const [hours, minutes] = alarm.time.split(':').map(Number);
  const hasRepeatDays = alarm.days.some(Boolean);
  
  const createTrigger = async (timestamp: number, id: string) => {
    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp,
      repeatFrequency: hasRepeatDays ? RepeatFrequency.WEEKLY : undefined,
      alarmManager: { allowWhileIdle: true },
    };

    await notifee.createTriggerNotification({
      id,
      title: alarm.label || 'Suari Ka Alarm',
      body: `Wake up! It's time for ${alarm.label || 'your alarm'}.`,
      android: {
        channelId: 'alarms',
        category: AndroidCategory.ALARM,
        flags: ['insistent'], // This forces the sound to LOOP continuously!
        fullScreenAction: {
          id: 'default',
        },
        pressAction: {
          id: 'default',
        },
      },
      data: { alarmId: alarm.id, type: 'alarm' },
    }, trigger);
  };

  if (hasRepeatDays) {
    // Schedule for each enabled day
    for (let i = 0; i < 7; i++) {
      if (alarm.days[i]) {
        const notifId = `${alarm.id}-${i}`;
        const now = new Date();
        let target = new Date(now);
        target.setHours(hours, minutes, 0, 0);
        
        let dayOffset = (i - target.getDay() + 7) % 7;
        if (dayOffset === 0 && target.getTime() <= now.getTime()) {
          dayOffset = 7;
        }
        target.setDate(target.getDate() + dayOffset);
        
        await createTrigger(target.getTime(), notifId);
        notificationIds.push(notifId);
      }
    }
  } else {
    // One-time alarm
    const notifId = `${alarm.id}-once`;
    const now = new Date();
    const alarmTime = new Date();
    alarmTime.setHours(hours, minutes, 0, 0);

    if (alarmTime.getTime() <= now.getTime()) {
      alarmTime.setDate(alarmTime.getDate() + 1);
    }
    await createTrigger(alarmTime.getTime(), notifId);
    notificationIds.push(notifId);
  }

  return notificationIds;
}

// ==================== CANCEL ALARM ====================

export async function cancelAlarm(notificationIds?: string[]): Promise<void> {
  if (notificationIds && notificationIds.length > 0) {
    await notifee.cancelTriggerNotifications(notificationIds);
  }
}

// ==================== SNOOZE ALARM ====================

export async function snoozeAlarm(alarm: Alarm, snoozeDuration: number = 5): Promise<string> {
  const snoozeTime = new Date();
  snoozeTime.setMinutes(snoozeTime.getMinutes() + snoozeDuration);
  const id = `${alarm.id}-snooze-${Date.now()}`;

  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: snoozeTime.getTime(),
    alarmManager: { allowWhileIdle: true },
  };

  await notifee.createTriggerNotification({
    id,
    title: '😴 Snooze - ' + (alarm.label || 'Alarm'),
    body: `Ringing again in ${snoozeDuration} minutes.`,
    android: {
      channelId: 'alarms',
      category: AndroidCategory.ALARM,
      flags: ['insistent'],
      fullScreenAction: { id: 'default' },
      pressAction: { id: 'default' },
    },
    data: { alarmId: alarm.id, type: 'snooze' },
  }, trigger);

  return id;
}

// ==================== SETUP ALARM ACTIONS ====================
// Notifee registers actions directly in the notification or via setNotificationCategories.
// We can define custom categories if needed, but pressActions cover most use cases.
export async function setupAlarmActions(): Promise<void> {
  // Can be left empty for Notifee as actions are set per-notification, 
  // or setup background action handlers.
}

// ==================== HELPERS ====================

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
