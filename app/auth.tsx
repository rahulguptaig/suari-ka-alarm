import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) Alert.alert('Login Failed', error.message);
    setLoading(false);
  }

  async function signUpWithEmail() {
    setLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) Alert.alert('Signup Failed', error.message);
    else if (!session) Alert.alert('Success', 'Please check your inbox for email verification!');
    setLoading(false);
  }

  const handleAuth = () => {
    if (isLogin) signInWithEmail();
    else signUpWithEmail();
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#12122A', '#080818']} style={StyleSheet.absoluteFillObject} />
      
      <View style={styles.header}>
        <Text style={styles.title}>Suari Ka Alarm</Text>
        <Text style={styles.subtitle}>{isLogin ? 'Login to continue' : 'Create an account'}</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            onChangeText={(text) => setEmail(text)}
            value={email}
            placeholder="email@address.com"
            placeholderTextColor={COLORS.textMuted}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            onChangeText={(text) => setPassword(text)}
            value={password}
            secureTextEntry={true}
            placeholder="Password"
            placeholderTextColor={COLORS.textMuted}
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity 
          style={[styles.authButton, loading && styles.authButtonDisabled]} 
          disabled={loading}
          onPress={handleAuth}
        >
          <LinearGradient colors={['#7C5CFC', '#5B3FD9']} style={styles.authButtonGrad}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.authButtonText}>{isLogin ? 'Sign In' : 'Sign Up'}</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.switchButton}
          onPress={() => setIsLogin(!isLogin)}
        >
          <Text style={styles.switchButtonText}>
            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.xl,
    backgroundColor: '#080818',
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl * 2,
  },
  title: {
    fontSize: 32,
    fontFamily: 'SpaceGrotesk-Bold',
    color: '#fff',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'SpaceGrotesk-Medium',
    color: COLORS.textMuted,
  },
  formContainer: {
    gap: SPACING.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 56,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontFamily: 'SpaceGrotesk-Medium',
    fontSize: 16,
  },
  authButton: {
    marginTop: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  authButtonDisabled: {
    opacity: 0.7,
  },
  authButtonGrad: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'SpaceGrotesk-Bold',
  },
  switchButton: {
    marginTop: SPACING.lg,
    alignItems: 'center',
  },
  switchButtonText: {
    color: COLORS.textMuted,
    fontFamily: 'SpaceGrotesk-Medium',
    fontSize: 14,
  },
});
