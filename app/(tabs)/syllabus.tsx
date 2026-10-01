import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppStore, SyllabusSubject, SyllabusTopic } from '../../store/useAppStore';
import { COLORS, BORDER_RADIUS, SPACING } from '../../constants/theme';

const SUBJECT_COLORS = [
  '#7C5CFC', '#FF6B9D', '#00D4FF', '#FF9800', '#00E676',
  '#FF5252', '#E040FB', '#40C4FF', '#FFEB3B', '#69F0AE',
];

// ==================== PROGRESS RING ====================
function ProgressRing({ progress, color, size = 60 }: {
  progress: number;
  color: string;
  size?: number;
}) {
  const percentage = Math.round(progress * 100);
  
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={[styles.progressRingBg, { width: size, height: size, borderRadius: size / 2, borderColor: color + '30' }]} />
      <View style={[styles.progressRingFill, {
        width: size,
        height: size,
        borderRadius: size / 2,
        borderColor: color,
        borderTopColor: progress > 0.25 ? color : 'transparent',
        borderRightColor: progress > 0.5 ? color : 'transparent',
        borderBottomColor: progress > 0.75 ? color : 'transparent',
        borderLeftColor: progress > 0 ? color : 'transparent',
        transform: [{ rotate: '-90deg' }],
      }]} />
      <View style={styles.progressRingCenter}>
        <Text style={[styles.progressRingText, { color }]}>{percentage}%</Text>
      </View>
    </View>
  );
}

