import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppStore } from '../../store/useAppStore';
import { COLORS, BORDER_RADIUS, SPACING } from '../../constants/theme';

export default function SettingsScreen() {
  const { userName, apiKey, setUserName, setApiKey, alarms, todos, subjects, threads } = useAppStore();
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(userName);
  const [editingKey, setEditingKey] = useState(false);
  const [tempKey, setTempKey] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);

  const handleSaveName = () => {
    setUserName(tempName.trim());
    setEditingName(false);
  };

  const handleSaveKey = () => {
    setApiKey(tempKey.trim());
    setEditingKey(false);
    Alert.alert('✅ Saved!', 'API key save ho gaya. Ab Suari use kar sakte ho!');
  };

  const stats = [
    { icon: 'alarm-outline', label: 'Alarms', value: alarms.length, color: COLORS.primary },
    { icon: 'checkmark-circle-outline', label: 'Tasks', value: todos.length, color: COLORS.success },
    { icon: 'book-outline', label: 'Subjects', value: subjects.length, color: COLORS.secondary },
    { icon: 'chatbubble-outline', label: 'Chats', value: threads.length, color: COLORS.accent },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>⚙️ Settings</Text>
      </View>

      {/* Profile Card */}
      <LinearGradient colors={['rgba(124,92,252,0.15)', 'rgba(124,92,252,0.05)']} style={styles.profileCard}>
        <LinearGradient colors={['#FF6B9D', '#7C5CFC']} style={styles.profileAvatar}>
          <Text style={styles.profileAvatarText}>
            {userName ? userName[0].toUpperCase() : 'S'}
          </Text>
        </LinearGradient>
        <View style={styles.profileInfo}>
          {editingName ? (
            <View style={styles.editRow}>
              <TextInput
                style={styles.nameInput}
                value={tempName}
                onChangeText={setTempName}
                autoFocus
                placeholder="Apna naam likho..."
                placeholderTextColor={COLORS.textMuted}
              />
              <TouchableOpacity onPress={handleSaveName} style={styles.saveBtn}>
                <Ionicons name="checkmark" size={20} color={COLORS.success} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={() => { setEditingName(true); setTempName(userName); }}>
              <Text style={styles.profileName}>
                {userName || 'Apna naam set karo'}
              </Text>
              <Text style={styles.profileEdit}>✏️ Tap to edit</Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* Stats */}
      <View style={styles.statsGrid}>
        {stats.map((s) => (
          <LinearGradient key={s.label} colors={[s.color + '15', s.color + '05']} style={styles.statCard}>
            <Ionicons name={s.icon as any} size={22} color={s.color} />
            <Text style={[styles.statNum, { color: s.color }]}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </LinearGradient>
        ))}
      </View>

      {/* Suari AI Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🤖 Suari AI Status</Text>
        <LinearGradient colors={['rgba(255,107,157,0.1)', 'rgba(124,92,252,0.08)']} style={styles.apiCard}>
          <View style={styles.apiHeader}>
            <MaterialCommunityIcons name="robot-outline" size={20} color={COLORS.accent} />
            <Text style={styles.apiTitle}>Suari AI</Text>
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>● Active</Text>
            </View>
          </View>
          <Text style={styles.apiDesc}>
            Suari AI powered by Experiential Labs. Chat, Agent aur Research modes available hain. 🌟
          </Text>
          <View style={styles.modelInfo}>
            <Text style={styles.modelInfoLabel}>Models:</Text>
            <View style={styles.modelBadge}>
              <Text style={styles.modelBadgeText}>gpt-5.6-luna</Text>
            </View>
            <View style={styles.modelBadge}>
              <Text style={styles.modelBadgeText}>qwen3.8-27b</Text>
            </View>
          </View>
        </LinearGradient>
      </View>


      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ℹ️ App Info</Text>
        <LinearGradient colors={['rgba(18,18,42,0.9)', 'rgba(13,13,34,0.8)']} style={styles.aboutCard}>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>App Name</Text>
            <Text style={styles.aboutValue}>Suari Ka Alarm</Text>
          </View>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Version</Text>
            <Text style={styles.aboutValue}>1.0.0</Text>
          </View>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>AI Agent</Text>
            <Text style={[styles.aboutValue, { color: COLORS.accent }]}>Suari 🌟</Text>
          </View>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Backend</Text>
            <Text style={styles.aboutValue}>Supabase + AsyncStorage</Text>
          </View>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>AI Provider</Text>
            <Text style={styles.aboutValue}>Experiential Labs</Text>
          </View>
        </LinearGradient>
      </View>

      {/* Features List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>✨ Features</Text>
        {[
          { icon: 'alarm-outline', text: 'Smart Alarm with Snooze & Repeat', color: COLORS.primary },
          { icon: 'robot-outline', text: 'Suari AI Agent (Chat/Agent/Research)', color: COLORS.accent },
          { icon: 'search-outline', text: 'Internet Search via AI', color: COLORS.secondary },
          { icon: 'checkmark-circle-outline', text: 'Priority-based Todo List', color: COLORS.success },
          { icon: 'book-outline', text: 'AI-powered Syllabus Tracker', color: COLORS.warning },
          { icon: 'chatbubble-outline', text: 'Conversation Thread History', color: COLORS.primary },
          { icon: 'person-outline', text: 'Suari Memory & Personalization', color: COLORS.accent },
        ].map((f, i) => (
          <View key={i} style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: f.color + '15' }]}>
              <Ionicons name={f.icon as any} size={18} color={f.color} />
            </View>
            <Text style={styles.featureText}>{f.text}</Text>
          </View>
        ))}
      </View>

      {/* Made with love */}
      <View style={styles.footer}>
        <LinearGradient colors={['#FF6B9D', '#7C5CFC']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.footerGrad}>
          <Text style={styles.footerText}>Made with ❤️ for Suari Ka Alarm</Text>
        </LinearGradient>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { paddingBottom: 100 },

  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: 60,
    paddingBottom: SPACING.md,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'SpaceGrotesk-Bold',
    color: COLORS.textPrimary,
  },

  // Profile
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    gap: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(124,92,252,0.25)',
    marginBottom: SPACING.lg,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarText: {
    color: '#fff',
    fontSize: 26,
    fontFamily: 'SpaceGrotesk-Bold',
  },
  profileInfo: { flex: 1 },
  profileName: {
    fontSize: 20,
    fontFamily: 'SpaceGrotesk-Bold',
    color: COLORS.textPrimary,
  },
  profileEdit: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontFamily: 'SpaceGrotesk-Regular',
    marginTop: 2,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  nameInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
    fontFamily: 'SpaceGrotesk-Medium',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary,
    paddingVertical: 4,
  },
  saveBtn: { padding: 8 },

  // Stats
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.sm,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  statNum: {
    fontSize: 20,
    fontFamily: 'SpaceGrotesk-Bold',
  },
  statLabel: {
    fontSize: 9,
    color: COLORS.textMuted,
    fontFamily: 'SpaceGrotesk-Medium',
  },

  // Section
  section: { marginBottom: SPACING.lg },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'SpaceGrotesk-SemiBold',
    color: COLORS.textSecondary,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },

  // API Card
  apiCard: {
    marginHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,107,157,0.2)',
    gap: SPACING.md,
  },
  apiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  apiTitle: {
    fontSize: 16,
    fontFamily: 'SpaceGrotesk-SemiBold',
    color: COLORS.textPrimary,
  },
  apiDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontFamily: 'SpaceGrotesk-Regular',
    lineHeight: 20,
  },
  keyDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  keyText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontFamily: 'SpaceGrotesk-Regular',
    flex: 1,
  },
  keyEditContainer: { gap: SPACING.sm },
  keyInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  keyInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textPrimary,
    fontFamily: 'SpaceGrotesk-Regular',
    paddingVertical: 4,
  },
  keyBtns: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  cancelKeyBtn: {
    flex: 1,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  cancelKeyText: {
    color: COLORS.textSecondary,
    fontFamily: 'SpaceGrotesk-Medium',
    fontSize: 13,
  },
  saveKeyBtn: {
    flex: 2,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  saveKeyGrad: {
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  saveKeyText: {
    color: '#fff',
    fontFamily: 'SpaceGrotesk-SemiBold',
    fontSize: 13,
  },
  modelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flexWrap: 'wrap',
  },
  modelInfoLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontFamily: 'SpaceGrotesk-Regular',
  },
  modelBadge: {
    backgroundColor: 'rgba(124,92,252,0.15)',
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(124,92,252,0.3)',
  },
  modelBadgeText: {
    fontSize: 11,
    color: COLORS.primary,
    fontFamily: 'SpaceGrotesk-Medium',
  },

  // About
  aboutCard: {
    marginHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  aboutLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontFamily: 'SpaceGrotesk-Regular',
  },
  aboutValue: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontFamily: 'SpaceGrotesk-Medium',
  },

  // Features
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontFamily: 'SpaceGrotesk-Regular',
    flex: 1,
  },

  // Footer
  footer: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
  },
  footerGrad: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  footerText: {
    color: '#fff',
    fontSize: 14,
  },

  // Active badge
  activeBadge: {
    backgroundColor: 'rgba(0,230,118,0.15)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,230,118,0.3)',
    marginLeft: 8,
  },
  activeBadgeText: {
    color: '#00E676',
    fontSize: 12,
    fontWeight: '600',
  },
});
