import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  FlatList,
  Animated,
  Pressable,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAppStore, ChatThread, ChatMessage } from '../../store/useAppStore';
import {
  callSuariAI,
  SUARI_SYSTEM_PROMPTS,
  parseAgentResponse,
  suariWebSearch,
  AgentAction,
} from '../../services/suariAI';
import { COLORS, BORDER_RADIUS, SPACING } from '../../constants/theme';

type ChatMode = 'chat' | 'agent' | 'research';

// ==================== MODE CONFIG ====================
const MODE_CONFIG = {
  chat: {
    label: 'Chat',
    icon: 'chatbubble-outline',
    color: COLORS.primary,
    description: 'Have a normal conversation with Suari',
    system: SUARI_SYSTEM_PROMPTS.chat,
  },
  agent: {
    label: 'Agent',
    icon: 'flash-outline',
    color: COLORS.accent,
    description: 'Get things done - set alarms, tasks, and more',
    system: SUARI_SYSTEM_PROMPTS.agent,
  },
  research: {
    label: 'Research',
    icon: 'search-outline',
    color: COLORS.secondary,
    description: 'Perform deep research and get detailed info',
    system: SUARI_SYSTEM_PROMPTS.research,
  },
};

// ==================== MESSAGE BUBBLE ====================
function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  const isLoading = message.isLoading;

  const [loadingText, setLoadingText] = useState('Initializing...');
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    if (isLoading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 0.4, duration: 800, useNativeDriver: true }),
        ])
      ).start();

      const steps = message.mode === 'research' 
        ? ['Analyzing query...', 'Searching knowledge base...', 'Compiling research...', 'Finalizing insights...']
        : message.mode === 'agent'
        ? ['Analyzing request...', 'Determining actions...', 'Processing tasks...', 'Finalizing...']
        : ['Thinking...', 'Formulating response...'];

      let stepIdx = 0;
      setLoadingText(steps[stepIdx]);
      
      const interval = setInterval(() => {
        stepIdx = Math.min(stepIdx + 1, steps.length - 1);
        setLoadingText(steps[stepIdx]);
      }, 2000);
      
      return () => clearInterval(interval);
    }
  }, [isLoading, message.mode]);

  return (
    <View style={[styles.messageBubbleContainer, isUser ? styles.userBubbleContainer : styles.aiBubbleContainer]}>
      {!isUser && (
        <View style={styles.suariAvatar}>
          <LinearGradient colors={['#FF6B9D', '#7C5CFC']} style={styles.suariAvatarGrad}>
            <Text style={styles.suariAvatarText}>S</Text>
          </LinearGradient>
        </View>
      )}

      <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
        {isLoading ? (
          <Animated.View style={[styles.premiumLoadingContainer, { opacity: pulseAnim }]}>
            <Ionicons name="sparkles" size={14} color={COLORS.accent} style={{ marginRight: 6 }} />
            <Text style={styles.premiumLoadingText}>{loadingText}</Text>
          </Animated.View>
        ) : (
          <Text style={[styles.messageText, isUser ? styles.userMessageText : styles.aiMessageText]}>
            {message.content}
          </Text>
        )}
        <Text style={styles.messageTime}>
          {new Date(message.timestamp).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>

      {isUser && (
        <View style={styles.userAvatar}>
          <Ionicons name="person" size={16} color={COLORS.primary} />
        </View>
      )}
    </View>
  );
}

