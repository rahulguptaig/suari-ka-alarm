import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore, SyllabusTopic } from '../../store/useAppStore';
import { generateStudyPlan } from '../../services/suariAI';
import { COLORS, BORDER_RADIUS, SPACING } from '../../constants/theme';

type TopicStatus = 'not_started' | 'in_progress' | 'completed';

const STATUS_CONFIG = {
  not_started: { label: 'Not Started', color: COLORS.error, icon: 'ellipse-outline' },
  in_progress: { label: 'In Progress', color: COLORS.warning, icon: 'time-outline' },
  completed: { label: 'Completed', color: COLORS.success, icon: 'checkmark-circle' },
};

function TopicRow({ topic, color, onStatusChange, onDelete }: {
  topic: SyllabusTopic;
  color: string;
  onStatusChange: (status: TopicStatus) => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const status = STATUS_CONFIG[topic.status];

  const cycleStatus = () => {
    const statuses: TopicStatus[] = ['not_started', 'in_progress', 'completed'];
    const current = statuses.indexOf(topic.status);
    const next = statuses[(current + 1) % 3];
    onStatusChange(next);
  };

  return (
    <View style={styles.topicRow}>
      <TouchableOpacity onPress={cycleStatus} style={[styles.statusCircle, { borderColor: status.color }]}>
        <Ionicons name={status.icon as any} size={20} color={status.color} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.topicContent} onPress={() => setExpanded(!expanded)}>
        <Text style={[styles.topicTitle, topic.status === 'completed' && styles.topicTitleDone]}>
          {topic.title}
        </Text>
        {topic.subtopics && topic.subtopics.length > 0 && (
          <Text style={styles.subtopicCount}>{topic.subtopics.length} subtopics</Text>
        )}
        {expanded && topic.subtopics && topic.subtopics.length > 0 && (
          <View style={styles.subtopicsList}>
            {topic.subtopics.map((sub, i) => (
              <Text key={i} style={styles.subtopicItem}>• {sub}</Text>
            ))}
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.topicActions}>
        <View style={[styles.statusPill, { backgroundColor: status.color + '20' }]}>
          <Text style={[styles.statusPillText, { color: status.color }]}>
            {status.label === 'Not Started' ? '—' : status.label === 'In Progress' ? 'In Progress' : 'Done'}
          </Text>
        </View>
        <TouchableOpacity onPress={onDelete} style={styles.deleteTopicBtn}>
          <Ionicons name="trash-outline" size={14} color={COLORS.error + '80'} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function SyllabusDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { subjects, updateTopicStatus, addTopic, deleteTopic, apiKey } = useAppStore();
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [addingTopic, setAddingTopic] = useState(false);
  const [loadingStudyPlan, setLoadingStudyPlan] = useState(false);

  const subject = subjects.find(s => s.id === id);

  if (!subject) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: COLORS.textMuted }}>Subject nahi mila!</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: COLORS.primary, marginTop: 16 }}>Wapas Jao</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const completed = subject.topics.filter(t => t.status === 'completed').length;
  const inProgress = subject.topics.filter(t => t.status === 'in_progress').length;
  const notStarted = subject.topics.filter(t => t.status === 'not_started').length;
  const progress = subject.topics.length > 0 ? completed / subject.topics.length : 0;

  const handleAddTopic = () => {
    if (!newTopicTitle.trim()) return;
    const newTopic: SyllabusTopic = {
      id: Date.now().toString(),
      title: newTopicTitle.trim(),
      status: 'not_started',
    };
    addTopic(subject.id, newTopic);
    setNewTopicTitle('');
    setAddingTopic(false);
  };

  const handleStudyPlan = async () => {
    if (!apiKey) {
      Alert.alert('API Key Chahiye', 'Settings mein API key daalo!');
      return;
    }
    setLoadingStudyPlan(true);
    try {
      const plan = await generateStudyPlan(
        apiKey,
        subject.name,
        4,
        subject.examDate || 'Jaldi'
      );
      Alert.alert(`${subject.name} Study Plan`, plan, [{ text: 'OK' }]);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoadingStudyPlan(false);
    }
  };

  const handleDeleteTopic = (topicId: string) => {
    Alert.alert('Topic Delete Karein?', 'Ye topic permanently delete ho jayega.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteTopic(subject.id, topicId) },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={[subject.color + '20', 'transparent']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{subject.name}</Text>
        <TouchableOpacity onPress={handleStudyPlan} style={styles.studyPlanBtn}>
          <Ionicons name="sparkles" size={20} color={subject.color} />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Progress Card */}
        <LinearGradient
          colors={[subject.color + '15', subject.color + '05']}
          style={[styles.progressCard, { borderColor: subject.color + '30' }]}
        >
          <View style={styles.progressTop}>
            <View>
              <Text style={[styles.progressPercent, { color: subject.color }]}>
                {Math.round(progress * 100)}%
              </Text>
              <Text style={styles.progressLabel}>Complete</Text>
            </View>
            <View style={styles.progressStats}>
              <View style={styles.progressStat}>
                <Text style={[styles.progressStatNum, { color: COLORS.success }]}>{completed}</Text>
                <Text style={styles.progressStatLabel}>Done</Text>
              </View>
              <View style={styles.progressStat}>
                <Text style={[styles.progressStatNum, { color: COLORS.warning }]}>{inProgress}</Text>
                <Text style={styles.progressStatLabel}>Doing</Text>
              </View>
              <View style={styles.progressStat}>
                <Text style={[styles.progressStatNum, { color: COLORS.error }]}>{notStarted}</Text>
                <Text style={styles.progressStatLabel}>Left</Text>
              </View>
            </View>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress * 100}%`, backgroundColor: subject.color }]} />
          </View>
          {subject.examDate && (
            <Text style={styles.examDate}>
              Exam: {new Date(subject.examDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
            </Text>
          )}
        </LinearGradient>

        {/* Topics */}
        <View style={styles.topicsSection}>
          <View style={styles.topicsHeader}>
            <Text style={styles.topicsTitle}>Topics ({subject.topics.length})</Text>
            <TouchableOpacity onPress={() => setAddingTopic(!addingTopic)} style={styles.addTopicFab}>
              <LinearGradient colors={[subject.color, subject.color + 'BB']} style={styles.addTopicGrad}>
                <Ionicons name="add" size={18} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <Text style={styles.tapHint}>
            Tap to change status: ○ -> In Progress -> Done
          </Text>

          {addingTopic && (
            <View style={styles.addTopicInput}>
              <TextInput
                style={styles.addTopicTextField}
                value={newTopicTitle}
                onChangeText={setNewTopicTitle}
                placeholder="Naya topic..."
                placeholderTextColor={COLORS.textMuted}
                autoFocus
                onSubmitEditing={handleAddTopic}
              />
              <TouchableOpacity onPress={handleAddTopic} style={styles.addTopicConfirm}>
                <Ionicons name="checkmark" size={20} color={COLORS.success} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setAddingTopic(false)}>
                <Ionicons name="close" size={20} color={COLORS.error} />
              </TouchableOpacity>
            </View>
          )}

          {subject.topics.length === 0 ? (
            <View style={styles.noTopicsContainer}>
              <Text style={styles.noTopicsText}>Koi topic nahi hai abhi</Text>
              <TouchableOpacity onPress={() => setAddingTopic(true)} style={styles.addFirstTopicBtn}>
                <Text style={[styles.addFirstTopicText, { color: subject.color }]}>+ Pehla topic add karo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            subject.topics.map((topic) => (
              <TopicRow
                key={topic.id}
                topic={topic}
                color={subject.color}
                onStatusChange={(status) => updateTopicStatus(subject.id, topic.id, status)}
                onDelete={() => handleDeleteTopic(topic.id)}
              />
            ))
          )}
        </View>

        {/* Study Plan Button */}
        <TouchableOpacity
          onPress={handleStudyPlan}
          disabled={loadingStudyPlan}
          style={styles.studyPlanFab}
        >
          <LinearGradient colors={['#FF6B9D', '#7C5CFC']} style={styles.studyPlanGrad}>
            <Ionicons name="sparkles" size={18} color="#fff" />
            <Text style={styles.studyPlanText}>
              {loadingStudyPlan ? 'Plan ban raha hai...' : 'Suari se Study Plan Lo'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
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
    paddingBottom: SPACING.lg,
  },
  backBtn: {
    width: 40, height: 40, alignItems: 'center', justifyContent: 'center',
    borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)',
  },
  headerTitle: { fontSize: 20, fontFamily: 'SpaceGrotesk-Bold', color: COLORS.textPrimary, flex: 1, textAlign: 'center' },
  studyPlanBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },

  content: { padding: SPACING.lg, gap: SPACING.lg, paddingBottom: 100 },

  progressCard: {
    borderRadius: BORDER_RADIUS.xl, padding: SPACING.lg,
    borderWidth: 1, gap: SPACING.md,
  },
  progressTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressPercent: { fontSize: 52, fontFamily: 'SpaceGrotesk-Bold', lineHeight: 58 },
  progressLabel: { fontSize: 14, color: COLORS.textMuted, fontFamily: 'SpaceGrotesk-Regular' },
  progressStats: { flexDirection: 'row', gap: SPACING.lg },
  progressStat: { alignItems: 'center' },
  progressStatNum: { fontSize: 22, fontFamily: 'SpaceGrotesk-Bold' },
  progressStatLabel: { fontSize: 11, color: COLORS.textMuted, fontFamily: 'SpaceGrotesk-Regular' },
  progressBarBg: {
    height: 6, backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3, overflow: 'hidden',
  },
  progressBarFill: { height: '100%', borderRadius: 3 },
  examDate: { fontSize: 13, color: COLORS.textSecondary, fontFamily: 'SpaceGrotesk-Medium' },

  topicsSection: { gap: SPACING.sm },
  topicsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  topicsTitle: { fontSize: 18, fontFamily: 'SpaceGrotesk-SemiBold', color: COLORS.textPrimary },
  addTopicFab: { borderRadius: 20, overflow: 'hidden' },
  addTopicGrad: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  tapHint: { fontSize: 12, color: COLORS.textMuted, fontFamily: 'SpaceGrotesk-Regular' },

  addTopicInput: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    backgroundColor: COLORS.bgCard, borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderWidth: 1, borderColor: 'rgba(124,92,252,0.3)',
  },
  addTopicTextField: {
    flex: 1, fontSize: 14, color: COLORS.textPrimary, fontFamily: 'SpaceGrotesk-Regular', paddingVertical: 4,
  },
  addTopicConfirm: { padding: 4 },

  noTopicsContainer: { alignItems: 'center', paddingVertical: SPACING.xl, gap: SPACING.sm },
  noTopicsText: { fontSize: 15, color: COLORS.textMuted, fontFamily: 'SpaceGrotesk-Regular' },
  addFirstTopicBtn: { padding: SPACING.sm },
  addFirstTopicText: { fontSize: 14, fontFamily: 'SpaceGrotesk-SemiBold' },

  topicRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm,
    backgroundColor: COLORS.bgCard, borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  statusCircle: {
    width: 32, height: 32, borderRadius: 16, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center', marginTop: 2,
  },
  topicContent: { flex: 1, gap: 4 },
  topicTitle: { fontSize: 14, fontFamily: 'SpaceGrotesk-Medium', color: COLORS.textPrimary },
  topicTitleDone: { textDecorationLine: 'line-through', color: COLORS.textMuted },
  subtopicCount: { fontSize: 11, color: COLORS.textMuted, fontFamily: 'SpaceGrotesk-Regular' },
  subtopicsList: { marginTop: 4, gap: 2 },
  subtopicItem: { fontSize: 12, color: COLORS.textSecondary, fontFamily: 'SpaceGrotesk-Regular' },
  topicActions: { alignItems: 'flex-end', gap: SPACING.xs },
  statusPill: { borderRadius: BORDER_RADIUS.full, paddingHorizontal: 8, paddingVertical: 2 },
  statusPillText: { fontSize: 12, fontFamily: 'SpaceGrotesk-Medium' },
  deleteTopicBtn: { padding: 2 },

  studyPlanFab: { borderRadius: BORDER_RADIUS.lg, overflow: 'hidden' },
  studyPlanGrad: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: SPACING.sm, paddingVertical: SPACING.md,
  },
  studyPlanText: { color: '#fff', fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 15 },
});
