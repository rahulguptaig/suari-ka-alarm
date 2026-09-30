import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { LanguageCode } from '../locales';

// ==================== TYPES ====================

export interface Alarm {
  id: string;
  time: string; // HH:MM format
  label: string;
  isEnabled: boolean;
  days: boolean[]; // [Sun, Mon, Tue, Wed, Thu, Fri, Sat]
  sound: string;
  vibrate: boolean;
  snoozeEnabled: boolean;
  snoozeDuration: number; // minutes
  createdAt: string;
}

export interface TodoItem {
  id: string;
  title: string;
  description?: string;
  subject?: string;
  priority: 'low' | 'medium' | 'high';
  isCompleted: boolean;
  dueDate?: string;
  createdAt: string;
  completedAt?: string;
}

export interface SyllabusSubject {
  id: string;
  name: string;
  color: string;
  totalTopics: number;
  topics: SyllabusTopic[];
  examDate?: string;
}

export interface SyllabusTopic {
  id: string;
  title: string;
  status: 'not_started' | 'in_progress' | 'completed';
  notes?: string;
  subtopics?: string[];
  estimatedHours?: number;
  completedAt?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  mode?: 'chat' | 'agent' | 'research';
  isLoading?: boolean;
}

export interface ChatThread {
  id: string;
  title: string;
  messages: ChatMessage[];
  mode: 'chat' | 'agent' | 'research';
  createdAt: string;
  updatedAt: string;
}

export interface SuariMemory {
  name?: string;
  preferences: Record<string, string>;
  facts: string[];
  lastInteraction?: string;
}

// ==================== STORE ====================

interface AppState {
  // Alarms
  alarms: Alarm[];
  addAlarm: (alarm: Alarm) => void;
  updateAlarm: (id: string, updates: Partial<Alarm>) => void;
  deleteAlarm: (id: string) => void;
  toggleAlarm: (id: string) => void;

  // Todos
  todos: TodoItem[];
  addTodo: (todo: TodoItem) => void;
  updateTodo: (id: string, updates: Partial<TodoItem>) => void;
  deleteTodo: (id: string) => void;
  toggleTodo: (id: string) => void;

  // Syllabus
  subjects: SyllabusSubject[];
  addSubject: (subject: SyllabusSubject) => void;
  updateSubject: (id: string, updates: Partial<SyllabusSubject>) => void;
  deleteSubject: (id: string) => void;
  updateTopicStatus: (subjectId: string, topicId: string, status: SyllabusTopic['status']) => void;
  addTopic: (subjectId: string, topic: SyllabusTopic) => void;
  deleteTopic: (subjectId: string, topicId: string) => void;

  // Chat / Suari
  threads: ChatThread[];
  activeThreadId: string | null;
  suariMemory: SuariMemory;
  addThread: (thread: ChatThread) => void;
  setActiveThread: (id: string | null) => void;
  addMessage: (threadId: string, message: ChatMessage) => void;
  updateMessage: (threadId: string, messageId: string, updates: Partial<ChatMessage>) => void;
  deleteThread: (id: string) => void;
  updateSuariMemory: (updates: Partial<SuariMemory>) => void;

  // App settings
  userName: string;
  apiKey: string;
  theme: 'dark' | 'light';
  language: LanguageCode;
  setUserName: (name: string) => void;
  setApiKey: (key: string) => void;
  setLanguage: (lang: LanguageCode) => void;

  // Hydration
  hydrated: boolean;
  hydrate: () => Promise<void>;
  persist: () => Promise<void>;
}

const STORAGE_KEY = 'suari_alarm_data';

