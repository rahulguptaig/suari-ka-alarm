import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAppStore } from '../store/useAppStore';
import { requestAlarmPermissions, setupAlarmActions } from '../services/alarmService';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { hydrate } = useAppStore();
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await hydrate();
        await requestAlarmPermissions();
        await setupAlarmActions();
      } catch (e) {
        console.log('Init error:', e);
      } finally {
        setAppReady(true);
        SplashScreen.hideAsync();
      }
    };
    init();
  }, []);

  if (!appReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#080818' }}>
      <StatusBar style="light" backgroundColor="#080818" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="alarm/[id]" options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="alarm/new" options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="syllabus/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="syllabus/add" options={{ presentation: 'modal', headerShown: false }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
