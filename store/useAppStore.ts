import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  setUserName: (name: string) => void;
  setApiKey: (key: string) => void;

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
  },
  updateAlarm: (id, updates) => {
    set((s) => ({ alarms: s.alarms.map((a) => (a.id === id ? { ...a, ...updates } : a)) }));
    get().persist();
  },
  deleteAlarm: (id) => {
    set((s) => ({ alarms: s.alarms.filter((a) => a.id !== id) }));
    get().persist();
  },
  toggleAlarm: (id) => {
    set((s) => ({
      alarms: s.alarms.map((a) => (a.id === id ? { ...a, isEnabled: !a.isEnabled } : a)),
    }));
    get().persist();
  },

  // === Todos ===
  todos: [],
  addTodo: (todo) => {
    set((s) => ({ todos: [todo, ...s.todos] }));
    get().persist();
  },
  updateTodo: (id, updates) => {
    set((s) => ({ todos: s.todos.map((t) => (t.id === id ? { ...t, ...updates } : t)) }));
    get().persist();
  },
  deleteTodo: (id) => {
    set((s) => ({ todos: s.todos.filter((t) => t.id !== id) }));
    get().persist();
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
  apiKey: process.env.EXPO_PUBLIC_EXPLABS_API_KEY || '',
  theme: 'dark',
  setUserName: (name) => {
    set({ userName: name });
    get().persist();
  },
  setApiKey: (key) => {
    set({ apiKey: key });
    get().persist();
  },

  // === Hydration ===
  hydrated: false,
  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        set({
          alarms: data.alarms || [],
          todos: data.todos || [],
          subjects: data.subjects || [],
          threads: data.threads || [],
          activeThreadId: data.activeThreadId || null,
          suariMemory: data.suariMemory || { preferences: {}, facts: [] },
          userName: data.userName || '',
          apiKey: data.apiKey || process.env.EXPO_PUBLIC_EXPLABS_API_KEY || '',
          theme: data.theme || 'dark',
        });
      }
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
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Persist error:', e);
    }
  },
}));
