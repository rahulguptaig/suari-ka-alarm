// ============================================================
// EXPO SNACK VERSION - Browser Testing ke liye
// 
// Copy this code to: https://snack.expo.dev
// Phone pe Expo Go se scan karo aur test karo!
// ============================================================

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  Switch, Alert, ScrollView, StatusBar, TextInput
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// ===== SIMPLE COLOR THEME =====
const C = {
  bg: '#080818',
  card: '#12122A',
  primary: '#7C5CFC',
  accent: '#FF6B9D',
  cyan: '#00D4FF',
  text: '#FFFFFF',
  textSub: '#A0A0C8',
  textMuted: '#606080',
  success: '#00E676',
  warning: '#FFD740',
  error: '#FF5252',
};

// ===== LIVE CLOCK =====
function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const h = String(time.getHours() % 12 || 12).padStart(2, '0');
  const m = String(time.getMinutes()).padStart(2, '0');
  const s = String(time.getSeconds()).padStart(2, '0');
  const p = time.getHours() >= 12 ? 'PM' : 'AM';
  const date = time.toLocaleDateString('hi-IN', { weekday: 'long', day: 'numeric', month: 'long' });
  return (
    <View style={s2.clockBox}>
      <LinearGradient colors={['rgba(124,92,252,0.15)', 'rgba(0,212,255,0.05)']} style={s2.clockGrad}>
        <Text style={s2.clockDate}>{date}</Text>
        <View style={s2.clockRow}>
          <Text style={s2.clockTime}>{h}:{m}</Text>
          <View style={s2.clockRight}>
            <Text style={s2.clockPeriod}>{p}</Text>
            <Text style={s2.clockSec}>{s}</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

// ===== SUARI AI DEMO =====
function SuariChat() {
  const [messages, setMessages] = useState([
    { id: '1', role: 'assistant', text: '🌟 Namaste! Main Suari hoon! Aapki AI saheli. Kya help chahiye?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const demoResponses = [
    'Bahut achha question! Study ke liye pomodoro technique try karo - 25 min padhao, 5 min rest. 📚',
    'Kal 6 baje ke liye alarm set karna chahoge? Main set kar deti hoon! ⏰',
    'Aaj kal kya padh rahe ho? Suari help karti hai syllabus track karne mein! 📖',
    'Kal exam hai? Koi baat nahi! Deep breath lo aur ek topic ek baar mein karo. 💪',
    'To-do list mein naya task add kar diya! Tasks dekhne ke liye Tasks tab kholo ✅',
    'Math mein koi topic mushkil lag raha hai? Batao, explain karti hoon! 🧮',
    'Aap bahut accha kar rahe ho! Keep going! 🌟✨',
  ];

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { id: Date.now().toString(), role: 'user', text: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const resp = demoResponses[Math.floor(Math.random() * demoResponses.length)];
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', text: resp }]);
      setLoading(false);
    }, 1200);
  };

  return (
    <View style={s2.chatContainer}>
      <ScrollView style={s2.messages} contentContainerStyle={{ gap: 8, paddingVertical: 12 }}>
        {messages.map(msg => (
          <View key={msg.id} style={[s2.bubble, msg.role === 'user' ? s2.userBubble : s2.aiBubble]}>
            {msg.role === 'assistant' && (
              <LinearGradient colors={['#FF6B9D', '#7C5CFC']} style={s2.avatar}>
                <Text style={s2.avatarText}>S</Text>
              </LinearGradient>
            )}
            <View style={[s2.bubbleMsg, msg.role === 'user' ? s2.userMsg : s2.aiMsg]}>
              <Text style={[s2.msgText, { color: msg.role === 'user' ? '#fff' : C.text }]}>
                {msg.text}
              </Text>
            </View>
          </View>
        ))}
        {loading && (
          <View style={s2.aiBubble}>
            <LinearGradient colors={['#FF6B9D', '#7C5CFC']} style={s2.avatar}>
              <Text style={s2.avatarText}>S</Text>
            </LinearGradient>
            <View style={s2.aiMsg}><Text style={{ color: C.textMuted }}>Suari soch rahi hai... 🤔</Text></View>
          </View>
        )}
      </ScrollView>
      <View style={s2.inputRow}>
        <TextInput
          style={s2.chatInput}
          value={input}
          onChangeText={setInput}
          placeholder="Suari se kuch poochho..."
          placeholderTextColor={C.textMuted}
          onSubmitEditing={send}
        />
        <TouchableOpacity onPress={send} style={s2.sendBtn}>
          <LinearGradient colors={['#FF6B9D', '#7C5CFC']} style={s2.sendGrad}>
            <Text style={{ color: '#fff', fontSize: 18 }}>➤</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ===== MAIN APP =====
export default function App() {
  const [tab, setTab] = useState('alarm');
  const [alarms, setAlarms] = useState([
    { id: '1', time: '06:30', label: 'Subah uthna', enabled: true, days: 'Mon-Fri' },
    { id: '2', time: '22:00', label: 'Study session', enabled: true, days: 'Daily' },
  ]);
  const [todos, setTodos] = useState([
    { id: '1', title: 'Math Chapter 5 complete karo', done: false, priority: 'high' },
    { id: '2', title: 'Physics notes revise karo', done: true, priority: 'medium' },
    { id: '3', title: 'Chemistry formulas yaad karo', done: false, priority: 'high' },
  ]);

  const tabs = [
    { id: 'alarm', icon: '⏰', label: 'Alarm' },
    { id: 'suari', icon: '🤖', label: 'Suari' },
    { id: 'todo', icon: '✅', label: 'Tasks' },
    { id: 'info', icon: '📱', label: 'About' },
  ];

  const renderContent = () => {
    switch (tab) {
      case 'alarm':
        return (
          <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 80 }}>
            <LiveClock />
            <Text style={s2.sectionTitle}>Your Alarms</Text>
            {alarms.map(a => (
              <LinearGradient key={a.id} colors={a.enabled ? ['rgba(124,92,252,0.15)', 'rgba(124,92,252,0.05)'] : [C.card, C.card]} style={s2.alarmCard}>
                {a.enabled && <View style={s2.alarmActiveBar} />}
                <View style={s2.alarmRow}>
                  <View>
                    <Text style={[s2.alarmTime, !a.enabled && { color: C.textMuted }]}>{a.time}</Text>
                    <Text style={s2.alarmLabel}>{a.label}</Text>
                    <Text style={s2.alarmDays}>{a.days}</Text>
                  </View>
                  <Switch
                    value={a.enabled}
                    onValueChange={(v) => setAlarms(alarms.map(al => al.id === a.id ? { ...al, enabled: v } : al))}
                    trackColor={{ false: 'rgba(96,96,128,0.3)', true: 'rgba(124,92,252,0.6)' }}
                    thumbColor={a.enabled ? C.primary : C.textMuted}
                  />
                </View>
              </LinearGradient>
            ))}
            <TouchableOpacity
              style={s2.addAlarmBtn}
              onPress={() => Alert.alert('New Alarm', 'Full app mein alarm create kar sakte ho!')}
            >
              <LinearGradient colors={['#7C5CFC', '#5B3FD9']} style={s2.addAlarmGrad}>
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>+ Naya Alarm</Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        );
      case 'suari':
        return (
          <View style={{ flex: 1 }}>
            <View style={s2.suariHeader}>
              <LinearGradient colors={['#FF6B9D', '#7C5CFC']} style={s2.suariAvatarLg}>
                <Text style={{ color: '#fff', fontSize: 28, fontWeight: 'bold' }}>S</Text>
              </LinearGradient>
              <View>
                <Text style={s2.suariName}>Suari AI</Text>
                <Text style={{ color: C.success, fontSize: 12 }}>● Online</Text>
              </View>
            </View>
            <SuariChat />
          </View>
        );
      case 'todo':
        return (
          <ScrollView contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 80 }}>
            <Text style={s2.sectionTitle}>📝 Study Tasks</Text>
            {todos.map(t => (
              <TouchableOpacity
                key={t.id}
                onPress={() => setTodos(todos.map(td => td.id === t.id ? { ...td, done: !td.done } : td))}
              >
                <View style={[s2.todoCard, { borderLeftColor: t.priority === 'high' ? C.error : C.warning }]}>
                  <Text style={{ fontSize: 20 }}>{t.done ? '✅' : '○'}</Text>
                  <Text style={[s2.todoTitle, t.done && { textDecorationLine: 'line-through', color: C.textMuted }]}>
                    {t.title}
                  </Text>
                  <View style={[s2.priorityBadge, { backgroundColor: t.priority === 'high' ? 'rgba(255,82,82,0.2)' : 'rgba(255,215,64,0.2)' }]}>
                    <Text style={{ fontSize: 10, color: t.priority === 'high' ? C.error : C.warning }}>
                      {t.priority.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
            <Text style={{ color: C.textMuted, textAlign: 'center', fontSize: 12, marginTop: 8 }}>
              Tap to toggle completion ✨
            </Text>
          </ScrollView>
        );
      case 'info':
        return (
          <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 80 }}>
            <LinearGradient colors={['rgba(124,92,252,0.2)', 'rgba(255,107,157,0.1)']} style={s2.aboutCard}>
              <Text style={{ fontSize: 60, textAlign: 'center' }}>🙈🐷</Text>
              <Text style={[s2.sectionTitle, { textAlign: 'center', fontSize: 24 }]}>Suari Ka Alarm</Text>
              <Text style={{ color: C.textSub, textAlign: 'center', lineHeight: 22 }}>
                Yeh ek demo hai! Full app mein yeh features hain:
              </Text>
            </LinearGradient>
            {[
              '🔔 Smart Alarm with Snooze & Repeat',
              '🤖 Suari AI Agent (Real Experiential Labs API)',
              '💬 Chat / Agent / Research Modes',
              '✅ Priority To-Do List with filters',
              '📚 Syllabus Tracker with AI topic fetch',
              '🌐 AI-powered Internet Search',
              '📱 Android APK via EAS Build',
            ].map((f, i) => (
              <View key={i} style={s2.featureRow}>
                <Text style={{ color: C.text, fontSize: 14 }}>{f}</Text>
              </View>
            ))}
            <LinearGradient colors={['#FF6B9D', '#7C5CFC']} style={s2.footerBadge}>
              <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>
                Made with ❤️ • Suari Ka Alarm
              </Text>
            </LinearGradient>
          </ScrollView>
        );
    }
  };

  return (
    <View style={s2.container}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <View style={s2.topBar}>
        <Text style={s2.appName}>🙈🐷 Suari Ka Alarm</Text>
      </View>
      <View style={s2.content}>{renderContent()}</View>
      <View style={s2.tabBar}>
        {tabs.map(t => (
          <TouchableOpacity key={t.id} style={s2.tabItem} onPress={() => setTab(t.id)}>
            <Text style={[s2.tabIcon, tab === t.id && { fontSize: 24 }]}>{t.icon}</Text>
            <Text style={[s2.tabLabel, tab === t.id && { color: C.primary }]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const s2 = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080818' },
  topBar: {
    paddingTop: 50, paddingBottom: 12, paddingHorizontal: 20,
    backgroundColor: '#0D0D22', borderBottomWidth: 1,
    borderBottomColor: 'rgba(124,92,252,0.2)',
  },
  appName: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  content: { flex: 1 },

  // Clock
  clockBox: { marginBottom: 8, borderRadius: 16, overflow: 'hidden' },
  clockGrad: { padding: 20, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(124,92,252,0.2)', alignItems: 'center' },
  clockDate: { color: '#A0A0C8', fontSize: 13, marginBottom: 8 },
  clockRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  clockTime: { fontSize: 68, fontWeight: 'bold', color: '#fff' },
  clockRight: { marginBottom: 8, gap: 4 },
  clockPeriod: { color: '#7C5CFC', fontSize: 20, fontWeight: 'bold' },
  clockSec: { color: '#606080', fontSize: 13 },

  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },

  // Alarms
  alarmCard: { borderRadius: 16, borderWidth: 1, borderColor: 'rgba(124,92,252,0.2)', overflow: 'hidden' },
  alarmActiveBar: { height: 3, backgroundColor: '#7C5CFC' },
  alarmRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  alarmTime: { fontSize: 38, fontWeight: 'bold', color: '#fff' },
  alarmLabel: { fontSize: 14, color: '#A0A0C8', marginTop: 2 },
  alarmDays: { fontSize: 11, color: '#606080' },
  addAlarmBtn: { borderRadius: 12, overflow: 'hidden', marginTop: 4 },
  addAlarmGrad: { padding: 16, alignItems: 'center' },

  // Suari
  suariHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16,
    backgroundColor: '#0D0D22', borderBottomWidth: 1, borderBottomColor: 'rgba(124,92,252,0.15)',
  },
  suariAvatarLg: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  suariName: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

  // Chat
  chatContainer: { flex: 1 },
  messages: { flex: 1, paddingHorizontal: 16 },
  bubble: { flexDirection: 'row', gap: 8, alignItems: 'flex-end' },
  userBubble: { justifyContent: 'flex-end' },
  aiBubble: { justifyContent: 'flex-start' },
  avatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  bubbleMsg: { maxWidth: '75%', borderRadius: 16, padding: 12 },
  userMsg: { backgroundColor: '#7C5CFC', borderBottomRightRadius: 4 },
  aiMsg: { backgroundColor: '#12122A', borderWidth: 1, borderColor: 'rgba(124,92,252,0.2)', borderBottomLeftRadius: 4 },
  msgText: { fontSize: 14, lineHeight: 20 },
  inputRow: { flexDirection: 'row', gap: 8, padding: 12, backgroundColor: '#0D0D22', borderTopWidth: 1, borderTopColor: 'rgba(124,92,252,0.15)' },
  chatInput: { flex: 1, backgroundColor: '#12122A', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, color: '#fff', borderWidth: 1, borderColor: 'rgba(124,92,252,0.3)' },
  sendBtn: { borderRadius: 22, overflow: 'hidden' },
  sendGrad: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },

  // Todo
  todoCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#12122A', borderRadius: 12, padding: 14, borderLeftWidth: 4 },
  todoTitle: { flex: 1, color: '#fff', fontSize: 14 },
  priorityBadge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },

  // About
  aboutCard: { borderRadius: 20, padding: 20, borderWidth: 1, borderColor: 'rgba(124,92,252,0.2)', gap: 8 },
  featureRow: { backgroundColor: '#12122A', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  footerBadge: { borderRadius: 12, padding: 16, marginTop: 8 },

  // Tab Bar
  tabBar: {
    flexDirection: 'row', backgroundColor: '#0D0D22', borderTopWidth: 1,
    borderTopColor: 'rgba(124,92,252,0.2)', paddingBottom: 20, paddingTop: 8,
  },
  tabItem: { flex: 1, alignItems: 'center', gap: 3 },
  tabIcon: { fontSize: 20 },
  tabLabel: { fontSize: 11, color: '#606080' },
});
