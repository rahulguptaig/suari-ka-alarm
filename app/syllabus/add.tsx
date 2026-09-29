import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppStore, SyllabusSubject, SyllabusTopic } from '../../store/useAppStore';
import { fetchSyllabus } from '../../services/suariAI';
import { COLORS, BORDER_RADIUS, SPACING } from '../../constants/theme';

const SUBJECT_COLORS = [
  '#7C5CFC', '#FF6B9D', '#00D4FF', '#FF9800', '#00E676',
  '#FF5252', '#E040FB', '#40C4FF', '#FFEB3B', '#69F0AE',
];

export default function AddSyllabusScreen() {
  const { addSubject, apiKey } = useAppStore();

  const [subjectName, setSubjectName] = useState('');
  const [examName, setExamName] = useState('');
  const [examDate, setExamDate] = useState('');
  const [selectedColor, setSelectedColor] = useState(SUBJECT_COLORS[0]);
  const [topics, setTopics] = useState<{ title: string; subtopics: string[] }[]>([]);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [isAIFetching, setIsAIFetching] = useState(false);
  const [showManualAdd, setShowManualAdd] = useState(false);

  const handleFetchWithAI = useCallback(async () => {
    if (!subjectName.trim()) {
      Alert.alert('Subject Name', 'Pehle subject ka naam dalo!');
      return;
    }

    if (!apiKey) {
      Alert.alert('API Key', 'Settings mein Experiential Labs API key daalo pehle!');
      return;
    }

    setIsAIFetching(true);
    try {
      const result = await fetchSyllabus(apiKey, subjectName, examName || undefined);
      if (result.topics.length > 0) {
        const fetchedTopics = result.topics.map((t) => ({
          title: t,
          subtopics: result.subtopics[t] || [],
        }));
        setTopics(fetchedTopics);
        Alert.alert('✅ Syllabus Ready!', `${result.topics.length} topics fetch ho gaye Suari AI se!`);
      } else {
        Alert.alert('⚠️ Koi Topics Nahi', 'AI koi topic nahi de saka. Manually add karo.');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setIsAIFetching(false);
    }
  }, [subjectName, examName, apiKey]);

  const handleAddManualTopic = () => {
    if (!newTopicTitle.trim()) return;
    setTopics([...topics, { title: newTopicTitle.trim(), subtopics: [] }]);
    setNewTopicTitle('');
  };

  const handleRemoveTopic = (index: number) => {
    setTopics(topics.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!subjectName.trim()) {
      Alert.alert('Naam Chahiye', 'Subject ka naam dalo!');
      return;
    }

    const syllabusTopics: SyllabusTopic[] = topics.map((t) => ({
      id: Date.now().toString() + Math.random(),
      title: t.title,
      status: 'not_started',
      subtopics: t.subtopics,
    }));

    const newSubject: SyllabusSubject = {
      id: Date.now().toString(),
      name: subjectName.trim(),
      color: selectedColor,
      totalTopics: syllabusTopics.length,
      topics: syllabusTopics,
      examDate: examDate || undefined,
    };

    addSubject(newSubject);
    Alert.alert('✅ Subject Added!', `${subjectName} with ${syllabusTopics.length} topics add ho gaya!`);
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="close" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Subject Add Karo</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
          <LinearGradient colors={['#7C5CFC', '#5B3FD9']} style={styles.saveBtnGrad}>
            <Text style={styles.saveBtnText}>Save</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Subject Name */}
        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>Subject Name *</Text>
          <TextInput
            style={styles.textInput}
            value={subjectName}
            onChangeText={setSubjectName}
            placeholder="e.g. Mathematics, Physics, History..."
            placeholderTextColor={COLORS.textMuted}
            autoFocus
          />
        </View>

        {/* Exam Details */}
        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>Exam Details (Optional)</Text>
          <TextInput
            style={styles.textInput}
            value={examName}
            onChangeText={setExamName}
            placeholder="Exam name e.g. JEE, NEET, Board..."
            placeholderTextColor={COLORS.textMuted}
          />
          <TextInput
            style={[styles.textInput, { marginTop: SPACING.sm }]}
            value={examDate}
            onChangeText={setExamDate}
            placeholder="Exam date YYYY-MM-DD..."
            placeholderTextColor={COLORS.textMuted}
          />
        </View>

        {/* Color Picker */}
        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>Subject Color</Text>
          <View style={styles.colorRow}>
            {SUBJECT_COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                onPress={() => setSelectedColor(color)}
                style={[
                  styles.colorSwatch,
                  { backgroundColor: color },
                  selectedColor === color && styles.colorSwatchSelected,
                ]}
              >
                {selectedColor === color && (
                  <Ionicons name="checkmark" size={16} color="#fff" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* AI Syllabus Fetch */}
        <LinearGradient
          colors={['rgba(255,107,157,0.1)', 'rgba(124,92,252,0.08)']}
          style={styles.aiCard}
        >
          <View style={styles.aiCardHeader}>
            <MaterialCommunityIcons name="robot-outline" size={24} color={COLORS.accent} />
            <View style={styles.aiCardText}>
              <Text style={styles.aiCardTitle}>Suari AI se Syllabus Fetch Karo</Text>
              <Text style={styles.aiCardSubtitle}>
                AI automatically aapke subject ka syllabus internet se dhundh ke de degi
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleFetchWithAI}
            disabled={isAIFetching || !subjectName.trim()}
            style={[styles.fetchBtn, (!subjectName.trim() || isAIFetching) && { opacity: 0.5 }]}
          >
            <LinearGradient colors={['#FF6B9D', '#7C5CFC']} style={styles.fetchBtnGrad}>
              {isAIFetching ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="sparkles" size={18} color="#fff" />
              )}
              <Text style={styles.fetchBtnText}>
                {isAIFetching ? 'Suari dhundh rahi hai...' : 'AI se Syllabus Lo'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>

        {/* Topics */}
        <View style={styles.inputCard}>
          <View style={styles.topicsHeader}>
            <Text style={styles.inputLabel}>Topics ({topics.length})</Text>
            <TouchableOpacity onPress={() => setShowManualAdd(true)} style={styles.addTopicBtn}>
              <Ionicons name="add-circle-outline" size={20} color={COLORS.primary} />
              <Text style={styles.addTopicText}>Manual Add</Text>
            </TouchableOpacity>
          </View>

          {topics.length === 0 ? (
            <Text style={styles.noTopics}>
              AI se fetch karo ya manually topics add karo
            </Text>
          ) : (
            <View style={styles.topicsList}>
              {topics.map((topic, index) => (
                <View key={index} style={styles.topicItem}>
                  <View style={[styles.topicBullet, { backgroundColor: selectedColor }]} />
                  <Text style={styles.topicTitle} numberOfLines={2}>{topic.title}</Text>
                  {topic.subtopics.length > 0 && (
                    <Text style={styles.topicSubCount}>{topic.subtopics.length} sub</Text>
                  )}
                  <TouchableOpacity onPress={() => handleRemoveTopic(index)}>
                    <Ionicons name="close" size={16} color={COLORS.textMuted} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Save Button */}
        <TouchableOpacity onPress={handleSave} style={styles.saveFab}>
          <LinearGradient colors={['#7C5CFC', '#5B3FD9']} style={styles.saveFabGrad}>
            <Ionicons name="checkmark" size={20} color="#fff" />
            <Text style={styles.saveFabText}>Subject Save Karo</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      {/* Manual Add Modal */}
      <Modal visible={showManualAdd} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setShowManualAdd(false)}>
          <Pressable style={styles.modal} onPress={e => e.stopPropagation()}>
            <LinearGradient colors={['#12122A', '#0D0D22']} style={styles.modalGrad}>
              <Text style={styles.modalTitle}>Topic Add Karo</Text>
              <TextInput
                style={styles.textInput}
                value={newTopicTitle}
                onChangeText={setNewTopicTitle}
                placeholder="Topic title..."
                placeholderTextColor={COLORS.textMuted}
                autoFocus
                onSubmitEditing={handleAddManualTopic}
              />
              <View style={styles.modalBtns}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowManualAdd(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.addBtn}
                  onPress={() => { handleAddManualTopic(); setShowManualAdd(false); }}
                >
                  <LinearGradient colors={['#7C5CFC', '#5B3FD9']} style={styles.addBtnGrad}>
                    <Text style={styles.addBtnText}>Add</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </Pressable>
        </Pressable>
      </Modal>
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
    width: 40, height: 40,
    alignItems: 'center', justifyContent: 'center',
    borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)',
  },
  headerTitle: { fontSize: 18, fontFamily: 'SpaceGrotesk-Bold', color: COLORS.textPrimary },
  saveBtn: { borderRadius: BORDER_RADIUS.full, overflow: 'hidden' },
  saveBtnGrad: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm },
  saveBtnText: { color: '#fff', fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 14 },

  content: { padding: SPACING.lg, gap: SPACING.md, paddingBottom: 100 },

  inputCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    gap: SPACING.sm,
  },
  inputLabel: {
    fontSize: 12, fontFamily: 'SpaceGrotesk-Medium', color: COLORS.textMuted,
    textTransform: 'uppercase', letterSpacing: 1,
  },
  textInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(124,92,252,0.2)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: 14,
    color: COLORS.textPrimary,
    fontFamily: 'SpaceGrotesk-Regular',
  },

  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  colorSwatch: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  colorSwatchSelected: {
    borderWidth: 3, borderColor: '#fff',
    shadowColor: '#fff', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5, shadowRadius: 8, elevation: 4,
  },

  aiCard: {
    borderRadius: BORDER_RADIUS.xl, padding: SPACING.lg,
    borderWidth: 1, borderColor: 'rgba(255,107,157,0.2)', gap: SPACING.md,
  },
  aiCardHeader: { flexDirection: 'row', gap: SPACING.md, alignItems: 'flex-start' },
  aiCardText: { flex: 1 },
  aiCardTitle: { fontSize: 15, fontFamily: 'SpaceGrotesk-SemiBold', color: COLORS.textPrimary },
  aiCardSubtitle: {
    fontSize: 12, color: COLORS.textSecondary, fontFamily: 'SpaceGrotesk-Regular',
    lineHeight: 18, marginTop: 4,
  },
  fetchBtn: { borderRadius: BORDER_RADIUS.lg, overflow: 'hidden' },
  fetchBtnGrad: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: SPACING.sm, paddingVertical: SPACING.md,
  },
  fetchBtnText: { color: '#fff', fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 15 },

  topicsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  addTopicBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addTopicText: { fontSize: 13, color: COLORS.primary, fontFamily: 'SpaceGrotesk-Medium' },
  noTopics: { fontSize: 13, color: COLORS.textMuted, fontFamily: 'SpaceGrotesk-Regular', textAlign: 'center', paddingVertical: SPACING.md },
  topicsList: { gap: SPACING.sm },
  topicItem: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: BORDER_RADIUS.md, padding: SPACING.sm,
  },
  topicBullet: { width: 8, height: 8, borderRadius: 4 },
  topicTitle: { flex: 1, fontSize: 13, color: COLORS.textPrimary, fontFamily: 'SpaceGrotesk-Regular' },
  topicSubCount: { fontSize: 11, color: COLORS.textMuted, fontFamily: 'SpaceGrotesk-Regular' },

  saveFab: { borderRadius: BORDER_RADIUS.lg, overflow: 'hidden', marginTop: SPACING.sm },
  saveFabGrad: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: SPACING.sm, paddingVertical: SPACING.md,
  },
  saveFabText: { color: '#fff', fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 16 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modal: { borderTopLeftRadius: BORDER_RADIUS.xl, borderTopRightRadius: BORDER_RADIUS.xl, overflow: 'hidden' },
  modalGrad: { padding: SPACING.lg, paddingBottom: 40, gap: SPACING.md },
  modalTitle: { fontSize: 18, fontFamily: 'SpaceGrotesk-Bold', color: COLORS.textPrimary },
  modalBtns: { flexDirection: 'row', gap: SPACING.sm },
  cancelBtn: {
    flex: 1, borderRadius: BORDER_RADIUS.md, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)', paddingVertical: SPACING.md, alignItems: 'center',
  },
  cancelBtnText: { color: COLORS.textSecondary, fontFamily: 'SpaceGrotesk-Medium', fontSize: 14 },
  addBtn: { flex: 2, borderRadius: BORDER_RADIUS.md, overflow: 'hidden' },
  addBtnGrad: { paddingVertical: SPACING.md, alignItems: 'center' },
  addBtnText: { color: '#fff', fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 14 },
});
