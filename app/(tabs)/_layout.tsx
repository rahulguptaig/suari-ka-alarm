import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface TabIconProps {
  name: string;
  focused: boolean;
  iconName: string;
  library?: 'ionicons' | 'material';
}

function TabIcon({ name, focused, iconName, library = 'ionicons' }: TabIconProps) {
  const IconComponent = library === 'material' ? MaterialCommunityIcons : Ionicons;

  return (
    <View style={[styles.tabIcon, focused && styles.tabIconFocused]}>
      <IconComponent
        name={iconName as any}
        size={22}
        color={focused ? COLORS.primary : COLORS.textMuted}
      />
      <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>
        {name}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Alarm',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="Alarm" focused={focused} iconName={focused ? 'alarm' : 'alarm-outline'} />
          ),
        }}
      />
      <Tabs.Screen
        name="suari"
        options={{
          title: 'Suari',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name="Suari"
              focused={focused}
              iconName={focused ? 'robot' : 'robot-outline'}
              library="material"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="todo"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name="Tasks"
              focused={focused}
              iconName={focused ? 'checkmark-circle' : 'checkmark-circle-outline'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="syllabus"
        options={{
          title: 'Study',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name="Study"
              focused={focused}
              iconName={focused ? 'book' : 'book-outline'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name="Settings"
              focused={focused}
              iconName={focused ? 'settings' : 'settings-outline'}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#0D0D22',
    borderTopColor: 'rgba(124, 92, 252, 0.2)',
    borderTopWidth: 1,
    height: 70,
    paddingBottom: 10,
    paddingTop: 6,
    shadowColor: '#7C5CFC',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 20,
  },
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tabIconFocused: {
    backgroundColor: 'rgba(124, 92, 252, 0.12)',
  },
  tabLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  tabLabelFocused: {
    color: COLORS.primary,
  },
});
