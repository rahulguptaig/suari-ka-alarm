import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Animated,
  Alert,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppStore, TodoItem } from '../../store/useAppStore';
import { COLORS, BORDER_RADIUS, SPACING } from '../../constants/theme';

type FilterType = 'all' | 'pending' | 'completed' | 'high' | 'medium' | 'low';
type Priority = 'low' | 'medium' | 'high';

const PRIORITY_CONFIG = {
  high: { label: 'High', color: COLORS.error, icon: 'alert-circle' },
  medium: { label: 'Medium', color: COLORS.warning, icon: 'alert' },
  low: { label: 'Low', color: COLORS.success, icon: 'checkmark-circle' },
};

// ==================== ADD TODO MODAL ====================
function AddTodoModal({ visible, onClose, onAdd }: {
  visible: boolean;
  onClose: () => void;
  onAdd: (todo: Omit<TodoItem, 'id' | 'createdAt' | 'isCompleted'>) => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = () => {
    if (!title.trim()) return;
    onAdd({ title: title.trim(), description, subject, priority, dueDate: dueDate || undefined });
    setTitle('');
    setDescription('');
    setSubject('');
    setPriority('medium');
    setDueDate('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalContainer} onPress={e => e.stopPropagation()}>
          <LinearGradient colors={['#12122A', '#0D0D22']} style={styles.modalGrad}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Naya Task</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Task ka naam..."
              placeholderTextColor={COLORS.textMuted}
              value={title}
              onChangeText={setTitle}
              autoFocus
            />

            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              placeholder="Description (optional)..."
              placeholderTextColor={COLORS.textMuted}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />

            <TextInput
              style={styles.modalInput}
              placeholder="Subject (e.g. Math, Science)..."
              placeholderTextColor={COLORS.textMuted}
              value={subject}
              onChangeText={setSubject}
            />

            {/* Priority */}
            <Text style={styles.modalLabel}>Priority</Text>
            <View style={styles.priorityRow}>
              {(['high', 'medium', 'low'] as Priority[]).map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.priorityButton,
                    { borderColor: PRIORITY_CONFIG[p].color },
                    priority === p && { backgroundColor: PRIORITY_CONFIG[p].color + '33' },
                  ]}
                  onPress={() => setPriority(p)}
                >
                  <Ionicons
                    name={PRIORITY_CONFIG[p].icon as any}
                    size={16}
                    color={PRIORITY_CONFIG[p].color}
                  />
                  <Text style={[styles.priorityLabel, { color: PRIORITY_CONFIG[p].color }]}>
                    {PRIORITY_CONFIG[p].label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Due date (DD/MM/YYYY)..."
              placeholderTextColor={COLORS.textMuted}
              value={dueDate}
              onChangeText={setDueDate}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.addBtn, !title.trim() && { opacity: 0.5 }]}
                onPress={handleSubmit}
                disabled={!title.trim()}
              >
                <LinearGradient colors={['#7C5CFC', '#5B3FD9']} style={styles.addBtnGrad}>
                  <Text style={styles.addBtnText}>Task Add Karo</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ==================== TODO ITEM ====================
function TodoCard({ item, onToggle, onDelete }: {
  item: TodoItem;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const scaleAnim = new Animated.Value(1);

  return (
    <Animated.View style={[styles.todoCard, { transform: [{ scale: scaleAnim }] }]}>
      <LinearGradient
        colors={
          item.isCompleted
            ? ['rgba(0,230,118,0.05)', 'rgba(0,230,118,0.02)']
            : ['rgba(18,18,42,0.9)', 'rgba(13,13,34,0.9)']
        }
        style={styles.todoCardGrad}
      >
        {/* Priority bar */}
        <View style={[styles.priorityBar, { backgroundColor: PRIORITY_CONFIG[item.priority].color }]} />

        <View style={styles.todoCardContent}>
          {/* Checkbox */}
          <TouchableOpacity onPress={onToggle} style={styles.checkbox}>
            {item.isCompleted ? (
              <LinearGradient colors={[COLORS.success, '#00B248']} style={styles.checkboxFilled}>
                <Ionicons name="checkmark" size={16} color="#fff" />
              </LinearGradient>
            ) : (
              <View style={[styles.checkboxEmpty, { borderColor: PRIORITY_CONFIG[item.priority].color }]} />
            )}
          </TouchableOpacity>

          {/* Content */}
          <View style={styles.todoContent}>
            <Text style={[styles.todoTitle, item.isCompleted && styles.todoTitleDone]}>
              {item.title}
            </Text>
            {item.description ? (
              <Text style={styles.todoDescription} numberOfLines={2}>{item.description}</Text>
            ) : null}
            <View style={styles.todoMeta}>
              {item.subject ? (
                <View style={styles.subjectPill}>
                  <Text style={styles.subjectPillText}>{item.subject}</Text>
                </View>
              ) : null}
              {item.dueDate ? (
                <View style={styles.dueDatePill}>
                  <Ionicons name="calendar-outline" size={10} color={COLORS.warning} />
                  <Text style={styles.dueDateText}>{item.dueDate}</Text>
                </View>
              ) : null}
              {item.isCompleted && item.completedAt ? (
                <Text style={styles.completedAt}>
                  ✅ {new Date(item.completedAt).toLocaleDateString('hi-IN')}
                </Text>
              ) : null}
            </View>
          </View>

          {/* Delete */}
          <TouchableOpacity onPress={onDelete} style={styles.todoDeleteBtn}>
            <Ionicons name="close" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

// ==================== MAIN SCREEN ====================
export default function TodoScreen() {
  const { todos, addTodo, toggleTodo, deleteTodo } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const stats = useMemo(() => ({
    total: todos.length,
    completed: todos.filter(t => t.isCompleted).length,
    pending: todos.filter(t => !t.isCompleted).length,
    high: todos.filter(t => t.priority === 'high' && !t.isCompleted).length,
  }), [todos]);

  const filteredTodos = useMemo(() => {
    let filtered = todos;
    
    if (searchQuery) {
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.subject?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    switch (filter) {
      case 'pending': filtered = filtered.filter(t => !t.isCompleted); break;
      case 'completed': filtered = filtered.filter(t => t.isCompleted); break;
      case 'high': filtered = filtered.filter(t => t.priority === 'high'); break;
      case 'medium': filtered = filtered.filter(t => t.priority === 'medium'); break;
      case 'low': filtered = filtered.filter(t => t.priority === 'low'); break;
    }

    return filtered.sort((a, b) => {
      if (a.isCompleted && !b.isCompleted) return 1;
      if (!a.isCompleted && b.isCompleted) return -1;
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [todos, filter, searchQuery]);

  const handleAdd = useCallback((data: Omit<TodoItem, 'id' | 'createdAt' | 'isCompleted'>) => {
    addTodo({
      ...data,
      id: Date.now().toString(),
      isCompleted: false,
      createdAt: new Date().toISOString(),
    });
  }, [addTodo]);

  const handleDelete = (item: TodoItem) => {
    Alert.alert('Delete Task?', `"${item.title}" delete hoga.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteTodo(item.id) },
    ]);
  };

  const FILTERS: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'completed', label: 'Done' },
    { key: 'high', label: '🔴 High' },
    { key: 'medium', label: '🟡 Medium' },
    { key: 'low', label: '🟢 Low' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>📝 To-Do List</Text>
          <Text style={styles.headerSubtitle}>
            {stats.pending} pending • {stats.completed} done
          </Text>
        </View>
        <TouchableOpacity onPress={() => setShowModal(true)} style={styles.addFab}>
          <LinearGradient colors={['#7C5CFC', '#5B3FD9']} style={styles.addFabGrad}>
            <Ionicons name="add" size={26} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { borderColor: 'rgba(124,92,252,0.3)' }]}>
          <Text style={[styles.statNum, { color: COLORS.primary }]}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={[styles.statCard, { borderColor: 'rgba(0,230,118,0.3)' }]}>
          <Text style={[styles.statNum, { color: COLORS.success }]}>{stats.completed}</Text>
          <Text style={styles.statLabel}>Done</Text>
        </View>
        <View style={[styles.statCard, { borderColor: 'rgba(255,215,64,0.3)' }]}>
          <Text style={[styles.statNum, { color: COLORS.warning }]}>{stats.pending}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={[styles.statCard, { borderColor: 'rgba(255,82,82,0.3)' }]}>
          <Text style={[styles.statNum, { color: COLORS.error }]}>{stats.high}</Text>
          <Text style={styles.statLabel}>Urgent</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color={COLORS.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tasks dhundho..."
          placeholderTextColor={COLORS.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersRow}
      >
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            onPress={() => setFilter(f.key)}
            style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
          >
            <Text style={[styles.filterChipText, filter === f.key && styles.filterChipTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Todo List */}
      <FlatList
        data={filteredTodos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TodoCard
            item={item}
            onToggle={() => toggleTodo(item.id)}
            onDelete={() => handleDelete(item)}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="clipboard-check-outline" size={70} color="rgba(124,92,252,0.3)" />
            <Text style={styles.emptyTitle}>
              {searchQuery ? 'Koi task nahi mila' : 'Koi task nahi hai!'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 'Alag search try karo' : '+ dabao aur apna pehla task add karo'}
            </Text>
          </View>
        }
      />

      <AddTodoModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onAdd={handleAdd}
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

  // Stats
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.bgCard,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  statNum: {
    fontSize: 20,
    fontFamily: 'SpaceGrotesk-Bold',
  },
  statLabel: {
    fontSize: 10,
    fontFamily: 'SpaceGrotesk-Medium',
    color: COLORS.textMuted,
    marginTop: 2,
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    marginHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(124,92,252,0.15)',
    marginBottom: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
    fontFamily: 'SpaceGrotesk-Regular',
    paddingVertical: 0,
  },

  // Filters
  filtersRow: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  filterChipActive: {
    backgroundColor: 'rgba(124,92,252,0.2)',
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontFamily: 'SpaceGrotesk-Medium',
    color: COLORS.textMuted,
  },
  filterChipTextActive: { color: COLORS.primary },

  // Todo cards
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 100,
    gap: SPACING.sm,
  },
  todoCard: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  todoCardGrad: {
    flexDirection: 'row',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  priorityBar: {
    width: 3,
    borderTopLeftRadius: BORDER_RADIUS.lg,
    borderBottomLeftRadius: BORDER_RADIUS.lg,
  },
  todoCardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  checkbox: {
    marginTop: 2,
  },
  checkboxFilled: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxEmpty: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
  },
  todoContent: { flex: 1, gap: 4 },
  todoTitle: {
    fontSize: 15,
    fontFamily: 'SpaceGrotesk-SemiBold',
    color: COLORS.textPrimary,
  },
  todoTitleDone: {
    textDecorationLine: 'line-through',
    color: COLORS.textMuted,
  },
  todoDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: 'SpaceGrotesk-Regular',
    lineHeight: 18,
  },
  todoMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginTop: 4,
  },
  subjectPill: {
    backgroundColor: 'rgba(124,92,252,0.15)',
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: 'rgba(124,92,252,0.3)',
  },
  subjectPillText: {
    fontSize: 10,
    color: COLORS.primary,
    fontFamily: 'SpaceGrotesk-Medium',
  },
  dueDatePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255,215,64,0.1)',
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
  },
  dueDateText: {
    fontSize: 10,
    color: COLORS.warning,
    fontFamily: 'SpaceGrotesk-Medium',
  },
  completedAt: {
    fontSize: 10,
    color: COLORS.success,
    fontFamily: 'SpaceGrotesk-Regular',
  },
  todoDeleteBtn: {
    padding: 4,
    opacity: 0.5,
  },

  // Empty
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
    gap: SPACING.md,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'SpaceGrotesk-SemiBold',
    color: COLORS.textSecondary,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
    fontFamily: 'SpaceGrotesk-Regular',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
  },
  modalGrad: {
    padding: SPACING.lg,
    paddingBottom: 40,
    gap: SPACING.md,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: SPACING.sm,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'SpaceGrotesk-Bold',
    color: COLORS.textPrimary,
  },
  modalInput: {
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
  modalTextArea: { height: 80, textAlignVertical: 'top' },
  modalLabel: {
    fontSize: 13,
    fontFamily: 'SpaceGrotesk-Medium',
    color: COLORS.textSecondary,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  priorityButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    paddingVertical: SPACING.sm,
  },
  priorityLabel: {
    fontSize: 12,
    fontFamily: 'SpaceGrotesk-SemiBold',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  cancelBtn: {
    flex: 1,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: COLORS.textSecondary,
    fontFamily: 'SpaceGrotesk-Medium',
    fontSize: 14,
  },
  addBtn: {
    flex: 2,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  addBtnGrad: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  addBtnText: {
    color: '#fff',
    fontFamily: 'SpaceGrotesk-SemiBold',
    fontSize: 14,
  },
});
