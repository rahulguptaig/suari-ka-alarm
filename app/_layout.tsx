import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAppStore } from '../store/useAppStore';
import { requestAlarmPermissions, setupAlarmActions } from '../services/alarmService';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { hydrate } = useAppStore();
  const [appReady, setAppReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const router = useRouter();
  const segments = useSegments();

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

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!appReady) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!session && !inAuthGroup) {
      // Redirect to the sign-in page.
      router.replace('/auth');
    } else if (session && inAuthGroup) {
      // Redirect away from the sign-in page.
      router.replace('/(tabs)');
    }
  }, [session, appReady, segments]);

  if (!appReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#080818' }}>
      <StatusBar style="light" backgroundColor="#080818" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="alarm/[id]" options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="alarm/new" options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="syllabus/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="syllabus/add" options={{ presentation: 'modal', headerShown: false }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