// ==================== THREAD SIDEBAR ====================
function ThreadSidebar({ visible, threads, activeId, onSelect, onNew, onClose, onDelete, onRename }: {
  visible: boolean;
  threads: ChatThread[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onClose: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newTitle: string) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState('');

  if (!visible) return null;

  return (
    <Pressable style={styles.sidebarOverlay} onPress={onClose}>
      <Pressable style={styles.sidebar} onPress={e => e.stopPropagation()}>
        <LinearGradient colors={['#0D0D25', '#12122A']} style={StyleSheet.absoluteFill} />

        <View style={styles.sidebarHeader}>
          <Text style={styles.sidebarTitle}>Conversations</Text>
          <TouchableOpacity onPress={onNew} style={styles.newThreadBtn}>
            <Ionicons name="add-circle" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.threadList}>
          {threads.length === 0 ? (
            <Text style={styles.noThreads}>No conversations yet.</Text>
          ) : (
            threads.map((thread) => (
              <TouchableOpacity
                key={thread.id}
                style={[styles.threadItem, thread.id === activeId && styles.threadItemActive]}
                onPress={() => {
                  if (editingId !== thread.id) {
                    onSelect(thread.id);
                    onClose();
                  }
                }}
              >
                <View style={[styles.threadModeIcon, { backgroundColor: MODE_CONFIG[thread.mode]?.color + '22' }]}>
                  <Ionicons
                    name={MODE_CONFIG[thread.mode]?.icon as any}
                    size={14}
                    color={MODE_CONFIG[thread.mode]?.color}
                  />
                </View>
                <View style={styles.threadInfo}>
                  {editingId === thread.id ? (
                    <TextInput
                      style={styles.threadRenameInput}
                      value={tempTitle}
                      onChangeText={setTempTitle}
                      autoFocus
                      onBlur={() => {
                        if (tempTitle.trim()) {
                          onRename(thread.id, tempTitle.trim());
                        }
                        setEditingId(null);
                      }}
                      onSubmitEditing={() => {
                        if (tempTitle.trim()) {
                          onRename(thread.id, tempTitle.trim());
                        }
                        setEditingId(null);
                      }}
                    />
                  ) : (
                    <Text style={styles.threadTitle} numberOfLines={1}>{thread.title}</Text>
                  )}
                  <Text style={styles.threadTime}>
                    {new Date(thread.updatedAt).toLocaleDateString('en-US')}
                  </Text>
                </View>
                
                {editingId !== thread.id && (
                  <View style={styles.threadActions}>
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        setTempTitle(thread.title);
                        setEditingId(thread.id);
                      }}
                      style={styles.threadActionBtn}
                    >
                      <Ionicons name="pencil" size={14} color={COLORS.textMuted} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        Alert.alert('Delete Thread?', 'Are you sure you want to delete this conversation?', [
                          { text: 'Cancel', style: 'cancel' },
                          { text: 'Delete', style: 'destructive', onPress: () => onDelete(thread.id) },
                        ]);
                      }}
                      style={styles.threadActionBtn}
                    >
                      <Ionicons name="trash" size={14} color="#ff4444" />
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </Pressable>
    </Pressable>
  );
}

// ==================== MAIN SUARI SCREEN ====================
export default function SuariScreen() {
  const {
    threads,
    activeThreadId,
    apiKey,
    userName,
    suariMemory,
    addThread,
    setActiveThread,
    addMessage,
    updateMessage,
    updateThread,
    deleteThread,
    updateSuariMemory,
  } = useAppStore();

  const [mode, setMode] = useState<ChatMode>('chat');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const activeThread = threads.find(t => t.id === activeThreadId);
  const messages = activeThread?.messages || [];

  // Create new thread
  const createNewThread = useCallback((selectedMode: ChatMode = mode) => {
    const newThread: ChatThread = {
      id: Date.now().toString(),
      title: 'New Conversation',
      messages: [],
      mode: selectedMode,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addThread(newThread);
    setMode(selectedMode);
  }, [mode, addThread]);

  // Auto-create thread if none exists
  useEffect(() => {
    if (!activeThreadId && threads.length === 0) {
      createNewThread();
    } else if (!activeThreadId && threads.length > 0) {
      setActiveThread(threads[0].id);
    }
  }, []);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    if (!activeThreadId) {
      createNewThread();
      return;
    }

    setInput('');
    setIsLoading(true);

    // Add user message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
      mode,
    };
    addMessage(activeThreadId, userMsg);

    // Add loading placeholder
    const loadingMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      mode,
      isLoading: true,
    };
    addMessage(activeThreadId, loadingMsg);

    // Scroll to bottom
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      // Build message history
      const threadMessages = activeThread?.messages || [];
      const historyMessages = threadMessages
        .filter(m => !m.isLoading)
        .slice(-10)
        .map(m => ({ role: m.role, content: m.content }));

      let response: string;

      if (mode === 'research') {
        response = await suariWebSearch(apiKey, text);
      } else {
        response = await callSuariAI(apiKey, {
          messages: [
            { role: 'system', content: MODE_CONFIG[mode].system },
            ...historyMessages,
            { role: 'user', content: text },
          ],
          model: mode === 'research' ? 'qwen3.8-27b' : 'gpt-5.6-luna',
        });
      }

      // Handle agent actions
      if (mode === 'agent') {
        const parsed = parseAgentResponse(response);
        if (parsed.isAction && parsed.action) {
          handleAgentAction(parsed.action);
          response = parsed.text;
        }
      }

      // Update title if first message
      if (threadMessages.length === 0) {
        const title = text.slice(0, 40) + (text.length > 40 ? '...' : '');
        // Update thread title
      }

      // Update loading message with actual response
      updateMessage(activeThreadId, loadingMsg.id, {
        content: response,
        isLoading: false,
      });

    } catch (error: any) {
      updateMessage(activeThreadId, loadingMsg.id, {
        content: `❌ Error: ${error.message}\n\nAPI key check karein Settings mein.`,
        isLoading: false,
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [input, isLoading, activeThreadId, activeThread, mode, apiKey, addMessage, updateMessage]);

  const handleAgentAction = (action: AgentAction) => {
    switch (action.action) {
      case 'set_alarm':
        router.push('/alarm/new');
        break;
      case 'add_todo':
        router.push('/todo');
        break;
      case 'create_syllabus':
        router.push('/syllabus/add');
        break;
    }
  };

  const handleRenameThread = useCallback((id: string, newTitle: string) => {
    updateThread(id, { title: newTitle });
  }, [updateThread]);

  const handleDeleteThread = (id: string) => {
    Alert.alert('Delete Conversation?', 'Are you sure you want to delete this conversation?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteThread(id) },
    ]);
  };

  const suggestedPrompts = {
    chat: ['Mujhe motivate karo!', 'Study tips batao', 'Time management kaise karein?'],
    agent: ['Kal subah 6 baje alarm set karo', 'Math ki to-do list banao', 'Mera schedule dekhao'],
    research: ['Photosynthesis explain karo', 'Indian history key events', 'Quantum physics basics'],
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#0D0D25', '#080818']}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => setShowSidebar(true)} style={styles.headerBtn}>
          <Ionicons name="menu-outline" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <LinearGradient colors={['#FF6B9D', '#7C5CFC']} style={styles.headerAvatar}>
            <Text style={styles.headerAvatarText}>S</Text>
          </LinearGradient>
          <View>
            <Text style={styles.headerName}>Suari</Text>
            <Text style={styles.headerStatus}>● Online</Text>
          </View>
        </View>

        <TouchableOpacity onPress={() => createNewThread()} style={styles.headerBtn}>
          <Ionicons name="create-outline" size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </LinearGradient>

      {/* Mode Selector */}
      <View style={styles.modeSelectorContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.modeSelector}>
          {(Object.keys(MODE_CONFIG) as ChatMode[]).map((m) => (
            <TouchableOpacity
              key={m}
              onPress={() => {
                setMode(m);
                if (messages.length > 0) createNewThread(m);
              }}
              style={[styles.modeButton, mode === m && { borderColor: MODE_CONFIG[m].color }]}
            >
              <LinearGradient
                colors={mode === m ? [MODE_CONFIG[m].color + '33', MODE_CONFIG[m].color + '11'] : ['transparent', 'transparent']}
                style={styles.modeButtonGrad}
              >
                <Ionicons
                  name={MODE_CONFIG[m].icon as any}
                  size={16}
                  color={mode === m ? MODE_CONFIG[m].color : COLORS.textMuted}
                />
                <Text style={[styles.modeName, mode === m && { color: MODE_CONFIG[m].color }]}>
                  {MODE_CONFIG[m].label}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {/* Welcome message */}
          {messages.length === 0 && (
            <View style={styles.welcomeContainer}>
              <LinearGradient colors={['#FF6B9D', '#7C5CFC']} style={styles.welcomeAvatar}>
                <Text style={styles.welcomeAvatarText}>S</Text>
              </LinearGradient>
              <Text style={styles.welcomeTitle}>
                Namaste{userName ? `, ${userName}` : ''}! Main Suari hoon 🌟
              </Text>
              <Text style={styles.welcomeSubtitle}>
                {MODE_CONFIG[mode].description}
              </Text>

              {/* Suggested prompts */}
              <View style={styles.suggestionsContainer}>
                <Text style={styles.suggestionsTitle}>Kuch try karo:</Text>
                {suggestedPrompts[mode].map((prompt, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.suggestionPill}
                    onPress={() => setInput(prompt)}
                  >
                    <Text style={styles.suggestionText}>{prompt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          <LinearGradient
            colors={['rgba(13,13,37,0.95)', 'rgba(8,8,24,0.98)']}
            style={styles.inputWrapper}
          >
            <TextInput
              style={styles.textInput}
              value={input}
              onChangeText={setInput}
              placeholder={`${MODE_CONFIG[mode].label} mode mein kuch poochho...`}
              placeholderTextColor={COLORS.textMuted}
              multiline
              maxLength={2000}
              returnKeyType="send"
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity
              style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={!input.trim() || isLoading}
            >
              <LinearGradient
                colors={input.trim() ? ['#FF6B9D', '#7C5CFC'] : ['#333', '#333']}
                style={styles.sendButtonGrad}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="send" size={18} color="#fff" />
                )}
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </KeyboardAvoidingView>

      {/* Thread Sidebar */}
      <ThreadSidebar
        visible={showSidebar}
        threads={threads}
        activeId={activeThreadId}
        onSelect={(id) => setActiveThread(id)}
        onNew={() => createNewThread()}
        onClose={() => setShowSidebar(false)}
        onDelete={handleDeleteThread}
        onRename={handleRenameThread}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  flex: { flex: 1 },

  // Header
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
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'SpaceGrotesk-Bold',
  },
  headerName: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontFamily: 'SpaceGrotesk-SemiBold',
  },
  headerStatus: {
    color: COLORS.success,
    fontSize: 11,
    fontFamily: 'SpaceGrotesk-Regular',
  },

  // Mode selector
  modeSelectorContainer: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(124,92,252,0.1)',
  },
  modeSelector: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  modeButton: {
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  modeButtonGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  modeName: {
    fontSize: 13,
    fontFamily: 'SpaceGrotesk-SemiBold',
    color: COLORS.textMuted,
  },

  // Messages
  messagesContainer: { flex: 1 },
  messagesContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    gap: SPACING.md,
  },

  // Welcome
  welcomeContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    gap: SPACING.md,
  },
  welcomeAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  welcomeAvatarText: {
    color: '#fff',
    fontSize: 36,
    fontFamily: 'SpaceGrotesk-Bold',
  },
  welcomeTitle: {
    fontSize: 20,
    fontFamily: 'SpaceGrotesk-SemiBold',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontFamily: 'SpaceGrotesk-Regular',
  },
  suggestionsContainer: {
    width: '100%',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  suggestionsTitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontFamily: 'SpaceGrotesk-Medium',
    textAlign: 'center',
  },
  suggestionPill: {
    backgroundColor: 'rgba(124,92,252,0.1)',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(124,92,252,0.2)',
    padding: SPACING.md,
    alignItems: 'center',
  },
  suggestionText: {
    color: COLORS.primary,
    fontSize: 13,
    fontFamily: 'SpaceGrotesk-Medium',
  },

  // Message bubbles
  messageBubbleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: SPACING.sm,
    marginBottom: 4,
  },
  userBubbleContainer: { justifyContent: 'flex-end' },
  aiBubbleContainer: { justifyContent: 'flex-start' },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    gap: 4,
  },
  userBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: COLORS.bgCardLight,
    borderWidth: 1,
    borderColor: 'rgba(124,92,252,0.2)',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 21,
    fontFamily: 'SpaceGrotesk-Regular',
  },
  userMessageText: { color: '#fff' },
  aiMessageText: { color: COLORS.textPrimary },
  messageTime: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
    fontFamily: 'SpaceGrotesk-Regular',
    alignSelf: 'flex-end',
  },
  suariAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
  },
  suariAvatarGrad: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suariAvatarText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'SpaceGrotesk-Bold',
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(124,92,252,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(124,92,252,0.4)',
  },

  premiumLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  premiumLoadingText: {
    fontSize: 13,
    color: COLORS.accent,
    fontFamily: 'SpaceGrotesk-Medium',
    fontStyle: 'italic',
  },

  // Input
  inputContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(124,92,252,0.15)',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: 'rgba(124,92,252,0.3)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
    fontFamily: 'SpaceGrotesk-Regular',
    maxHeight: 120,
    paddingVertical: 4,
  },
  sendButton: {
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
  },
  sendButtonDisabled: { opacity: 0.5 },
  sendButtonGrad: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Sidebar
  sidebarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 100,
  },
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 280,
    overflow: 'hidden',
    borderRightWidth: 1,
    borderRightColor: 'rgba(124,92,252,0.2)',
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: 60,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(124,92,252,0.15)',
  },
  sidebarTitle: {
    fontSize: 18,
    fontFamily: 'SpaceGrotesk-Bold',
    color: COLORS.textPrimary,
  },
  newThreadBtn: {
    padding: 4,
  },
  threadList: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
  },
  threadItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: 4,
  },
  threadItemActive: {
    backgroundColor: 'rgba(124,92,252,0.15)',
  },
  threadModeIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  threadInfo: { flex: 1 },
  threadTitle: {
    fontSize: 13,
    fontFamily: 'SpaceGrotesk-Medium',
    color: COLORS.textPrimary,
  },
  threadRenameInput: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontFamily: 'SpaceGrotesk-Medium',
    padding: 0,
    margin: 0,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary,
  },
  threadTime: {
    fontSize: 11,
    fontFamily: 'SpaceGrotesk-Regular',
    color: COLORS.textMuted,
  },
  threadActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginLeft: 8,
  },
  threadActionBtn: {
    padding: 4,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 6,
  },
  noThreads: {
    color: COLORS.textMuted,
    textAlign: 'center',
    fontSize: 13,
    paddingTop: SPACING.xl,
    fontFamily: 'SpaceGrotesk-Regular',
  },
});
