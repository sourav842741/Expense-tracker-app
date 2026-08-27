import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Animated,
  Vibration,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, Lock, Eye, EyeOff, Sparkles, KeyRound, Delete } from 'lucide-react-native';

import { useTheme } from '@/hooks/use-theme';
import { useAppStore } from '@/store/useAppStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { supabaseService } from '@/services/supabaseService';

export default function LoginScreen() {
  const router = useRouter();
  const { colors, typography, isDark } = useTheme();

  const login = useAppStore((state) => state.login);
  const setUserPlansAndCircles = useAppStore((state) => state.setUserPlansAndCircles);
  const continueAsGuest = useAppStore((state) => state.continueAsGuest);
  const loadDemoData = useAppStore((state) => state.loadDemoData);
  const pinCode = useAppStore((state) => state.pinCode);
  const user = useAppStore((state) => state.user);

  // Tab mode: 'pin' or 'email'
  const [loginMode, setLoginMode] = useState<'pin' | 'email'>('pin');

  // Email state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // PIN state
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState('');
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const triggerShake = () => {
    if (Platform.OS !== 'web') {
      Vibration.vibrate(200);
    }
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 12, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -12, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handlePinPress = async (digit: string) => {
    if (enteredPin.length < 4) {
      const nextPin = enteredPin + digit;
      setEnteredPin(nextPin);
      setPinError('');

      // When 4 digits are completed, automatically authenticate against database!
      if (nextPin.length === 4) {
        setLoading(true);
        try {
          // 1. Direct database check for account with this PIN
          const dbResult = await supabaseService.loginWithPin(nextPin);
          if (dbResult.success && dbResult.profile) {
            const prof = dbResult.profile;
            // Load user-specific commitments from cloud
            const [plans, circles, goals] = await Promise.all([
              supabaseService.getUserPaymentPlans(prof.id),
              supabaseService.getUserCircles(prof.id),
              supabaseService.getUserGoals(prof.id),
            ]);

            // Only override if cloud actually has plans; otherwise store restores from userVault
            if (plans.length > 0 || circles.length > 0 || goals.length > 0) {
              setUserPlansAndCircles(plans, circles, goals);
            }
            login(prof.email, prof.name, prof.id, prof.pin_code, prof.monthly_income, prof.available_balance);
            router.replace('/(tabs)');
            return;
          }

          // 2. Check local userVaults on device
          const vaults = useAppStore.getState().userVaults;
          const matchingVault = Object.values(vaults || {}).find(
            (v) => v.pinCode === nextPin
          );
          if (matchingVault) {
            login(
              matchingVault.user.email,
              matchingVault.user.name,
              matchingVault.user.id,
              matchingVault.pinCode || undefined
            );
            router.replace('/(tabs)');
            return;
          }

          // 3. Check current device PIN or default 1234
          if (nextPin === (pinCode || '1234')) {
            login(user.email, user.name, user.id, pinCode || '1234');
            router.replace('/(tabs)');
            return;
          }

          // Incorrect PIN
          triggerShake();
          setPinError(dbResult.message || 'Incorrect PIN. No registered user found.');
          setTimeout(() => {
            setEnteredPin('');
          }, 500);
        } catch (err) {
          triggerShake();
          setPinError('Verification error. Please try again.');
          setEnteredPin('');
        } finally {
          setLoading(false);
        }
      }
    }
  };

  const handlePinDelete = () => {
    if (enteredPin.length > 0) {
      setEnteredPin(enteredPin.slice(0, -1));
      setPinError('');
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      if (Platform.OS === 'web') {
        window.alert('Please enter your email and password.');
      } else {
        Alert.alert('Required Fields', 'Please enter your email and password.');
      }
      return;
    }

    setLoading(true);
    try {
      // 1. Direct database validation against Supabase profiles!
      const dbResult = await supabaseService.validateAndLogin(email.trim(), password);

      if (!dbResult.success) {
        if (Platform.OS === 'web') {
          window.alert(dbResult.message || 'Login failed.');
        } else {
          Alert.alert('Login Notice', dbResult.message || 'Login failed.');
        }
        setLoading(false);
        return;
      }

      const prof = dbResult.profile;

      // 2. Fetch THAT specific user's plans, circles, goals (Data Isolation)
      const [plans, circles, goals] = await Promise.all([
        supabaseService.getUserPaymentPlans(prof.id),
        supabaseService.getUserCircles(prof.id),
        supabaseService.getUserGoals(prof.id),
      ]);

      if (plans.length > 0 || circles.length > 0 || goals.length > 0) {
        setUserPlansAndCircles(plans, circles, goals);
      }

      // 3. Set authenticated user in store (restores from vault if cloud is empty)
      login(prof.email, prof.name, prof.id, prof.pin_code, prof.monthly_income, prof.available_balance);
      router.replace('/(tabs)');
    } catch (err: any) {
      if (Platform.OS === 'web') {
        window.alert('Connection error. Please try again.');
      } else {
        Alert.alert('Error', 'Connection error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    loadDemoData();
    continueAsGuest();
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Brand Header */}
          <View style={styles.header}>
            <View style={[styles.logoIcon, { backgroundColor: colors.accent }]}>
              <Sparkles size={28} color={colors.accentInverted} />
            </View>
            <Text style={[styles.appName, { color: colors.textPrimary }]}>MoneyCircle</Text>
            <Text style={[styles.tagline, { color: colors.textSecondary }]}>
              Smart Financial Commitments & Shared Circles
            </Text>
          </View>

          {/* Form Card */}
          <View
            style={[
              styles.formCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.formTitle, { color: colors.textPrimary }]}>Welcome Back</Text>
            <Text style={[styles.formSubtitle, { color: colors.textSecondary }]}>
              Sign in to manage your commitments & savings
            </Text>

            {/* Mode Switcher Tabs: PIN vs Email */}
            <View style={[styles.tabContainer, { backgroundColor: colors.surfaceSecondary }]}>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  loginMode === 'pin' && { backgroundColor: colors.card, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
                ]}
                onPress={() => {
                  setLoginMode('pin');
                  setEnteredPin('');
                  setPinError('');
                }}
              >
                <KeyRound size={16} color={loginMode === 'pin' ? colors.accent : colors.textSecondary} style={{ marginRight: 6 }} />
                <Text
                  style={[
                    styles.tabText,
                    { color: loginMode === 'pin' ? colors.textPrimary : colors.textSecondary, fontWeight: loginMode === 'pin' ? '700' : '500' },
                  ]}
                >
                  4-Digit PIN
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tabButton,
                  loginMode === 'email' && { backgroundColor: colors.card, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
                ]}
                onPress={() => setLoginMode('email')}
              >
                <Mail size={16} color={loginMode === 'email' ? colors.accent : colors.textSecondary} style={{ marginRight: 6 }} />
                <Text
                  style={[
                    styles.tabText,
                    { color: loginMode === 'email' ? colors.textPrimary : colors.textSecondary, fontWeight: loginMode === 'email' ? '700' : '500' },
                  ]}
                >
                  Email & Pass
                </Text>
              </TouchableOpacity>
            </View>

            {loginMode === 'pin' ? (
              /* 4-Digit Quick PIN Keypad Section */
              <View style={styles.pinSection}>
                <Text style={[styles.pinInstruction, { color: colors.textSecondary }]}>
                  {pinCode ? 'Enter your 4-digit PIN to sign in automatically' : 'Enter 4-digit PIN (Default: 1234)'}
                </Text>

                {/* Dots display with shake */}
                <Animated.View style={[styles.dotsRow, { transform: [{ translateX: shakeAnim }] }]}>
                  {[0, 1, 2, 3].map((idx) => {
                    const filled = enteredPin.length > idx;
                    return (
                      <View
                        key={idx}
                        style={[
                          styles.dot,
                          {
                            borderColor: pinError ? colors.danger : filled ? colors.accent : colors.border,
                            backgroundColor: filled ? (pinError ? colors.danger : colors.accent) : 'transparent',
                          },
                        ]}
                      />
                    );
                  })}
                </Animated.View>

                {pinError ? (
                  <Text style={[styles.errorText, { color: colors.danger }]}>{pinError}</Text>
                ) : null}

                {/* Keypad Grid */}
                <View style={styles.keypadGrid}>
                  {[
                    ['1', '2', '3'],
                    ['4', '5', '6'],
                    ['7', '8', '9'],
                    ['', '0', 'del'],
                  ].map((row, rowIdx) => (
                    <View key={rowIdx} style={styles.keypadRow}>
                      {row.map((btn, btnIdx) => {
                        if (btn === '') {
                          return <View key={btnIdx} style={styles.keypadKeyEmpty} />;
                        }
                        if (btn === 'del') {
                          return (
                            <TouchableOpacity
                              key={btnIdx}
                              onPress={handlePinDelete}
                              style={[styles.keypadKey, { backgroundColor: colors.surfaceSecondary }]}
                              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                              <Delete size={20} color={colors.textPrimary} />
                            </TouchableOpacity>
                          );
                        }
                        return (
                          <TouchableOpacity
                            key={btnIdx}
                            onPress={() => handlePinPress(btn)}
                            style={[styles.keypadKey, { backgroundColor: colors.surfaceSecondary }]}
                            activeOpacity={0.6}
                          >
                            <Text style={[styles.keyNumber, { color: colors.textPrimary }]}>{btn}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              /* Email & Password Form Section */
              <View>
                <Input
                  label="EMAIL ADDRESS"
                  placeholder="name@example.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  icon={<Mail size={18} color={colors.textSecondary} />}
                />

                <Input
                  label="PASSWORD"
                  placeholder="••••••••"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  icon={<Lock size={18} color={colors.textSecondary} />}
                  rightElement={
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      {showPassword ? (
                        <EyeOff size={18} color={colors.textSecondary} />
                      ) : (
                        <Eye size={18} color={colors.textSecondary} />
                      )}
                    </TouchableOpacity>
                  }
                />

                <Button
                  title={loading ? 'Signing In...' : 'Sign In with Email'}
                  variant="primary"
                  onPress={handleLogin}
                  loading={loading}
                  style={{ marginTop: 10, marginBottom: 12 }}
                />
              </View>
            )}

            <View style={[styles.dividerRow, { marginVertical: 14 }]}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.textSecondary }]}>OR</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>

            <Button
              title="Explore as Demo User"
              variant="secondary"
              onPress={handleDemoLogin}
            />
          </View>

          {/* Footer Signup Link */}
          <View style={styles.footerRow}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              Don't have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
              <Text style={[styles.signupLink, { color: colors.accent }]}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    justifyContent: 'center',
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  appName: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
  formCard: {
    padding: 22,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 13,
    marginBottom: 18,
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 12,
    marginBottom: 18,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabText: {
    fontSize: 13,
  },
  pinSection: {
    alignItems: 'center',
  },
  pinInstruction: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
    justifyContent: 'center',
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  keypadGrid: {
    width: '100%',
    maxWidth: 280,
    gap: 10,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  keypadKey: {
    width: 72,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keypadKeyEmpty: {
    width: 72,
    height: 52,
  },
  keyNumber: {
    fontSize: 20,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: 12,
    fontSize: 12,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
  },
  signupLink: {
    fontSize: 14,
    fontWeight: '700',
  },
});
