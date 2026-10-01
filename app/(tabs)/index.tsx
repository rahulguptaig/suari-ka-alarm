import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Switch,
  Animated,
  RefreshControl,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppStore, Alarm } from '../../store/useAppStore';
import { formatAlarmTime, getAlarmDaysText, getNextAlarmTime, cancelAlarm, scheduleAlarm } from '../../services/alarmService';
import { COLORS, BORDER_RADIUS, SPACING } from '../../constants/theme';

// ==================== CLOCK DISPLAY ====================
function LiveClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = String(time.getHours() % 12 || 12).padStart(2, '0');
  const minutes = String(time.getMinutes()).padStart(2, '0');
  const seconds = String(time.getSeconds()).padStart(2, '0');
  const period = time.getHours() >= 12 ? 'PM' : 'AM';
  const { language } = useAppStore();
  const localeMap: Record<string, string> = {
    en: 'en-US',
    hin: 'en-IN',
    hi: 'hi-IN',
    bhoj: 'hi-IN',
  };

  const dateStr = time.toLocaleDateString(localeMap[language] || 'en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <View style={styles.clockContainer}>
      <LinearGradient
        colors={['rgba(124,92,252,0.15)', 'rgba(0,212,255,0.08)', 'transparent']}
        style={styles.clockGradient}
      >
        <Text style={styles.clockDate}>{dateStr}</Text>
        <View style={styles.clockTimeRow}>
          <Text style={styles.clockHours}>{hours}</Text>
          <Text style={styles.clockColon}>:</Text>
          <Text style={styles.clockMinutes}>{minutes}</Text>
          <View style={styles.clockRight}>
            <Text style={styles.clockPeriod}>{period}</Text>
            <Text style={styles.clockSeconds}>{seconds}</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

// ==================== ALARM CARD ====================
function AlarmCard({ alarm, onToggle, onPress, onDelete }: {
  alarm: Alarm;
  onToggle: () => void;
  onPress: () => void;
  onDelete: () => void;
}) {
  const { hour, minute, period } = formatAlarmTime(alarm.time);
  const daysText = getAlarmDaysText(alarm.days);
  const nextTime = alarm.isEnabled ? getNextAlarmTime(alarm) : null;

  const scaleAnim = new Animated.Value(1);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
  };

  return (
    <Animated.View style={[styles.alarmCard, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={styles.alarmCardInner}
      >
        <LinearGradient
          colors={
            alarm.isEnabled
              ? ['rgba(124,92,252,0.15)', 'rgba(124,92,252,0.05)']
              : ['rgba(30,30,60,0.8)', 'rgba(20,20,45,0.8)']
          }
          style={styles.alarmCardGradient}
        >
          {alarm.isEnabled && (
            <View style={styles.alarmActiveBar} />
          )}

          <View style={styles.alarmCardContent}>
            {/* Time */}
            <View style={styles.alarmTimeSection}>
              <View style={styles.alarmTimeRow}>
                <Text style={[styles.alarmTimeText, !alarm.isEnabled && styles.alarmTimeDisabled]}>
                  {hour}:{minute}
                </Text>
                <Text style={[styles.alarmPeriod, !alarm.isEnabled && styles.alarmTimeDisabled]}>
                  {period}
                </Text>
              </View>
              <View style={styles.alarmMeta}>
                <Text style={styles.alarmLabel}>{alarm.label || 'Alarm'}</Text>
                <Text style={styles.alarmDays}>{daysText}</Text>
              </View>
              {nextTime && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Ionicons name="notifications" size={14} color={COLORS.primary} />
                  <Text style={styles.alarmNext}>{nextTime}</Text>
                </View>
              )}
            </View>

            {/* Controls */}
            <View style={styles.alarmControls}>
              <Switch
                value={alarm.isEnabled}
                onValueChange={onToggle}
                trackColor={{ false: 'rgba(96,96,128,0.3)', true: 'rgba(124,92,252,0.6)' }}
                thumbColor={alarm.isEnabled ? COLORS.primary : COLORS.textMuted}
                ios_backgroundColor="rgba(96,96,128,0.3)"
              />
              <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
                <Ionicons name="trash-outline" size={18} color={COLORS.error} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Features row */}
          <View style={styles.alarmFeatures}>
            {alarm.vibrate && (
              <View style={styles.featurePill}>
                <MaterialCommunityIcons name="vibrate" size={12} color={COLORS.secondary} />
                <Text style={styles.featurePillText}>Vibrate</Text>
              </View>
            )}
            {alarm.snoozeEnabled && (
              <View style={styles.featurePill}>
                <Ionicons name="alarm-outline" size={12} color={COLORS.warning} />
                <Text style={styles.featurePillText}>Snooze {alarm.snoozeDuration}m</Text>
              </View>
            )}
            <View style={styles.featurePill}>
              <Ionicons name="musical-note-outline" size={12} color={COLORS.accent} />
              <Text style={styles.featurePillText}>{alarm.sound}</Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ==================== MAIN SCREEN ====================
export default function AlarmScreen() {
  const { alarms, toggleAlarm, deleteAlarm } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);

  const enabledCount = alarms.filter(a => a.isEnabled).length;

  const handleToggle = useCallback(async (alarm: Alarm) => {
    toggleAlarm(alarm.id);
    if (!alarm.isEnabled) {
      await scheduleAlarm({ ...alarm, isEnabled: true });
    } else {
      await cancelAlarm();
    }
  }, [toggleAlarm]);

  const handleDelete = useCallback((alarm: Alarm) => {
    Alert.alert(
      'Delete Alarm?',
      `The alarm "${alarm.label || alarm.time}" will be deleted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteAlarm(alarm.id),
        },
      ]
    );
  }, [deleteAlarm]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="alarm-off" size={80} color="rgba(124,92,252,0.3)" />
      <Text style={styles.emptyTitle}>No Alarms</Text>
      <Text style={styles.emptySubtitle}>Press + to add your first alarm!</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Suari Ka Alarm</Text>
          <Text style={styles.headerSubtitle}>
            {enabledCount > 0
              ? `${enabledCount} alarm${enabledCount > 1 ? 's' : ''} active hai`
              : 'Koi alarm active nahi'}
          </Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => router.push('/alarm/new')}>
          <LinearGradient colors={['#7C5CFC', '#5B3FD9']} style={styles.addButtonGradient}>
            <Ionicons name="add" size={28} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <FlatList
        data={alarms}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={<LiveClock />}
        ListEmptyComponent={renderEmpty}
        renderItem={({ item }) => (
          <AlarmCard
            alarm={item}
            onToggle={() => handleToggle(item)}
            onPress={() => router.push(`/alarm/${item.id}`)}
            onDelete={() => handleDelete(item)}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: 60,
    paddingBottom: SPACING.md,
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: 'SpaceGrotesk-Bold',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: 13,
    fontFamily: 'SpaceGrotesk-Regular',
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  addButton: {
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
  },
  addButtonGradient: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7C5CFC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 100,
  },

  // Clock
  clockContainer: {
    marginBottom: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
  },
  clockGradient: {
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: 'rgba(124,92,252,0.2)',
    alignItems: 'center',
  },
  clockDate: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: 'SpaceGrotesk-Medium',
    marginBottom: SPACING.sm,
  },
  clockTimeRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  clockHours: {
    fontSize: 72,
    fontFamily: 'SpaceGrotesk-Bold',
    color: COLORS.textPrimary,
    lineHeight: 80,
  },
  clockColon: {
    fontSize: 60,
    fontFamily: 'SpaceGrotesk-Bold',
    color: COLORS.primary,
    lineHeight: 70,
    marginBottom: 4,
  },
  clockMinutes: {
    fontSize: 72,
    fontFamily: 'SpaceGrotesk-Bold',
    color: COLORS.textPrimary,
    lineHeight: 80,
  },
  clockRight: {
    marginLeft: SPACING.sm,
    marginBottom: 8,
    alignItems: 'flex-start',
    gap: 4,
  },
  clockPeriod: {
    fontSize: 20,
    fontFamily: 'SpaceGrotesk-Bold',
    color: COLORS.primary,
  },
  clockSeconds: {
    fontSize: 14,
    fontFamily: 'SpaceGrotesk-Medium',
    color: COLORS.textMuted,
  },

  // Alarm Cards
  alarmCard: {
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  alarmCardInner: {
    flex: 1,
  },
  alarmCardGradient: {
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(124,92,252,0.2)',
    overflow: 'hidden',
  },
  alarmActiveBar: {
    height: 3,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  alarmCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  alarmTimeSection: {
    flex: 1,
  },
  alarmTimeRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  alarmTimeText: {
    fontSize: 42,
    fontFamily: 'SpaceGrotesk-Bold',
    color: COLORS.textPrimary,
    lineHeight: 48,
  },
  alarmPeriod: {
    fontSize: 16,
    fontFamily: 'SpaceGrotesk-Medium',
    color: COLORS.primary,
    marginBottom: 6,
  },
  alarmTimeDisabled: {
    color: COLORS.textMuted,
  },
  alarmMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: 2,
  },
  alarmLabel: {
    fontSize: 14,
    fontFamily: 'SpaceGrotesk-SemiBold',
    color: COLORS.textSecondary,
  },
  alarmDays: {
    fontSize: 12,
    fontFamily: 'SpaceGrotesk-Regular',
    color: COLORS.textMuted,
  },
  alarmNext: {
    fontSize: 11,
    fontFamily: 'SpaceGrotesk-Medium',
    color: COLORS.success,
    marginTop: 2,
  },
  alarmControls: {
    alignItems: 'center',
    gap: SPACING.sm,
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,82,82,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alarmFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  featurePillText: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontFamily: 'SpaceGrotesk-Medium',
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
    gap: SPACING.md,
  },
  emptyTitle: {
    fontSize: 22,
    fontFamily: 'SpaceGrotesk-SemiBold',
    color: COLORS.textSecondary,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'SpaceGrotesk-Regular',
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingHorizontal: SPACING.xxl,
  },
});
