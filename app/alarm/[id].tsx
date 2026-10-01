import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore, Alarm } from '../../store/useAppStore';
import { scheduleAlarm, cancelAlarm, formatAlarmTime, getAlarmDaysText } from '../../services/alarmService';
import { COLORS, BORDER_RADIUS, SPACING, DAYS, ALARM_SOUNDS } from '../../constants/theme';

export default function AlarmDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { alarms, updateAlarm, deleteAlarm } = useAppStore();

  const alarm = alarms.find(a => a.id === id);

  const [localAlarm, setLocalAlarm] = useState<Alarm | null>(alarm || null);
  const [changed, setChanged] = useState(false);

  useEffect(() => {
    if (alarm) setLocalAlarm({ ...alarm });
  }, []);

  if (!alarm || !localAlarm) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: COLORS.textMuted, fontSize: 16 }}>Alarm not found!</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: COLORS.primary }}>Wapas Jao</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const update = (field: keyof Alarm, value: any) => {
    setLocalAlarm(prev => prev ? { ...prev, [field]: value } : prev);
    setChanged(true);
  };

  const toggleDay = (index: number) => {
    const newDays = [...localAlarm.days];
    newDays[index] = !newDays[index];
    update('days', newDays);
  };

  const handleSave = async () => {
    updateAlarm(localAlarm.id, localAlarm);
    if (localAlarm.isEnabled) {
      await scheduleAlarm(localAlarm);
    } else {
      await cancelAlarm();
    }
    Alert.alert('Saved!', 'Alarm updated successfully!');
    router.back();
  };

  const handleDelete = () => {
    Alert.alert('Delete Alarm?', `"${alarm.label || alarm.time}" alarm delete hoga.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: () => {
          deleteAlarm(alarm.id);
          router.back();
        }
      },
    ]);
  };

  const { hour, minute, period } = formatAlarmTime(localAlarm.time);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="close" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Alarm</Text>
        <View style={styles.headerRight}>
          {changed && (
            <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
              <LinearGradient colors={['#7C5CFC', '#5B3FD9']} style={styles.saveBtnGrad}>
                <Text style={styles.saveBtnText}>Save</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Time Display */}
        <LinearGradient
          colors={localAlarm.isEnabled ? ['rgba(124,92,252,0.15)', 'rgba(124,92,252,0.05)'] : ['rgba(30,30,60,0.8)', 'rgba(20,20,45,0.8)']}
          style={styles.timeCard}
        >
          {localAlarm.isEnabled && <View style={styles.activeBar} />}
          <Text style={styles.timeDisplay}>{hour}:{minute} <Text style={styles.timePeriod}>{period}</Text></Text>
          <Text style={styles.timeLabel}>{localAlarm.label || 'Alarm'}</Text>
          <Text style={styles.daysText}>{getAlarmDaysText(localAlarm.days)}</Text>

          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>
              {localAlarm.isEnabled ? 'Active' : 'Disabled'}
            </Text>
            <Switch
              value={localAlarm.isEnabled}
              onValueChange={(v) => update('isEnabled', v)}
              trackColor={{ false: 'rgba(96,96,128,0.3)', true: 'rgba(124,92,252,0.6)' }}
              thumbColor={localAlarm.isEnabled ? COLORS.primary : COLORS.textMuted}
            />
          </View>
        </LinearGradient>

        {/* Repeat Days */}
        <View style={styles.settingCard}>
          <Text style={styles.settingLabel}>Repeat Days</Text>
          <View style={styles.daysRow}>
            {DAYS.map((day, i) => (
              <TouchableOpacity
                key={day}
                onPress={() => toggleDay(i)}
                style={[styles.dayBtn, localAlarm.days[i] && styles.dayBtnActive]}
              >
                <Text style={[styles.dayText, localAlarm.days[i] && styles.dayTextActive]}>{day}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Sound */}
        <View style={styles.settingCard}>
          <Text style={styles.settingLabel}>Sound</Text>
          {ALARM_SOUNDS.map(s => (
            <TouchableOpacity
              key={s.id}
              style={[styles.soundItem, localAlarm.sound === s.id && styles.soundItemActive]}
              onPress={() => update('sound', s.id)}
            >
              <Ionicons name="musical-note-outline" size={18} color={localAlarm.sound === s.id ? COLORS.primary : COLORS.textMuted} />
              <Text style={[styles.soundName, localAlarm.sound === s.id && styles.soundNameActive]}>{s.name}</Text>
              {localAlarm.sound === s.id && <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />}
            </TouchableOpacity>
          ))}
        </View>

        {/* Vibrate */}
        <View style={styles.settingRow}>
          <View style={styles.settingRowLeft}>
            <Ionicons name="phone-portrait-outline" size={20} color={COLORS.secondary} />
            <Text style={styles.settingRowLabel}>Vibrate</Text>
          </View>
          <Switch
            value={localAlarm.vibrate}
            onValueChange={(v) => update('vibrate', v)}
            trackColor={{ false: 'rgba(96,96,128,0.3)', true: 'rgba(0,212,255,0.5)' }}
            thumbColor={localAlarm.vibrate ? COLORS.secondary : COLORS.textMuted}
          />
        </View>

        {/* Snooze */}
        <View style={styles.settingRow}>
          <View style={styles.settingRowLeft}>
            <Ionicons name="alarm-outline" size={20} color={COLORS.warning} />
            <Text style={styles.settingRowLabel}>Snooze ({localAlarm.snoozeDuration} min)</Text>
          </View>
          <Switch
            value={localAlarm.snoozeEnabled}
            onValueChange={(v) => update('snoozeEnabled', v)}
            trackColor={{ false: 'rgba(96,96,128,0.3)', true: 'rgba(255,215,64,0.5)' }}
            thumbColor={localAlarm.snoozeEnabled ? COLORS.warning : COLORS.textMuted}
          />
        </View>

        {localAlarm.snoozeEnabled && (
          <View style={styles.settingCard}>
            <Text style={styles.settingLabel}>Snooze Duration</Text>
            <View style={styles.snoozeDurations}>
              {[5, 10, 15, 20].map(min => (
                <TouchableOpacity
                  key={min}
                  style={[styles.snoozeBtn, localAlarm.snoozeDuration === min && styles.snoozeBtnActive]}
                  onPress={() => update('snoozeDuration', min)}
                >
                  <Text style={[styles.snoozeText, localAlarm.snoozeDuration === min && styles.snoozeTextActive]}>
                    {min}m
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Delete Button */}
        <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={20} color={COLORS.error} />
          <Text style={styles.deleteBtnText}>Delete Alarm</Text>
        </TouchableOpacity>

        {/* Save Button */}
        {changed && (
          <TouchableOpacity onPress={handleSave} style={styles.saveFab}>
            <LinearGradient colors={['#7C5CFC', '#5B3FD9']} style={styles.saveFabGrad}>
              <Ionicons name="checkmark" size={20} color="#fff" />
              <Text style={styles.saveFabText}>Save Changes</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingTop: 60, paddingBottom: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: 'rgba(124,92,252,0.15)',
  },
  backBtn: {
    width: 40, height: 40, alignItems: 'center', justifyContent: 'center',
    borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)',
  },
  headerTitle: { fontSize: 18, fontFamily: 'SpaceGrotesk-Bold', color: COLORS.textPrimary },
  headerRight: { width: 70, alignItems: 'flex-end' },
  saveBtn: { borderRadius: BORDER_RADIUS.full, overflow: 'hidden' },
  saveBtnGrad: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
  saveBtnText: { color: '#fff', fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 13 },

  content: { padding: SPACING.lg, gap: SPACING.md, paddingBottom: 100 },

  timeCard: {
    borderRadius: BORDER_RADIUS.xl, padding: SPACING.lg,
    borderWidth: 1, borderColor: 'rgba(124,92,252,0.25)', gap: SPACING.sm, overflow: 'hidden',
  },
  activeBar: { height: 3, backgroundColor: COLORS.primary, marginHorizontal: -SPACING.lg, marginTop: -SPACING.lg, marginBottom: SPACING.sm },
  timeDisplay: { fontSize: 56, fontFamily: 'SpaceGrotesk-Bold', color: COLORS.textPrimary },
  timePeriod: { fontSize: 24, color: COLORS.primary },
  timeLabel: { fontSize: 16, fontFamily: 'SpaceGrotesk-SemiBold', color: COLORS.textSecondary },
  daysText: { fontSize: 13, color: COLORS.textMuted, fontFamily: 'SpaceGrotesk-Regular' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: SPACING.sm },
  toggleLabel: { fontSize: 14, color: COLORS.textSecondary, fontFamily: 'SpaceGrotesk-Medium' },

  settingCard: {
    backgroundColor: COLORS.bgCard, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', gap: SPACING.sm,
  },
  settingLabel: {
    fontSize: 12, fontFamily: 'SpaceGrotesk-Medium', color: COLORS.textMuted,
    textTransform: 'uppercase', letterSpacing: 1,
  },
  daysRow: { flexDirection: 'row', gap: 6, justifyContent: 'space-between' },
  dayBtn: {
    width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  dayBtnActive: { backgroundColor: 'rgba(124,92,252,0.2)', borderColor: COLORS.primary },
  dayText: { fontSize: 11, fontFamily: 'SpaceGrotesk-SemiBold', color: COLORS.textMuted },
  dayTextActive: { color: COLORS.primary },

  soundItem: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, padding: SPACING.sm, borderRadius: BORDER_RADIUS.md },
  soundItemActive: { backgroundColor: 'rgba(124,92,252,0.1)' },
  soundName: { flex: 1, fontSize: 14, fontFamily: 'SpaceGrotesk-Regular', color: COLORS.textSecondary },
  soundNameActive: { color: COLORS.primary },

  settingRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.bgCard, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  settingRowLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  settingRowLabel: { fontSize: 15, fontFamily: 'SpaceGrotesk-Medium', color: COLORS.textPrimary },

  snoozeDurations: { flexDirection: 'row', gap: SPACING.sm },
  snoozeBtn: {
    flex: 1, alignItems: 'center', paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.md,
    borderWidth: 1, borderColor: 'rgba(255,215,64,0.2)', backgroundColor: 'rgba(255,215,64,0.05)',
  },
  snoozeBtnActive: { backgroundColor: 'rgba(255,215,64,0.2)', borderColor: COLORS.warning },
  snoozeText: { fontSize: 14, fontFamily: 'SpaceGrotesk-SemiBold', color: COLORS.textMuted },
  snoozeTextActive: { color: COLORS.warning },

  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm,
    backgroundColor: 'rgba(255,82,82,0.1)', borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md, borderWidth: 1, borderColor: 'rgba(255,82,82,0.2)',
  },
  deleteBtnText: { color: COLORS.error, fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 14 },

  saveFab: { borderRadius: BORDER_RADIUS.lg, overflow: 'hidden' },
  saveFabGrad: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: SPACING.sm, paddingVertical: SPACING.md,
  },
  saveFabText: { color: '#fff', fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 16 },
});
