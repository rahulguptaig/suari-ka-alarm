import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore, Alarm } from '../../store/useAppStore';
import { scheduleAlarm } from '../../services/alarmService';
import { COLORS, BORDER_RADIUS, SPACING, DAYS, ALARM_SOUNDS } from '../../constants/theme';

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

export default function NewAlarmScreen() {
  const { addAlarm } = useAppStore();

  const [selectedHour, setSelectedHour] = useState('06');
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>('AM');
  const [label, setLabel] = useState('');
  const [repeatDays, setRepeatDays] = useState([false, false, false, false, false, false, false]);
  const [vibrate, setVibrate] = useState(true);
  const [snoozeEnabled, setSnoozeEnabled] = useState(true);
  const [snoozeDuration, setSnoozeDuration] = useState(5);
  const [selectedSound, setSelectedSound] = useState('default');

  const toggleDay = (index: number) => {
    const newDays = [...repeatDays];
    newDays[index] = !newDays[index];
    setRepeatDays(newDays);
  };

  const handleSave = async () => {
    const hour24 = selectedPeriod === 'AM'
      ? (selectedHour === '12' ? 0 : parseInt(selectedHour))
      : (selectedHour === '12' ? 12 : parseInt(selectedHour) + 12);

    const timeStr = `${String(hour24).padStart(2, '0')}:${selectedMinute}`;

    const newAlarm: Alarm = {
      id: Date.now().toString(),
      time: timeStr,
      label: label || 'Alarm',
      isEnabled: true,
      days: repeatDays,
      sound: selectedSound,
      vibrate,
      snoozeEnabled,
      snoozeDuration,
      createdAt: new Date().toISOString(),
    };

    addAlarm(newAlarm);

    try {
      await scheduleAlarm(newAlarm);
      Alert.alert('✅ Alarm Set!', `Alarm ${selectedHour}:${selectedMinute} ${selectedPeriod} ke liye set ho gaya!`);
    } catch (e) {
      Alert.alert('⚠️ Warning', 'Alarm save ho gaya lekin notification schedule nahi ho saka.');
    }

    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="close" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Naya Alarm</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
          <LinearGradient colors={['#7C5CFC', '#5B3FD9']} style={styles.saveBtnGrad}>
            <Text style={styles.saveBtnText}>Save</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Time Picker */}
        <LinearGradient
          colors={['rgba(124,92,252,0.15)', 'rgba(124,92,252,0.05)']}
          style={styles.timePickerCard}
        >
          <Text style={styles.sectionLabel}>Time</Text>
          <View style={styles.timePicker}>
            {/* Hours */}
            <ScrollView
              style={styles.pickerColumn}
              showsVerticalScrollIndicator={false}
              snapToInterval={44}
              decelerationRate="fast"
            >
              {HOURS.map((h) => (
                <TouchableOpacity
                  key={h}
                  onPress={() => setSelectedHour(h)}
                  style={[styles.pickerItem, selectedHour === h && styles.pickerItemSelected]}
                >
                  <Text style={[styles.pickerText, selectedHour === h && styles.pickerTextSelected]}>
                    {h}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.pickerColon}>:</Text>

            {/* Minutes */}
            <ScrollView
              style={styles.pickerColumn}
              showsVerticalScrollIndicator={false}
              snapToInterval={44}
              decelerationRate="fast"
            >
              {MINUTES.map((m) => (
                <TouchableOpacity
                  key={m}
                  onPress={() => setSelectedMinute(m)}
                  style={[styles.pickerItem, selectedMinute === m && styles.pickerItemSelected]}
                >
                  <Text style={[styles.pickerText, selectedMinute === m && styles.pickerTextSelected]}>
                    {m}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* AM/PM */}
            <View style={styles.periodPicker}>
              {(['AM', 'PM'] as const).map((p) => (
                <TouchableOpacity
                  key={p}
                  onPress={() => setSelectedPeriod(p)}
                  style={[styles.periodBtn, selectedPeriod === p && styles.periodBtnSelected]}
                >
                  <Text style={[styles.periodText, selectedPeriod === p && styles.periodTextSelected]}>
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Display */}
          <Text style={styles.timeDisplay}>
            {selectedHour}:{selectedMinute} {selectedPeriod}
          </Text>
        </LinearGradient>

        {/* Label */}
        <View style={styles.settingCard}>
          <Text style={styles.settingLabel}>Label</Text>
          <TouchableOpacity
            style={styles.labelInput}
            onPress={() => {
              Alert.prompt('Alarm Label', 'Alarm ka naam dalo:', (text) => setLabel(text), 'plain-text', label);
            }}
          >
            <Text style={[styles.labelText, !label && styles.labelPlaceholder]}>
              {label || 'Alarm ka naam (optional)'}
            </Text>
            <Ionicons name="pencil" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Repeat Days */}
        <View style={styles.settingCard}>
          <Text style={styles.settingLabel}>Repeat Days</Text>
          <View style={styles.daysRow}>
            {DAYS.map((day, index) => (
              <TouchableOpacity
                key={day}
                onPress={() => toggleDay(index)}
                style={[
                  styles.dayButton,
                  repeatDays[index] && styles.dayButtonActive,
                ]}
              >
                <Text style={[styles.dayText, repeatDays[index] && styles.dayTextActive]}>
                  {day}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.repeatInfo}>
            {repeatDays.some(Boolean)
              ? `Repeat: ${DAYS.filter((_, i) => repeatDays[i]).join(', ')}`
              : 'One time only'}
          </Text>
        </View>

        {/* Sound */}
        <View style={styles.settingCard}>
          <Text style={styles.settingLabel}>Alarm Sound</Text>
          {ALARM_SOUNDS.map((sound) => (
            <TouchableOpacity
              key={sound.id}
              style={[styles.soundItem, selectedSound === sound.id && styles.soundItemActive]}
              onPress={() => setSelectedSound(sound.id)}
            >
              <Ionicons
                name="musical-note-outline"
                size={18}
                color={selectedSound === sound.id ? COLORS.primary : COLORS.textMuted}
              />
              <Text style={[styles.soundName, selectedSound === sound.id && styles.soundNameActive]}>
                {sound.name}
              </Text>
              {selectedSound === sound.id && (
                <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
              )}
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
            value={vibrate}
            onValueChange={setVibrate}
            trackColor={{ false: 'rgba(96,96,128,0.3)', true: 'rgba(124,92,252,0.6)' }}
            thumbColor={vibrate ? COLORS.primary : COLORS.textMuted}
          />
        </View>

        {/* Snooze */}
        <View style={styles.settingRow}>
          <View style={styles.settingRowLeft}>
            <Ionicons name="alarm-outline" size={20} color={COLORS.warning} />
            <Text style={styles.settingRowLabel}>Snooze</Text>
          </View>
          <Switch
            value={snoozeEnabled}
            onValueChange={setSnoozeEnabled}
            trackColor={{ false: 'rgba(96,96,128,0.3)', true: 'rgba(255,215,64,0.5)' }}
            thumbColor={snoozeEnabled ? COLORS.warning : COLORS.textMuted}
          />
        </View>

        {snoozeEnabled && (
          <View style={styles.settingCard}>
            <Text style={styles.settingLabel}>Snooze Duration</Text>
            <View style={styles.snoozeDurations}>
              {[5, 10, 15, 20].map((min) => (
                <TouchableOpacity
                  key={min}
                  style={[styles.snoozeBtn, snoozeDuration === min && styles.snoozeBtnActive]}
                  onPress={() => setSnoozeDuration(min)}
                >
                  <Text style={[styles.snoozeText, snoozeDuration === min && styles.snoozeTextActive]}>
                    {min}m
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: 60,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(124,92,252,0.15)',
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'SpaceGrotesk-Bold',
    color: COLORS.textPrimary,
  },
  saveBtn: {
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
  },
  saveBtnGrad: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  saveBtnText: {
    color: '#fff',
    fontFamily: 'SpaceGrotesk-SemiBold',
    fontSize: 14,
  },

  content: {
    padding: SPACING.lg,
    gap: SPACING.md,
    paddingBottom: 100,
  },

  // Time picker
  timePickerCard: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(124,92,252,0.25)',
    alignItems: 'center',
  },
  sectionLabel: {
    fontSize: 13,
    fontFamily: 'SpaceGrotesk-Medium',
    color: COLORS.textMuted,
    alignSelf: 'flex-start',
    marginBottom: SPACING.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  timePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    height: 180,
  },
  pickerColumn: {
    width: 60,
    height: 180,
  },
  pickerItem: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.sm,
  },
  pickerItemSelected: {
    backgroundColor: 'rgba(124,92,252,0.2)',
  },
  pickerText: {
    fontSize: 24,
    fontFamily: 'SpaceGrotesk-Medium',
    color: COLORS.textMuted,
  },
  pickerTextSelected: {
    color: COLORS.primary,
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 28,
  },
  pickerColon: {
    fontSize: 36,
    fontFamily: 'SpaceGrotesk-Bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  periodPicker: {
    gap: SPACING.sm,
    marginLeft: SPACING.md,
  },
  periodBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  periodBtnSelected: {
    backgroundColor: 'rgba(124,92,252,0.2)',
    borderColor: COLORS.primary,
  },
  periodText: {
    fontSize: 14,
    fontFamily: 'SpaceGrotesk-SemiBold',
    color: COLORS.textMuted,
  },
  periodTextSelected: { color: COLORS.primary },
  timeDisplay: {
    fontSize: 36,
    fontFamily: 'SpaceGrotesk-Bold',
    color: COLORS.primary,
    marginTop: SPACING.md,
    letterSpacing: 2,
  },

  // Settings
  settingCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    gap: SPACING.sm,
  },
  settingLabel: {
    fontSize: 12,
    fontFamily: 'SpaceGrotesk-Medium',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  labelInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  labelText: {
    fontSize: 16,
    fontFamily: 'SpaceGrotesk-Medium',
    color: COLORS.textPrimary,
  },
  labelPlaceholder: { color: COLORS.textMuted },

  // Days
  daysRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    justifyContent: 'space-between',
  },
  dayButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  dayButtonActive: {
    backgroundColor: 'rgba(124,92,252,0.2)',
    borderColor: COLORS.primary,
  },
  dayText: {
    fontSize: 11,
    fontFamily: 'SpaceGrotesk-SemiBold',
    color: COLORS.textMuted,
  },
  dayTextActive: { color: COLORS.primary },
  repeatInfo: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: 'SpaceGrotesk-Regular',
  },

  // Sound
  soundItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  soundItemActive: { backgroundColor: 'rgba(124,92,252,0.1)' },
  soundName: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'SpaceGrotesk-Regular',
    color: COLORS.textSecondary,
  },
  soundNameActive: { color: COLORS.primary },

  // Setting rows
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.bgCard,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  settingRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  settingRowLabel: {
    fontSize: 15,
    fontFamily: 'SpaceGrotesk-Medium',
    color: COLORS.textPrimary,
  },

  // Snooze
  snoozeDurations: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  snoozeBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255,215,64,0.2)',
    backgroundColor: 'rgba(255,215,64,0.05)',
  },
  snoozeBtnActive: {
    backgroundColor: 'rgba(255,215,64,0.2)',
    borderColor: COLORS.warning,
  },
  snoozeText: {
    fontSize: 14,
    fontFamily: 'SpaceGrotesk-SemiBold',
    color: COLORS.textMuted,
  },
  snoozeTextActive: { color: COLORS.warning },
});