export const useAppStore = create<AppState>((set, get) => ({
  // === Alarms ===
  alarms: [],
  addAlarm: (alarm) => {
    set((s) => ({ alarms: [...s.alarms, alarm] }));
    get().persist();
    // Sync to Supabase
    supabase.from('suari_alarms').insert({
      id: alarm.id,
      time: alarm.time,
      label: alarm.label,
      is_enabled: alarm.isEnabled,
      days: alarm.days,
      sound: alarm.sound,
      vibrate: alarm.vibrate,
      snooze_enabled: alarm.snoozeEnabled,
      snooze_duration: alarm.snoozeDuration
    }).then(({error}) => { if (error) console.error('Supabase Add Alarm Error:', error); });
  },
  updateAlarm: (id, updates) => {
    set((s) => ({ alarms: s.alarms.map((a) => (a.id === id ? { ...a, ...updates } : a)) }));
    get().persist();
    // Sync to Supabase
    const updated = get().alarms.find(a => a.id === id);
    if (updated) {
      supabase.from('suari_alarms').update({
        time: updated.time,
        label: updated.label,
        is_enabled: updated.isEnabled,
        days: updated.days,
        sound: updated.sound,
        vibrate: updated.vibrate,
        snooze_enabled: updated.snoozeEnabled,
        snooze_duration: updated.snoozeDuration
      }).eq('id', id).then(({error}) => { if (error) console.error('Supabase Update Alarm Error:', error); });
    }
  },
  deleteAlarm: (id) => {
    set((s) => ({ alarms: s.alarms.filter((a) => a.id !== id) }));
    get().persist();
    supabase.from('suari_alarms').delete().eq('id', id).then(({error}) => { if (error) console.error('Supabase Delete Alarm Error:', error); });
  },
  toggleAlarm: (id) => {
    set((s) => ({
      alarms: s.alarms.map((a) => (a.id === id ? { ...a, isEnabled: !a.isEnabled } : a)),
    }));
    get().persist();
    const updated = get().alarms.find(a => a.id === id);
    if (updated) {
      supabase.from('suari_alarms').update({ is_enabled: updated.isEnabled }).eq('id', id)
        .then(({error}) => { if (error) console.error('Supabase Toggle Alarm Error:', error); });
    }
  },

  // === Todos ===
  todos: [],
  addTodo: (todo) => {
    set((s) => ({ todos: [todo, ...s.todos] }));
    get().persist();
    supabase.from('suari_todos').insert({
      id: todo.id,
      title: todo.title,
      description: todo.description || null,
      subject: todo.subject || null,
      priority: todo.priority,
      is_completed: todo.isCompleted,
      due_date: todo.dueDate || null,
      completed_at: todo.completedAt || null
    }).then(({error}) => { if (error) console.error('Supabase Add Todo Error:', error); });
  },
  updateTodo: (id, updates) => {
    set((s) => ({ todos: s.todos.map((t) => (t.id === id ? { ...t, ...updates } : t)) }));
    get().persist();
    const updated = get().todos.find(t => t.id === id);
    if (updated) {
      supabase.from('suari_todos').update({
        title: updated.title,
        description: updated.description || null,
        subject: updated.subject || null,
        priority: updated.priority,
        is_completed: updated.isCompleted,
        due_date: updated.dueDate || null,
        completed_at: updated.completedAt || null
      }).eq('id', id).then(({error}) => { if (error) console.error('Supabase Update Todo Error:', error); });
    }
  },
  deleteTodo: (id) => {
    set((s) => ({ todos: s.todos.filter((t) => t.id !== id) }));
    get().persist();
    supabase.from('suari_todos').delete().eq('id', id).then(({error}) => { if (error) console.error('Supabase Delete Todo Error:', error); });
  },
  toggleTodo: (id) => {
    set((s) => ({
      todos: s.todos.map((t) =>
        t.id === id
          ? {
              ...t,
              isCompleted: !t.isCompleted,
              completedAt: !t.isCompleted ? new Date().toISOString() : undefined,
            }
          : t
      ),
    }));
    get().persist();
    const updated = get().todos.find(t => t.id === id);
    if (updated) {
      supabase.from('suari_todos').update({
        is_completed: updated.isCompleted,
        completed_at: updated.completedAt || null
      }).eq('id', id).then(({error}) => { if (error) console.error('Supabase Toggle Todo Error:', error); });
    }
  },

  // === Syllabus ===
  subjects: [],
  addSubject: (subject) => {
    set((s) => ({ subjects: [...s.subjects, subject] }));
    get().persist();
  },
  updateSubject: (id, updates) => {
    set((s) => ({
      subjects: s.subjects.map((sub) => (sub.id === id ? { ...sub, ...updates } : sub)),
    }));
    get().persist();
  },
  deleteSubject: (id) => {
    set((s) => ({ subjects: s.subjects.filter((sub) => sub.id !== id) }));
    get().persist();
  },
  updateTopicStatus: (subjectId, topicId, status) => {
    set((s) => ({
      subjects: s.subjects.map((sub) =>
        sub.id === subjectId
          ? {
              ...sub,
              topics: sub.topics.map((t) =>
                t.id === topicId
                  ? {
                      ...t,
                      status,
                      completedAt: status === 'completed' ? new Date().toISOString() : undefined,
                    }
                  : t
              ),
            }
          : sub
      ),
    }));
    get().persist();
  },
  addTopic: (subjectId, topic) => {
    set((s) => ({
      subjects: s.subjects.map((sub) =>
        sub.id === subjectId
          ? { ...sub, topics: [...sub.topics, topic], totalTopics: sub.totalTopics + 1 }
          : sub
      ),
    }));
    get().persist();
  },
  deleteTopic: (subjectId, topicId) => {
    set((s) => ({
      subjects: s.subjects.map((sub) =>
        sub.id === subjectId
          ? {
              ...sub,
              topics: sub.topics.filter((t) => t.id !== topicId),
              totalTopics: sub.totalTopics - 1,
            }
          : sub
      ),
    }));
    get().persist();
  },

  // === Suari AI ===
  threads: [],
  activeThreadId: null,
  suariMemory: {
    preferences: {},
    facts: [],
  },
  addThread: (thread) => {
    set((s) => ({ threads: [thread, ...s.threads], activeThreadId: thread.id }));
    get().persist();
  },
  setActiveThread: (id) => set({ activeThreadId: id }),
  addMessage: (threadId, message) => {
    set((s) => ({
      threads: s.threads.map((t) =>
        t.id === threadId
          ? {
              ...t,
              messages: [...t.messages, message],
              updatedAt: new Date().toISOString(),
            }
          : t
      ),
    }));
    get().persist();
  },
  updateMessage: (threadId, messageId, updates) => {
    set((s) => ({
      threads: s.threads.map((t) =>
        t.id === threadId
          ? {
              ...t,
              messages: t.messages.map((m) => (m.id === messageId ? { ...m, ...updates } : m)),
            }
          : t
      ),
    }));
  },
  deleteThread: (id) => {
    set((s) => ({
      threads: s.threads.filter((t) => t.id !== id),
      activeThreadId: s.activeThreadId === id ? null : s.activeThreadId,
    }));
    get().persist();
  },
  updateSuariMemory: (updates) => {
    set((s) => ({ suariMemory: { ...s.suariMemory, ...updates } }));
    get().persist();
  },

  // === Settings ===
  userName: '',
  apiKey: 'xpl_76a550bb70e209cceffb5a0f3168fddb105893b9',
  theme: 'dark',
  language: 'en',
  setUserName: (name) => {
    set({ userName: name });
    get().persist();
  },
  setApiKey: (key) => {
    set({ apiKey: key });
    get().persist();
  },
  setLanguage: (lang) => {
    set({ language: lang });
    get().persist();
  },

  // === Hydration ===
  hydrated: false,
  hydrate: async () => {
    try {
      // First try to load from local storage
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      let localData: any = {};
      if (raw) {
        localData = JSON.parse(raw);
        set({
          alarms: localData.alarms || [],
          todos: localData.todos || [],
          subjects: localData.subjects || [],
          threads: localData.threads || [],
          activeThreadId: localData.activeThreadId || null,
          suariMemory: localData.suariMemory || { preferences: {}, facts: [] },
          userName: localData.userName || '',
          apiKey: localData.apiKey || 'xpl_76a550bb70e209cceffb5a0f3168fddb105893b9',
          theme: localData.theme || 'dark',
          language: localData.language || 'en',
        });
      }

      // Then sync from Supabase
      const { data: dbAlarms, error: alarmsError } = await supabase.from('suari_alarms').select('*');
      const { data: dbTodos, error: todosError } = await supabase.from('suari_todos').select('*');

      if (!alarmsError && dbAlarms) {
        const mappedAlarms = dbAlarms.map(a => ({
          id: a.id,
          time: a.time,
          label: a.label,
          isEnabled: a.is_enabled,
          days: a.days,
          sound: a.sound,
          vibrate: a.vibrate,
          snoozeEnabled: a.snooze_enabled,
          snoozeDuration: a.snooze_duration,
          createdAt: a.created_at
        }));
        
        // Merge or just replace? Let's replace for simplicity since cloud is source of truth
        if (mappedAlarms.length > 0) {
          set({ alarms: mappedAlarms });
        }
      }

      if (!todosError && dbTodos) {
        const mappedTodos = dbTodos.map(t => ({
          id: t.id,
          title: t.title,
          description: t.description || undefined,
          subject: t.subject || undefined,
          priority: t.priority as any,
          isCompleted: t.is_completed,
          dueDate: t.due_date || undefined,
          createdAt: t.created_at,
          completedAt: t.completed_at || undefined
        }));

        if (mappedTodos.length > 0) {
          set({ todos: mappedTodos });
        }
      }
      
      // Persist the synced state back to local storage
      get().persist();

    } catch (e) {
      console.error('Hydration error:', e);
    } finally {
      set({ hydrated: true });
    }
  },
  persist: async () => {
    try {
      const s = get();
      const data = {
        alarms: s.alarms,
        todos: s.todos,
        subjects: s.subjects,
        threads: s.threads,
        activeThreadId: s.activeThreadId,
        suariMemory: s.suariMemory,
        userName: s.userName,
        apiKey: s.apiKey,
        theme: s.theme,
        language: s.language,
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Persist error:', e);
    }
  },
}));