// ==================== SUBJECT CARD ====================
function SubjectCard({ subject, onPress, onDelete }: {
  subject: SyllabusSubject;
  onPress: () => void;
  onDelete: () => void;
}) {
  const completedTopics = subject.topics.filter(t => t.status === 'completed').length;
  const inProgressTopics = subject.topics.filter(t => t.status === 'in_progress').length;
  const progress = subject.topics.length > 0 ? completedTopics / subject.topics.length : 0;

  const getDaysLeft = () => {
    if (!subject.examDate) return null;
    const days = Math.ceil((new Date(subject.examDate).getTime() - Date.now()) / (1000 * 86400));
    return days;
  };
  const daysLeft = getDaysLeft();

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <LinearGradient
        colors={[subject.color + '18', subject.color + '08']}
        style={styles.subjectCard}
      >
        <View style={[styles.subjectCardBorder, { borderColor: subject.color + '40' }]} />

        <View style={styles.subjectCardHeader}>
          <View style={[styles.subjectIcon, { backgroundColor: subject.color + '22' }]}>
            <Ionicons name="book-outline" size={20} color={subject.color} />
          </View>
          <TouchableOpacity onPress={onDelete} style={styles.subjectDelete}>
            <Ionicons name="ellipsis-vertical" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        <Text style={styles.subjectName}>{subject.name}</Text>

        <View style={styles.subjectStats}>
          <View style={styles.subjectStatItem}>
            <Text style={[styles.subjectStatNum, { color: COLORS.success }]}>{completedTopics}</Text>
            <Text style={styles.subjectStatLabel}>Done</Text>
          </View>
          <View style={styles.subjectStatItem}>
            <Text style={[styles.subjectStatNum, { color: COLORS.warning }]}>{inProgressTopics}</Text>
            <Text style={styles.subjectStatLabel}>Progress</Text>
          </View>
          <View style={styles.subjectStatItem}>
            <Text style={[styles.subjectStatNum, { color: COLORS.textSecondary }]}>
              {subject.topics.length - completedTopics - inProgressTopics}
            </Text>
            <Text style={styles.subjectStatLabel}>Left</Text>
          </View>
        </View>

        {/* Progress bar */}
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, {
            width: `${progress * 100}%`,
            backgroundColor: subject.color,
          }]} />
        </View>

        <View style={styles.subjectFooter}>
          <Text style={[styles.progressText, { color: subject.color }]}>
            {Math.round(progress * 100)}% complete
          </Text>
          {daysLeft !== null && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="calendar-outline" size={10} color={daysLeft < 7 ? COLORS.error : COLORS.textMuted} />
              <Text style={[styles.examDays, { color: daysLeft < 7 ? COLORS.error : COLORS.textMuted }]}>
                {daysLeft > 0 ? `${daysLeft} days left` : 'Exam Today!'}
              </Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

// ==================== OVERALL PROGRESS ====================
function OverallStats({ subjects }: { subjects: SyllabusSubject[] }) {
  const totalTopics = subjects.reduce((acc, s) => acc + s.topics.length, 0);
  const completedTopics = subjects.reduce((acc, s) => acc + s.topics.filter(t => t.status === 'completed').length, 0);
  const overallProgress = totalTopics > 0 ? completedTopics / totalTopics : 0;

  return (
    <LinearGradient
      colors={['rgba(124,92,252,0.12)', 'rgba(0,212,255,0.06)']}
      style={styles.overallCard}
    >
      <Text style={styles.overallTitle}>Overall Progress</Text>
      <View style={styles.overallContent}>
        <View style={styles.overallLeft}>
          <Text style={styles.overallPercent}>{Math.round(overallProgress * 100)}%</Text>
          <Text style={styles.overallSubtitle}>Complete</Text>
          <Text style={styles.overallDetail}>
            {completedTopics}/{totalTopics} topics done
          </Text>
        </View>
        <View style={styles.overallBars}>
          {subjects.slice(0, 5).map((s) => {
            const prog = s.topics.length > 0
              ? s.topics.filter(t => t.status === 'completed').length / s.topics.length
              : 0;
            return (
              <View key={s.id} style={styles.miniBar}>
                <View style={[styles.miniBarFill, { width: `${prog * 100}%`, backgroundColor: s.color }]} />
                <Text style={styles.miniBarLabel} numberOfLines={1}>{s.name.slice(0, 8)}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </LinearGradient>
  );
}

// ==================== MAIN SCREEN ====================
export default function SyllabusScreen() {
  const { subjects, deleteSubject } = useAppStore();

  const handleDelete = (subject: SyllabusSubject) => {
    Alert.alert(
      'Delete Subject?',
      `"${subject.name}" and all its topics will be deleted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteSubject(subject.id) },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Syllabus Tracker</Text>
          <Text style={styles.headerSubtitle}>
            {subjects.length} subjects • Track your progress
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/syllabus/add')}
          style={styles.addFab}
        >
          <LinearGradient colors={['#7C5CFC', '#5B3FD9']} style={styles.addFabGrad}>
            <Ionicons name="add" size={26} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <FlatList
        data={subjects}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          subjects.length > 0 ? (
            <View style={styles.listHeader}>
              <OverallStats subjects={subjects} />
              <Text style={styles.sectionTitle}>Subjects</Text>
            </View>
          ) : null
        }
        numColumns={2}
        columnWrapperStyle={styles.subjectsGrid}
        renderItem={({ item }) => (
          <View style={styles.subjectCardWrapper}>
            <SubjectCard
              subject={item}
              onPress={() => router.push(`/syllabus/${item.id}`)}
              onDelete={() => handleDelete(item)}
            />
          </View>
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="book-open-page-variant-outline" size={80} color="rgba(124,92,252,0.3)" />
            <Text style={styles.emptyTitle}>No Subjects Found!</Text>
            <Text style={styles.emptySubtitle}>
              Press + to add your first subject. You can also fetch the syllabus using Suari AI!
            </Text>
            <TouchableOpacity
              style={styles.emptyAddBtn}
              onPress={() => router.push('/syllabus/add')}
            >
              <LinearGradient colors={['#7C5CFC', '#5B3FD9']} style={styles.emptyAddBtnGrad}>
                <Text style={styles.emptyAddBtnText}>Add Subject</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

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
  addFab: { borderRadius: BORDER_RADIUS.full, overflow: 'hidden' },
  addFabGrad: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7C5CFC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },

  // Overall stats
  overallCard: {
    marginHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(124,92,252,0.2)',
  },
  overallTitle: {
    fontSize: 16,
    fontFamily: 'SpaceGrotesk-SemiBold',
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  overallContent: {
    flexDirection: 'row',
    gap: SPACING.lg,
  },
  overallLeft: { alignItems: 'center' },
  overallPercent: {
    fontSize: 42,
    fontFamily: 'SpaceGrotesk-Bold',
    color: COLORS.primary,
  },
  overallSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontFamily: 'SpaceGrotesk-Regular',
  },
  overallDetail: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontFamily: 'SpaceGrotesk-Regular',
    marginTop: 4,
  },
  overallBars: {
    flex: 1,
    gap: 8,
    justifyContent: 'center',
  },
  miniBar: {
    gap: 3,
  },
  miniBarFill: {
    height: 4,
    borderRadius: 2,
    minWidth: 4,
  },
  miniBarLabel: {
    fontSize: 9,
    color: COLORS.textMuted,
    fontFamily: 'SpaceGrotesk-Regular',
  },

  // Subject cards
  listHeader: { marginBottom: SPACING.sm },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'SpaceGrotesk-SemiBold',
    color: COLORS.textPrimary,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  listContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 100,
  },
  subjectsGrid: {
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.sm,
    gap: SPACING.sm,
  },
  subjectCardWrapper: {
    flex: 1,
    maxWidth: '48%',
  },
  subjectCard: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  subjectCardBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
  },
  subjectCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  subjectIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subjectDelete: { padding: 4 },
  subjectName: {
    fontSize: 16,
    fontFamily: 'SpaceGrotesk-Bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  subjectStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  subjectStatItem: { alignItems: 'center' },
  subjectStatNum: {
    fontSize: 16,
    fontFamily: 'SpaceGrotesk-Bold',
  },
  subjectStatLabel: {
    fontSize: 9,
    color: COLORS.textMuted,
    fontFamily: 'SpaceGrotesk-Regular',
  },
  progressBarBg: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    marginBottom: SPACING.sm,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  subjectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 11,
    fontFamily: 'SpaceGrotesk-SemiBold',
  },
  examDays: {
    fontSize: 10,
    fontFamily: 'SpaceGrotesk-Regular',
  },

  // Progress ring
  progressRingBg: {
    position: 'absolute',
    borderWidth: 4,
  },
  progressRingFill: {
    position: 'absolute',
    borderWidth: 4,
    borderStyle: 'solid',
  },
  progressRingCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRingText: {
    fontSize: 12,
    fontFamily: 'SpaceGrotesk-Bold',
  },

  // Empty
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: SPACING.xl,
    gap: SPACING.md,
  },
  emptyTitle: {
    fontSize: 22,
    fontFamily: 'SpaceGrotesk-SemiBold',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    fontFamily: 'SpaceGrotesk-Regular',
    lineHeight: 22,
  },
  emptyAddBtn: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    marginTop: SPACING.md,
  },
  emptyAddBtnGrad: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  emptyAddBtnText: {
    color: '#fff',
    fontFamily: 'SpaceGrotesk-SemiBold',
    fontSize: 15,
  },
});
