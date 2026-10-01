import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { Alarm } from '../store/useAppStore';
import { DAYS } from '../constants/theme';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// ==================== PERMISSIONS ====================

export async function requestAlarmPermissions(): Promise<boolean> {
  if (!Device.isDevice) {
    console.log('Not a physical device - notifications may not work in simulator');
    return true;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('alarms', {
      name: 'Alarms',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#7C5CFC',
      sound: 'default',
      enableVibrate: true,
      bypassDnd: true,
      audioAttributes: {
        usage: Notifications.AndroidAudioUsage.ALARM,
        contentType: Notifications.AndroidAudioContentType.SONIFICATION,
        flags: {
          enforceAudibility: true,
          requestHardwareAudioVideoSynchronization: true,
        },
      },
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
  }

  return finalStatus === 'granted';
}

// ==================== SCHEDULE ALARM ====================

export async function scheduleAlarm(alarm: Alarm): Promise<string[]> {
  const notificationIds: string[] = [];

  if (!alarm.isEnabled) return notificationIds;

  const [hours, minutes] = alarm.time.split(':').map(Number);

  // Check if alarm repeats on specific days
  const hasRepeatDays = alarm.days.some(Boolean);

  if (hasRepeatDays) {
    // Schedule for each enabled day
    for (let i = 0; i < 7; i++) {
      if (alarm.days[i]) {
        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title: alarm.label || 'Suari Ka Alarm',
            body: `Good morning! ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
            sound: true,
            vibrate: alarm.vibrate ? [0, 500, 200, 500] : undefined,
            priority: Notifications.AndroidNotificationPriority.MAX,
            categoryIdentifier: 'alarm',
            data: { alarmId: alarm.id, type: 'alarm' },
          },
          trigger: {
            weekday: i + 1, // 1=Sunday, 2=Monday, etc.
            hour: hours,
            minute: minutes,
            second: 0,
            repeats: true,
          } as any,
        });
        notificationIds.push(id);
      }
    }
  } else {
    // One-time alarm - next occurrence
    const now = new Date();
    const alarmTime = new Date();
    alarmTime.setHours(hours, minutes, 0, 0);

    if (alarmTime <= now) {
      alarmTime.setDate(alarmTime.getDate() + 1);
    }

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: alarm.label || 'Suari Ka Alarm',
        body: `Wake up! ${alarm.label || 'Alarm is ringing!'}`,
        sound: true,
        vibrate: alarm.vibrate ? [0, 500, 200, 500] : undefined,
        priority: Notifications.AndroidNotificationPriority.MAX,
        categoryIdentifier: 'alarm',
        data: { alarmId: alarm.id, type: 'alarm' },
      },
      trigger: {
        date: alarmTime,
      },
    });
    notificationIds.push(id);
  }

  return notificationIds;
}

// ==================== CANCEL ALARM ====================

export async function cancelAlarm(notificationIds?: string[]): Promise<void> {
  if (notificationIds && notificationIds.length > 0) {
    for (const id of notificationIds) {
      await Notifications.cancelScheduledNotificationAsync(id);
    }
  }
}

// ==================== SNOOZE ALARM ====================

export async function snoozeAlarm(alarm: Alarm, snoozeDuration: number = 5): Promise<string> {
  const snoozeTime = new Date();
  snoozeTime.setMinutes(snoozeTime.getMinutes() + snoozeDuration);

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: '😴 Snooze - ' + (alarm.label || 'Alarm'),
      body: `${snoozeDuration} minute baad phir bajega!`,
      sound: true,
      vibrate: [0, 500, 200, 500],
      priority: Notifications.AndroidNotificationPriority.MAX,
      data: { alarmId: alarm.id, type: 'snooze' },
    },
    trigger: {
      date: snoozeTime,
    },
  });

  return id;
}

// ==================== SETUP ALARM ACTIONS ====================

export async function setupAlarmActions(): Promise<void> {
  await Notifications.setNotificationCategoryAsync('alarm', [
    {
      identifier: 'snooze',
      buttonTitle: '5 min Snooze',
      options: { opensAppToForeground: false },
    },
    {
      identifier: 'dismiss',
      buttonTitle: 'Dismiss',
      options: { opensAppToForeground: false, isDestructive: true },
    },
  ]);
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

  // Find next enabled day
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
